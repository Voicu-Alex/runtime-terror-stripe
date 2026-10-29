"""Verifică poller-ul pe Linux, fără rețea, servicii sau fișiere de producție."""
import io
import os
from pathlib import Path
import subprocess
import tarfile
import tempfile

SOURCE = Path(__file__).with_name("poll.sh").read_text()
SHA = "a" * 40
TOOLS = r'''#!/usr/bin/python3
import os, pathlib, sys
tool = pathlib.Path(sys.argv[0]).name
args = sys.argv[1:]
if tool == 'git':
    if args[0] == '-C': args = args[2:]
    if args[0] == 'ls-remote': print('a' * 40 + '\trefs/heads/main')
    elif args[0] == 'init': pathlib.Path(args[-1], '.git').mkdir(parents=True)
    elif args[0] == 'rev-parse': print('a' * 40)
    elif args[0] == 'archive': sys.stdout.buffer.write(pathlib.Path(os.environ['TEST_ARCHIVE']).read_bytes())
    elif args[0] == 'show':
        print('mockup/descriere.html index.html' if args[-1].endswith('manifest.txt') else '<html>new</html>')
elif tool in ('systemctl', 'runuser'):
    with open(os.environ['TEST_LOG'], 'a') as f: f.write(tool + '\n')
    if tool == 'runuser': sys.exit(int(os.environ['TEST_BUILD_STATUS']))
elif tool == 'node': sys.exit(int(os.environ['TEST_HEALTH_STATUS']))
'''


def scenario(build_status=0, health_status=0):
    with tempfile.TemporaryDirectory(prefix="descriere-poll-test-") as tmp:
        root = Path(tmp)
        app, web, state, tools = (root / n for n in ("app", "web", "state", "bin"))
        previous = app / "releases" / "previous"
        previous.mkdir(parents=True)
        (app / "current").symlink_to(previous)
        web.mkdir()
        (web / "index.html").write_text("old")
        tools.mkdir()
        for tool in ("git", "runuser", "systemctl", "node", "chown"):
            file = tools / tool
            file.write_text(TOOLS)
            file.chmod(0o755)
        envfile = root / "protected-env"
        envfile.write_text("unchanged")
        archive = root / "source.tar"
        with tarfile.open(archive, "w") as tar:
            entry = tarfile.TarInfo("source.txt")
            entry.size = 4
            tar.addfile(entry, io.BytesIO(b"code"))
            # Un fișier de metadate venit din Git nu poate suprascrie secretele printr-o legătură.
            link = tarfile.TarInfo(".deploy-sha")
            link.type = tarfile.SYMTYPE
            link.linkname = str(envfile)
            tar.addfile(link)
        config = root / "config"
        config.write_text(f"NODE_BIN={tools}\n")
        script = SOURCE.replace("/etc/descriere-deploy/config", str(config))
        script = script.replace("/var/lib/descriere-deploy", str(state))
        script = script.replace("/opt/descriere-app", str(app))
        script = script.replace("/var/www/descriere", str(web))
        script = script.replace("/etc/descriere-app/.env.local", str(envfile))
        poll = root / "poll.sh"
        poll.write_text(script)
        log = root / "calls"
        env = dict(os.environ, PATH=f"{tools}:{os.environ['PATH']}",
                   TEST_ARCHIVE=str(archive), TEST_LOG=str(log),
                   TEST_BUILD_STATUS=str(build_status), TEST_HEALTH_STATUS=str(health_status))
        run = lambda: subprocess.run(["bash", str(poll)], env=env, capture_output=True, text=True)
        result = run()
        assert envfile.read_text() == "unchanged", result.stderr
        release = app / "releases" / SHA
        if build_status or health_status:
            assert result.returncode != 0, result.stdout
            assert (app / "current").resolve() == previous
            assert not release.exists(), "candidatul eșuat trebuie curățat"
            assert (web / "index.html").read_text() == "old"
            if health_status:
                assert log.read_text().count("systemctl\n") == 2, "serviciul precedent trebuie repornit"
        else:
            assert result.returncode == 0, result.stderr
            assert (app / "current").resolve() == release
            assert (release / ".deploy-sha").read_text().strip() == SHA
            assert (web / "version.txt").read_text().strip() == SHA
            assert "new" in (web / "index.html").read_text()
            calls = log.read_text()
            second = run()
            assert second.returncode == 0, second.stderr
            assert log.read_text() == calls, "același commit nu trebuie reconstruit"
            env["FORCE"] = "1"
            forced = run()
            assert forced.returncode == 0, forced.stderr
            current = (app / "current").resolve()
            assert current != release and release.exists(), "FORCE trebuie să păstreze versiunea precedentă"
            assert (current / ".deploy-sha").read_text().strip() == SHA
            assert len(list((app / "releases").iterdir())) == 2
            assert envfile.read_text() == "unchanged"
        print(f"PASS: build={build_status}, health={health_status}")


scenario()
scenario(build_status=13)
scenario(health_status=1)
