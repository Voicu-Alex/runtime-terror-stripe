"use client";

import { useId, useRef, useState } from "react";
import type { Potrivire } from "@/lib/potrivire";
import type { Valori } from "@/lib/profil";
import { etichetaTag } from "@/lib/taguri";
import { ETICHETA_STARE, cuSemn, cuTracking, dataScurta, mii, vedere, zile, type StareCard } from "@/lib/card";

// Aspectul urmează rândul din lista „Toate actele care te privesc” din mockup/v3/index.html?v=f.
// Cele 3 niveluri din issue #3:
//   Zero   = rândul închis: titlul spune totul, suma, termenul (ADR 0001)
//   Curios = rândul deschis: „Pentru tine”, de ce te privește, ce poți face
//   Expert = „Arată-mi legea”: actul, MO, articolul, linkul la Portal Legislativ

const PILL: Record<StareCard, string> = {
  proiect: "border-dashed border-v3-ink-2 bg-white text-v3-ink-2",
  adoptat: "border-v3-accent bg-v3-accent-soft text-v3-accent",
  in_vigoare: "border-v3-pos bg-v3-pos-soft text-v3-pos",
  termen_depasit: "border-[#C3CAC2] bg-v3-past-bg text-v3-past",
};

const eTODO = (s: string) => !s || s.trim() === "TODO";

