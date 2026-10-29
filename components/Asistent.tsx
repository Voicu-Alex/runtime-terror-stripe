"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATALOG } from "@/lib/catalog";
import {
  inProfil,
  intrebareaCurenta,
  porneste,
  raspundeLiber,
  raspundeRapid,
  SAR_PESTE,
  sarPeste,
  scoate,
  type Extrasa,
  type RaspunsProfil,
  type Stare,
} from "@/lib/asistent";
import { incarcaProfil, PROFIL_GOL, salveazaProfil, scoateDinProfil, type Profil } from "@/lib/profil";
import { aziISO, potriveste } from "@/lib/potrivire";
import type { TagId } from "@/lib/taguri";
import { etichetaTagL } from "@/lib/i18n";
import { useLimba } from "@/components/Limba";
import { FormularProfil } from "@/components/FormularProfil";

type Props = { mod: "profil" } | { mod: "lege"; id: string; titlu: string; onInchide: () => void };

export default function Asistent(props: Props) {
  return props.mod === "profil" ? <AsistentProfil /> : <AsistentLege {...props} />;
}

/** Mod „lege”: doar carcasa dialogului; conținutul vine într-o felie următoare. */
function AsistentLege({ titlu, onInchide }: { id: string; titlu: string; onInchide: () => void }) {
  const { t } = useLimba();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onInchide}
      className="m-auto w-[min(92vw,34rem)] rounded-2xl border border-v3-line bg-v3-card p-5 text-v3-ink backdrop:bg-black/50"
    >
      <h2 className="m-0 mb-3 font-head text-xl font-extrabold">{titlu}</h2>
      <p className="m-0 mb-4 text-[15px] text-v3-ink-2">{t("Asistentul pentru această lege vine în curând.")}</p>
      <button type="button" onClick={onInchide} className="min-h-11 rounded-[10px] bg-v3-ink px-4 font-bold text-v3-on-ink">
        {t("Închide")}
      </button>
    </dialog>
  );
}

