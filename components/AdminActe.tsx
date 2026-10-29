import { FormularAproba, FormularRespinge } from "@/components/admin-acte/FormulareDecizie";
import { dataScurta } from "@/lib/card";
import { TAGURI } from "@/lib/taguri";
import type { RandInterpretare, SchimbarePropusa, Verificari } from "@/lib/supabase-server";

// Aspectul urmează „Revistă, pe gri” (mockup/v3/index.html?v=f, ADR 0001): verde pentru bani în plus,
// roșu pentru bani în minus, culori doar din tokenurile v3 ca să meargă și în tema închisă.

const STARE: Record<string, string> = {
  proiect: "proiect",
  adoptat: "adoptat",
  in_vigoare: "în vigoare",
  termen_depasit: "termen depășit",
};
const PILL: Record<string, string> = {
  proiect: "border-dashed border-v3-ink-2 bg-v3-card text-v3-ink-2",
  adoptat: "border-v3-accent bg-v3-accent-soft text-v3-accent",
  in_vigoare: "border-v3-pos bg-v3-pos-soft text-v3-pos",
  termen_depasit: "border-v3-past-line bg-v3-past-bg text-v3-past",
};
const DIRECTIE: Record<string, { cls: string; eticheta: string; bara: string }> = {
  castig: { cls: "text-v3-pos", eticheta: "bani în plus", bara: "border-l-v3-pos" },
  cost: { cls: "text-v3-neg", eticheta: "bani în minus", bara: "border-l-v3-neg" },
  termen: { cls: "text-v3-ink-2", eticheta: "termen", bara: "border-l-v3-line" },
  info: { cls: "text-v3-ink-2", eticheta: "informare", bara: "border-l-v3-line" },
};
const ACTIUNE: Record<string, string> = { fa: "de făcut", verifica: "de verificat", nimic_pana_la: "nimic până la" };

const d = (iso: string | null) => (iso ? dataScurta(iso, "ro") : "—");
const KICKER = "text-[11.5px] font-extrabold tracking-[.1em] text-v3-accent uppercase";

export function AdminActe({ randuri, demo }: { randuri: RandInterpretare[]; demo: boolean }) {
  return (
    <div>
      <header className="mb-5 border-b border-v3-line pb-4">
        <p className={`m-0 mb-1 ${KICKER}`}>Doar pentru echipă{demo ? " · demonstrație, date din eval/" : ""}</p>
        <h1 className="m-0 font-head text-[clamp(26px,6vw,36px)] leading-[1.12] font-extrabold tracking-[-.015em] text-v3-ink">
          Interpretări de aprobat
        </h1>
        <p className="m-0 mt-1.5 text-[15px] text-v3-ink-2">
          {randuri.length} {randuri.length === 1 ? "act propus" : "acte propuse"} de model, în așteptarea unui om.
        </p>
      </header>
      {randuri.length === 0 ? (
        <p className="m-0 rounded-[10px] border border-v3-line bg-v3-card p-4 text-[15px] text-v3-ink-2">Nu e nimic de aprobat acum.</p>
      ) : (
        <div className="grid gap-10">
          {randuri.map((r) => (
            <SectiuneAct key={r.id} r={r} />
          ))}
        </div>
      )}
    </div>
  );
}

export function StareGoala({ titlu, text, cod }: { titlu: string; text: string; cod?: string }) {
  return (
    <div className="rounded-[10px] border border-v3-line bg-v3-card p-5">
      <h1 className="m-0 font-head text-[24px] font-extrabold text-v3-ink">{titlu}</h1>
      <p className="m-0 mt-2 text-[15px] text-v3-ink-2">
        {text} {cod && <code className="rounded bg-v3-accent-soft px-1.5 py-0.5 text-[13.5px] text-v3-ink">{cod}</code>}
      </p>
    </div>
  );
}