export default function CardSchimbare({ p, valori }: { p: Potrivire; valori: Valori }) {
  const [deschis, setDeschis] = useState(false);
  const [lege, setLege] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const uid = useId();

  const s = p.schimbare;
  const v = vedere(p, valori);
  const a = s.actiuni.find((x) => x.termen) ?? s.actiuni[0];
  const dep = v.termen?.depasit;

  return (
    <li id={`c-${s.id}`} className="border-b border-v3-line">
      {/* Zero */}
      <button
        type="button"
        aria-expanded={deschis}
        aria-controls={`${uid}-d`}
        onClick={() => setDeschis(!deschis)}
        className="grid w-full grid-cols-[1fr_auto] items-start gap-x-3.5 gap-y-1.5 py-4 text-left"
      >
        <span className="col-start-1 text-[11.5px] font-extrabold tracking-[.1em] text-v3-accent uppercase">{v.kicker}</span>
        <span
          className={`col-start-2 row-span-2 row-start-1 text-right font-sans text-xl font-extrabold tracking-[-.02em] whitespace-nowrap tabular-nums lining-nums ${
            dep ? "text-v3-past" : v.suma === null || v.suma === 0 ? "text-v3-ink" : v.suma < 0 ? "text-v3-neg" : "text-v3-pos"
          }`}
        >
          {v.suma === null ? "—" : cuSemn(v.suma)}
          <small className="block text-[12.5px] font-semibold tracking-normal text-v3-ink-2">
            {v.suma === null ? "de calculat" : v.suma === 0 ? "lei/lună acum" : "lei/lună"}
          </small>
        </span>
        <span className={`col-start-1 text-[17px] leading-[1.3] font-bold ${dep ? "text-v3-past" : "text-v3-ink"}`}>{v.titlu}</span>
        {v.termen && (
          <span
            className={`col-span-2 text-[15px] font-bold ${dep ? "text-v3-past" : v.termen.urgent ? "text-v3-urg" : "text-v3-ink"}`}
          >
            {dep ? `termen depășit: ${v.termen.text}` : `până la ${v.termen.text} · mai ai ${zile(v.termen.zile)}`}
            {v.termen.urgent && (
              <span className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-v3-urg px-2.5 py-0.5 align-[1px] text-[12.5px] text-white">
                <span aria-hidden="true" className="size-[7px] rounded-full bg-white" />
                urgent
              </span>
            )}
          </span>
        )}
        <span className="col-span-2 flex flex-wrap items-center gap-1.5 text-[12.5px] text-v3-ink-2">
          <span className={`rounded-full border px-[9px] py-px font-semibold ${PILL[v.stare]}`}>{ETICHETA_STARE[v.stare]}</span>
          <span>{v.act}</span>
        </span>
      </button>

      {/* Curios */}
      {deschis && (
        <div id={`${uid}-d`} className="pb-4">
          <p className="m-0 mb-2.5 max-w-[60ch] text-[15px] text-v3-ink">
            <b>Pentru tine:</b> {s.niveluri.zero}
            {!eTODO(s.niveluri.curios) && <> {s.niveluri.curios}</>}
          </p>
          {s.estimare && v.suma !== null && v.suma !== 0 && (
            <p className="m-0 mb-2.5 text-[13.5px] text-v3-ink-2">Suma e calculul nostru pe profilul tău, nu o cifră scrisă în lege.</p>
          )}
          {v.cere && <p className="m-0 mb-2.5 text-[13.5px] font-semibold text-v3-ink">Ca să calculăm suma: {v.cere}.</p>}
          <p className="m-0 mb-3 text-[13.5px] text-v3-ink-2">
            Te privește ca:{" "}
            {p.taguri_comune.map((t) => (
              <span key={t} className="mr-1 mb-1 inline-block rounded-lg border border-v3-line bg-white px-[9px] py-0.5 text-[13px] font-semibold">
                {etichetaTag(t)}
              </span>
            ))}
          </p>

          {a && (
            <div
              className={`mb-3 rounded-[10px] p-3 ${
                dep ? "bg-v3-past-bg text-v3-past" : v.termen?.urgent ? "bg-v3-urg-soft shadow-[inset_3px_0_0_var(--color-v3-urg)]" : "bg-v3-act"
              }`}
            >
              <p className={`m-0 text-[13px] font-bold tracking-[.02em] ${dep ? "text-v3-past" : "text-v3-ink-2"}`}>
                {dep ? `Termen depășit: ${v.termen!.text}` : a.termen ? `Ce poți face până la ${dataScurta(a.termen)}` : "Ce poți face, oricând:"}
              </p>
              <p className="mt-0.5 mb-1.5 font-semibold">{a.text}</p>
              {v.economieAn !== null && !dep && (
                <p className="m-0 mb-1.5 text-[14.5px]">
                  Dacă o faci, păstrezi până la <b className="whitespace-nowrap">{mii(v.economieAn)} lei/an</b>.
                </p>
              )}
              {a.one_click && !dep && (
                // Aici intră mai târziu comisionul pe client redirecționat (issue #4, Haggy).
                // Ordinea fixă: link oficial, comparator, apoi partener marcat vizibil.
                <a
                  href={cuTracking(a.one_click, s.id)}
                  target="_blank"
                  rel="noopener"
                  className="mt-1.5 inline-flex min-h-[46px] items-center gap-2 rounded-[10px] bg-v3-ink px-[18px] font-bold text-white no-underline"
                >
                  Compară oferte
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-none stroke-current stroke-2">
                    <path d="M5 11 11 5M6 5h5v5" />
                  </svg>
                  <span className="sr-only">(se deschide într-un tab nou)</span>
                </a>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-expanded={lege}
              aria-controls={`${uid}-e`}
              onClick={() => setLege(!lege)}
              className="min-h-11 rounded-[10px] border border-v3-line bg-white px-4 text-sm font-semibold text-v3-ink aria-expanded:border-v3-ink"
            >
              Arată-mi legea
            </button>
            {s.profesionist && (
              <button
                type="button"
                onClick={() => dialog.current?.showModal()}
                className="min-h-11 rounded-[10px] border border-v3-line bg-white px-4 text-sm font-semibold text-v3-ink"
              >
                Vorbește cu un {s.profesionist}
              </button>
            )}
          </div>

          {/* Expert */}
          {lege && (
            <div id={`${uid}-e`} className="mt-3 rounded-[10px] border border-v3-line bg-white p-3 text-sm">
              <h5 className="m-0 mb-1 text-xs font-bold tracking-[.05em] text-v3-ink-2 uppercase">Sursa legală</h5>
              <p className="m-0 mb-1 font-semibold">
                {s.act} · {s.mo_ref}
              </p>
              <p className="m-0 mb-1 font-medium text-v3-ink-2">{s.articol}</p>
              {!eTODO(s.niveluri.expert) && <p className="m-0 mb-1 text-v3-ink-2">{s.niveluri.expert}</p>}
              <a href={s.sursa_url} target="_blank" rel="noopener" className="flex min-h-11 items-center font-semibold text-v3-accent">
                Textul legii pe Portal Legislativ {"↗︎"}
              </a>
              {s.sursa_explicativa && (
                <a href={s.sursa_explicativa} target="_blank" rel="noopener" className="flex min-h-11 items-center font-semibold text-v3-accent">
                  Explicație (ANAF / presă) {"↗︎"}
                </a>
              )}
              <span className="block text-[12.5px] text-v3-ink-2">
                {s.verificat_la ? `verificat la ${dataScurta(s.verificat_la)}` : "neverificat încă"}
                {s.incredere === "scazuta" && " · sursă de încredere scăzută"}
              </span>
            </div>
          )}

          <p className="mt-3 mb-0 text-[12.5px] text-v3-ink-2">
            {s.verificat_la ? `Rezumat generat cu AI · verificat la ${dataScurta(s.verificat_la)}` : "Rezumat generat cu AI · neverificat încă"}
          </p>
        </div>
      )}

      {s.profesionist && (
        // Placeholder pentru fluxul cu contabili și notari (issue #5, Chris).
        <dialog
          ref={dialog}
          aria-labelledby={`${uid}-t`}
          className="m-auto w-[min(420px,calc(100%-32px))] rounded-2xl border border-v3-line p-5 backdrop:bg-black/50"
        >
          <h4 id={`${uid}-t`} className="m-0 mb-2 text-[17px] font-bold">
            Vorbește cu un {s.profesionist}
          </h4>
          <p className="m-0 mb-4 text-[15px] text-v3-ink-2">Aici vei putea cere ajutorul unui {s.profesionist} pentru „{s.rezumat}”. În lucru.</p>
          <form method="dialog">
            <button className="min-h-11 w-full rounded-[10px] bg-v3-ink font-bold text-white">Închide</button>
          </form>
        </dialog>
      )}
    </li>
  );
}
