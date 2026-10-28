# Skill-uri de proiect

Copiate în repo ca toate cele 6 instanțe Claude să aibă aceleași versiuni. Nu le edita aici decât cu motiv notat; la actualizare, ia tot setul din același commit, fiindcă skill-urile se apelează între ele.

| Sursă | Commit / versiune | Licență | Skill-uri |
|---|---|---|---|
| https://github.com/mattpocock/skills | `59db609`, 27 oct 2026 | MIT (`LICENSE-mattpocock-skills`) | grilling, grill-me, grill-with-docs, domain-modeling, setup-matt-pocock-skills, triage, to-spec, to-tickets, implement, implement-spec, tdd, codebase-design, diagnosing-bugs, research, prototype, pr, improve-codebase-architecture, handoff, to-questionnaire, writing-for-agents |
| https://github.com/nextlevelbuilder/ui-ux-pro-max-skill | instalat 25 oct 2026 | vezi repo-ul sursă | ui-ux-pro-max (fără `scripts/tests`) |

Excluse intenționat din mattpocock/skills: `code-review` (are același nume ca `/code-review` din Claude Code), `wayfinder` și `in-progress/*` (prea mult pentru un hackathon), `git-guardrails-claude-code` (blochează `git push`, de care agenții au nevoie). Folderele `agents/` (configurație Codex) nu au fost copiate.

Precedența față de regulile proiectului: `CLAUDE.md`, secțiunea „Skill-uri”.