function SectiuneAct({ r }: { r: RandInterpretare }) {
  const { act, rezultat, verificari } = r;
  const picate = verificari?.picate ?? [];
  const blocatAct = picate.some((x) => typeof x.schimbare !== "number");
  return (
    <section aria-labelledby={`act-${r.id}`}>
      <div className="border-b-2 border-v3-ink pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={KICKER}>{act.mo_ref ?? rezultat.mo}</span>
          <span
            className={`rounded-full border px-[9px] py-px text-[12.5px] font-semibold ${
              rezultat.atinge_banii ? "border-v3-pos bg-v3-pos-soft text-v3-pos" : "border-v3-line bg-v3-card text-v3-ink-2"
            }`}
          >
            {rezultat.atinge_banii ? "atinge banii" : "nu atinge banii"}
          </span>
        </div>
        <h2 id={`act-${r.id}`} className="m-0 mt-1.5 font-head text-[clamp(19px,4.6vw,24px)] leading-[1.25] font-extrabold text-v3-ink">
          {act.titlu}
        </h2>
        <p className="m-0 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-v3-ink-2">
          <a href={act.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-v3-accent underline underline-offset-2">
            Portal Legislativ ↗
          </a>
          <span>publicat {d(act.publicat_la ?? rezultat.publicat_la)}</span>
          <span>
            propus de {r.model} ({r.driver}), {d(r.creat_la.slice(0, 10))}
          </span>
          {act.lungime ? <span>{act.lungime.toLocaleString("ro-RO")} caractere</span> : null}
        </p>
      </div>

      <PanouVerificari v={verificari} />

      <ul className="m-0 mt-2 list-none p-0">
        {rezultat.schimbari.map((s, i) => (
          <CardPropus key={i} s={s} />
        ))}
      </ul>

      {rezultat.schimbari.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <FormularAproba
            id={r.id}
            blocatAct={blocatAct}
            optiuni={rezultat.schimbari.map((s, i) => ({ rezumat: s.rezumat, picate: picate.filter((x) => x.schimbare === i).map((x) => x.mesaj) }))}
          />
          <FormularRespinge id={r.id} />
        </div>
      )}
    </section>
  );
}