function AsistentProfil() {
  const router = useRouter();
  const { t, limba } = useLimba();
  const [stare, setStare] = useState<Stare>(() => porneste());
  const [formular, setFormular] = useState(false);
  const [text, setText] = useState("");
  const [seTrimite, setSeTrimite] = useState(false);
  const [alegeri, setAlegeri] = useState<string[]>([]);
  const [baza, setBaza] = useState<Profil>(PROFIL_GOL);
  const sfarsit = useRef<HTMLDivElement>(null);

  useEffect(() => setBaza(incarcaProfil()), []);

  const intrebare = intrebareaCurenta(stare);
  const nrActe = useMemo(() => potriveste(inProfil(stare, baza), CATALOG, aziISO()).length, [stare, baza]);

  useEffect(() => {
    if (stare.mesaje.length > 1) sfarsit.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [stare.mesaje.length]);

  /** Aplică o stare nouă și ține profilul salvat pe dispozitiv: ce s-a adăugat sau scos rămâne și dacă pleci din mijloc. */
  function aplica(nou: Stare, scos?: TagId) {
    let p = incarcaProfil();
    if (scos) p = scoateDinProfil(p, scos);
    salveazaProfil(inProfil(nou, p));
    if (scos) setBaza(scoateDinProfil(baza, scos));
    setStare(nou);
    setAlegeri([]);
  }

  function atinge(eticheta: string) {
    if (!intrebare) return;
    const r = intrebare.raspunsuri.find((x) => x.eticheta === eticheta);
    if (!r) return;
    if (!intrebare.multiple) return aplica(raspundeRapid(stare, [r]));
    setAlegeri((a) => (a.includes(eticheta) ? a.filter((x) => x !== eticheta) : [...a, eticheta]));
  }

  function gata() {
    if (!intrebare) return;
    aplica(raspundeRapid(stare, intrebare.raspunsuri.filter((r) => alegeri.includes(r.eticheta))));
  }

  async function trimite() {
    const mesaj = text.trim();
    if (!mesaj || seTrimite || stare.terminat) return;
    setSeTrimite(true);
    let etichete: Extrasa[] = [];
    try {
      const r = await fetch("/api/asistent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mod: "profil", text: mesaj, pas: stare.pas, taguri: stare.extrase.map((e) => e.tag) }),
      });
      if (r.ok) {
        const json = (await r.json()) as RaspunsProfil;
        if (Array.isArray(json.etichete)) etichete = json.etichete;
      }
    } catch {
      etichete = [];
    }
    setText("");
    setSeTrimite(false);
    aplica(raspundeLiber(stare, mesaj, etichete));
  }

  function vezi() {
    salveazaProfil(inProfil(stare, incarcaProfil()));
    router.push("/flux");
  }

  const btnLink = "min-h-11 px-1 text-[14.5px] font-bold text-v3-ink underline underline-offset-2";

  return (
    <div className="space-y-3">
      <div className="sticky top-12 z-10 -mx-4 flex items-center justify-between gap-2 border-b border-v3-line bg-[var(--fundal)] px-4">
        <button type="button" onClick={() => setFormular((f) => !f)} aria-pressed={formular} className={btnLink}>
          {formular ? t("Înapoi la conversație") : t("Prefer formularul")}
        </button>
        {!formular && (
          <>
            <span className="text-[13px] text-v3-ink-2">
              {t("pasul")} {Math.min(stare.pas, 6)} {t("din 6")}
            </span>
            <button type="button" onClick={() => aplica(sarPeste(stare))} disabled={stare.terminat} className={`${btnLink} disabled:opacity-40`}>
              {t(SAR_PESTE)}
            </button>
          </>
        )}
      </div>

      {formular && <FormularProfil />}

      <div hidden={formular} className="space-y-3">
        <div className="rounded-2xl bg-v3-band px-4 py-3 text-[15px] text-v3-band-ink" aria-live="polite">
          {nrActe === 0 ? (
            <b>{t("Până acum: niciun act")}</b>
          ) : (
            <>
              {t("Până acum:")} <b className="text-lg">{nrActe}</b> {t(nrActe === 1 ? "act te privește" : "acte te privesc")}
            </>
          )}
        </div>

        {stare.mesaje.map((m, i) =>
          m.rol === "etichete" ? (
            <ul key={i} className="m-0 flex list-none flex-wrap gap-2 p-0">
              {m.etichete.map((e) => {
                const eticheta = etichetaTagL(limba, e.tag);
                return (
                  <li
                    key={e.tag}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-v3-ink bg-v3-card py-1 pr-1 pl-3 text-[14px]"
                  >
                    <b className="text-v3-ink">{eticheta}</b>
                    {e.din && (
                      <span className="text-[12px] text-v3-ink-2">
                        {t("din")} «{e.din}»
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`${t("Scoate")} ${eticheta}`}
                      onClick={() => aplica(scoate(stare, e.tag), e.tag)}
                      className="grid size-8 place-items-center rounded-full text-base font-bold text-v3-ink-2 hover:text-v3-ink"
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p
              key={i}
              className={`m-0 max-w-[85%] rounded-2xl border px-4 py-2.5 text-[15.5px] leading-snug ${
                m.rol === "om"
                  ? "ml-auto border-v3-ink bg-v3-ink text-v3-on-ink"
                  : "border-v3-line bg-v3-card text-v3-ink"
              }`}
            >
              {m.rol === "asistent" ? t(m.text) : m.text}
            </p>
          ),
        )}

        {intrebare && !stare.terminat && (
          <div className="flex flex-wrap gap-2">
            {intrebare.raspunsuri.map((r) => {
              const pe = alegeri.includes(r.eticheta);
              return (
                <button
                  key={r.eticheta}
                  type="button"
                  aria-pressed={intrebare.multiple ? pe : undefined}
                  onClick={() => atinge(r.eticheta)}
                  className={`min-h-11 rounded-full border-2 border-v3-ink px-4 text-[15px] font-bold ${
                    pe ? "bg-v3-ink text-v3-on-ink" : "bg-v3-card text-v3-ink"
                  }`}
                >
                  {t(r.eticheta)}
                </button>
              );
            })}
            {intrebare.multiple && (
              <button type="button" onClick={gata} className="min-h-11 rounded-full bg-v3-ink px-5 text-[15px] font-bold text-v3-on-ink">
                {t("Gata")}
              </button>
            )}
          </div>
        )}

        {stare.terminat && (
          <div className="rounded-2xl border-2 border-v3-ink bg-v3-card p-4">
            <p className="m-0 mb-1 font-head text-lg font-extrabold text-v3-ink">
              {t("Am găsit")} {nrActe} {t(nrActe === 1 ? "act care te privește." : "acte care te privesc.")}
            </p>
            <p className="m-0 mb-3 text-[14px] text-v3-ink-2">{t("Le poți vedea pe toate, cu link la articolul din lege.")}</p>
            <button type="button" onClick={vezi} className="min-h-12 w-full rounded-[10px] bg-v3-ink px-4 font-bold text-v3-on-ink">
              {t("Vezi ce te privește")}
            </button>
          </div>
        )}

        <div ref={sfarsit} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void trimite();
          }}
          className="sticky bottom-0 -mx-4 flex gap-2 bg-[var(--fundal)] px-4 py-3"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={seTrimite || stare.terminat}
            placeholder={t("Scrie aici…")}
            aria-label={t("Scrie aici…")}
            className="min-h-12 min-w-0 flex-1 rounded-full border border-v3-ink-2 bg-v3-card px-4 text-[15px] text-v3-ink disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={seTrimite || stare.terminat || !text.trim()}
            aria-label={t("Trimite")}
            className="grid size-12 shrink-0 place-items-center rounded-full bg-v3-ink text-lg font-bold text-v3-on-ink disabled:opacity-40"
          >
            <span aria-hidden="true">↑</span>
          </button>
        </form>
      </div>
    </div>
  );
}