function PanouVerificari({ v }: { v: Verificari | null }) {
  if (!v)
    return <p className="m-0 mt-3 text-[13.5px] text-v3-ink-2">Verificările automate nu au rulat pe această interpretare.</p>;
  return (
    <div className="mt-3 grid gap-2.5 md:grid-cols-2">
      <div className="rounded-[10px] border border-v3-pos/30 bg-v3-pos-soft p-3">
        <p className="m-0 mb-1 text-[11px] font-extrabold tracking-[.1em] text-v3-pos uppercase">Verificări trecute ({v.trecute.length})</p>
        <ul className="m-0 list-none space-y-1 p-0 text-[13.5px] text-v3-ink">
          {v.trecute.map((x, i) => (
            <li key={i} className="flex gap-2">
              <span aria-hidden="true" className="text-v3-pos">✓</span>
              <span>{x.mesaj}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`rounded-[10px] border p-3 ${v.picate.length ? "border-v3-urg/40 bg-v3-urg-soft" : "border-v3-line bg-v3-card"}`}>
        <p className={`m-0 mb-1 text-[11px] font-extrabold tracking-[.1em] uppercase ${v.picate.length ? "text-v3-urg" : "text-v3-ink-2"}`}>
          Verificări picate ({v.picate.length})
        </p>
        {v.picate.length === 0 ? (
          <p className="m-0 text-[13.5px] text-v3-ink-2">Nicio verificare picată.</p>
        ) : (
          <ul className="m-0 list-none space-y-1 p-0 text-[13.5px] text-v3-ink">
            {v.picate.map((x, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden="true" className="text-v3-urg">✕</span>
                <span>
                  {x.mesaj}
                  {typeof x.schimbare === "number" && <span className="text-v3-ink-2"> (schimbarea {x.schimbare + 1})</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CardPropus({ s }: { s: SchimbarePropusa }) {
  const dir = DIRECTIE[s.directie] ?? DIRECTIE.info;
  const formula = s.formula ?? (s.formula_tip ? JSON.stringify(s.formula_tip, null, 1) : null);
  return (
    <li className={`border-b border-l-4 border-b-v3-line py-4 pl-3.5 ${dir.bara}`}>
      <div className="flex flex-wrap items-center gap-1.5 text-[12.5px]">
        <span className={`font-extrabold tracking-[.1em] uppercase ${dir.cls}`}>{dir.eticheta}</span>
        <span className={`rounded-full border px-[9px] py-px font-semibold ${PILL[s.status] ?? PILL.proiect}`}>{STARE[s.status] ?? s.status}</span>
        {s.taguri.map((t) => (
          <span key={t} className="rounded-full border border-v3-line bg-v3-card px-2 py-px text-v3-ink-2">
            {TAGURI[t as keyof typeof TAGURI]?.eticheta ?? `${t} (necunoscută)`}
          </span>
        ))}
      </div>
      <h3 className={`m-0 mt-1.5 text-[17px] leading-[1.3] font-bold ${s.directie === "cost" ? "text-v3-neg" : s.directie === "castig" ? "text-v3-pos" : "text-v3-ink"}`}>
        {s.rezumat}
      </h3>
      {s.rezumat_en && <p className="m-0 mt-0.5 text-[12.5px] text-v3-ink-2">{s.rezumat_en}</p>}

      <dl className="m-0 mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[13.5px]">
        <div className="flex gap-1.5">
          <dt className="text-v3-ink-2">în vigoare de la</dt>
          <dd className="m-0 font-semibold text-v3-ink">{d(s.in_vigoare_de_la)}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-v3-ink-2">până la</dt>
          <dd className="m-0 font-semibold text-v3-ink">{d(s.pana_la)}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt className="text-v3-ink-2">încredere</dt>
          <dd className="m-0 font-semibold text-v3-ink">{s.incredere}</dd>
        </div>
      </dl>

      {formula ? (
        <pre className="m-0 mt-2.5 overflow-x-auto rounded-lg border border-v3-line bg-v3-accent-soft p-2.5 font-mono text-[12.5px] text-v3-ink">
          <code>{formula}</code>
        </pre>
      ) : (
        <p className="m-0 mt-2.5 text-[13px] text-v3-ink-2">Fără formulă: suma nu se poate calcula din profil.</p>
      )}

      <blockquote className="m-0 mt-2.5 rounded-r-lg border-l-[3px] border-v3-line bg-v3-act px-3 py-2 text-[13.5px] text-v3-ink-soft">
        <b className="mb-0.5 block text-[12px] tracking-[.04em] text-v3-ink-2">{s.articol}</b>
        {s.citat}
      </blockquote>

      <p className="m-0 mt-2.5 max-w-[65ch] text-[15px] text-v3-ink">
        <b>Pentru tine:</b> {s.niveluri.zero}
      </p>
      <details className="mt-2 text-[14px] text-v3-ink">
        <summary className="cursor-pointer font-semibold text-v3-accent">Curios și expert</summary>
        <p className="m-0 mt-2 max-w-[65ch]">
          <b>Curios.</b> {s.niveluri.curios}
        </p>
        <p className="m-0 mt-2 max-w-[65ch]">
          <b>Expert.</b> {s.niveluri.expert}
        </p>
      </details>

      {s.actiuni.length > 0 && (
        <ul className="m-0 mt-2.5 list-none space-y-1.5 p-0">
          {s.actiuni.map((a, i) => (
            <li key={i} className="rounded-lg border border-v3-line bg-v3-card p-2.5 text-[13.5px] text-v3-ink">
              <span className="mr-1.5 text-[11px] font-extrabold tracking-[.1em] text-v3-accent uppercase">
                {ACTIUNE[a.tip] ?? a.tip} · {a.cine_aplica}
              </span>
              {a.text}
              <span className="mt-1 flex flex-wrap gap-x-4 text-[12.5px] text-v3-ink-2">
                <span>termen: {d(a.termen)}</span>
                <span>destinație: {a.destinatie ?? "—"}</span>
                {a.destinatie_propusa && <span>propusă: {a.destinatie_propusa}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {s.nota && (
        <p className="m-0 mt-2.5 rounded-lg bg-v3-accent-soft p-2.5 text-[13px] text-v3-ink-soft">
          <b>Notă a modelului:</b> {s.nota}
        </p>
      )}
    </li>
  );
}
