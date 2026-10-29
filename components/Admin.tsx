"use client";

import Link from "next/link";
import { useState } from "react";
import { useLimba } from "@/components/Limba";
import { useAprobari } from "@/components/useAprobate";
import { dataScurta } from "@/lib/card";
import { etichetaTagL } from "@/lib/i18n";
import { INBOX, idPropunere, incarcaAprobari, salveazaAprobari, type ActInbox, type PropunereModel } from "@/lib/inbox";
import { TOATE_TAGURILE, esteTag, type TagId } from "@/lib/taguri";

// Panoul de revizie (issue #3): ce a propus modelul din Monitorul Oficial și butonul „Aprobă”.
// Nimic nu ajunge în flux fără un om: el corectează etichetele (modelul le poate lăsa goale) și aprobă.
// Aprobarea se vede pe loc în fluxul deschis în alt tab (components/useAprobate.ts).

const INCREDERE: Record<string, { ro: string; en: string }> = {
  ridicata: { ro: "ridicată", en: "high" },
  medie: { ro: "medie", en: "medium" },
  scazuta: { ro: "scăzută", en: "low" },
};

export function Admin() {
  const { limba } = useLimba();
  const en = limba === "en";
  const banii = INBOX.acte.filter((a) => a.atinge_banii).length;
  return (
    <div className="mx-auto max-w-[860px]">
      <p className="m-0 mb-2 text-xs font-extrabold tracking-[.12em] text-v3-accent uppercase">{en ? "Review · demo" : "Revizie · demo"}</p>
      <h1 className="m-0 font-head text-[clamp(28px,6.6vw,40px)] leading-[1.12] font-extrabold tracking-[-.015em] text-v3-ink">
        {en ? "New in the Official Gazette" : "Nou în Monitorul Oficial"}
      </h1>
      <p className="m-0 mt-3 text-[17px] leading-[1.6] text-v3-ink-2">
        {en
          ? "A model reads every new act, decides whether it touches people's money and proposes the card: tags, date, action and the sentence in the law it relies on. Nothing reaches a feed until a person approves it."
          : "Un model citește fiecare act nou, decide dacă atinge banii oamenilor și propune cardul: etichetele, data, acțiunea și fraza din lege pe care se sprijină. Nimic nu ajunge în flux până nu aprobă un om."}
      </p>
      <p className="m-0 mt-3 text-[13.5px] text-v3-ink-2">
        {en
          ? `${INBOX.acte.length} acts read, ${banii} touch money. Proposals generated with ${INBOX.model} through the API, about $${INBOX.cost_usd_pe_act} per act.`
          : `${INBOX.acte.length} acte citite, ${banii} ating banii. Propuneri generate cu ${INBOX.model} prin API, cam ${INBOX.cost_usd_pe_act} $ pe act.`}{" "}
        {en ? "Open a feed in another tab to watch an approved card appear:" : "Deschide un flux în alt tab ca să vezi cardul aprobat apărând:"}{" "}
        <Link href="/flux?p=elena" target="_blank" className="font-semibold text-v3-ink underline decoration-v3-line underline-offset-2">
          Elena, 24
        </Link>{" "}
        ·{" "}
        <Link href="/flux" target="_blank" className="font-semibold text-v3-ink underline decoration-v3-line underline-offset-2">
          {en ? "my feed" : "fluxul meu"}
        </Link>
      </p>
      <ul className="m-0 mt-6 list-none space-y-4 p-0">
        {INBOX.acte.map((a) => (
          <ActNou key={a.cheie} a={a} />
        ))}
      </ul>
    </div>
  );
}

function ActNou({ a }: { a: ActInbox }) {
  const { limba } = useLimba();
  const en = limba === "en";
  return (
    <li className={`rounded-2xl border border-v3-line p-5 ${a.atinge_banii ? "bg-v3-card" : "bg-transparent"}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold ${a.atinge_banii ? "bg-v3-pos-soft text-v3-pos" : "border border-v3-line text-v3-ink-2"}`}
        >
          {a.atinge_banii ? (en ? "Touches money" : "Atinge banii") : en ? "Filtered out: no money impact" : "Filtrat: nu atinge banii"}
        </span>
        <span className="text-[13px] text-v3-ink-2">
          {a.mo} · {en ? "published" : "publicat"} {dataScurta(a.publicat_la, limba)}
        </span>
      </div>
      <h2 className={`m-0 mt-2 text-[19px] leading-[1.3] font-bold ${a.atinge_banii ? "text-v3-ink" : "text-v3-ink-2"}`}>
        {en ? a.titlu_en : a.act}
      </h2>
      <a href={a.sursa_url} target="_blank" rel="noopener" className="text-[13px] font-semibold text-v3-accent">
        {en ? "Text on the Legislative Portal (RO) ↗︎" : "Textul pe Portalul Legislativ ↗︎"}
      </a>
      {a.schimbari.map((p, i) => (
        <Propunere key={i} a={a} p={p} index={i} />
      ))}
    </li>
  );
}

function Propunere({ a, p, index }: { a: ActInbox; p: PropunereModel; index: number }) {
  const { limba } = useLimba();
  const en = limba === "en";
  const id = idPropunere(a.cheie, index);
  const [aprobari, setAprobari] = useAprobari();
  const aprobata = aprobari.find((x) => x.id === id);
  const [taguri, setTaguri] = useState<TagId[]>(() => p.taguri.filter(esteTag));
  const alese = aprobata?.taguri ?? taguri;

  // lista proaspătă din storage: altă propunere de pe pagină poate fi aprobată între timp
  function aproba() {
    const lista = [...incarcaAprobari().filter((x) => x.id !== id), { id, taguri, aprobat_la: new Date().toISOString().slice(0, 10) }];
    setAprobari(lista);
    salveazaAprobari(lista);
  }
  function anuleaza() {
    const lista = incarcaAprobari().filter((x) => x.id !== id);
    setAprobari(lista);
    salveazaAprobari(lista);
  }

  return (
    <div className="mt-4 border-t border-v3-line pt-4">
      <p className="m-0 text-[17px] leading-[1.4] font-bold text-v3-ink">{en && p.en ? p.en.rezumat : p.rezumat}</p>
      <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-v3-ink-soft">{en && p.en ? p.en.zero : p.niveluri.zero}</p>

      <figure className="m-0 mt-3 rounded-xl border-l-[3px] border-v3-accent bg-v3-accent-soft px-3.5 py-2.5">
        <figcaption className="text-[11px] font-extrabold tracking-[.1em] text-v3-accent uppercase">
          {en ? "Sentence found word for word in the act" : "Fraza găsită cuvânt cu cuvânt în act"} · {en && p.en?.articol ? p.en.articol : p.articol}
        </figcaption>
        <blockquote lang="ro" className="m-0 mt-1 text-[14.5px] leading-[1.5] text-v3-ink italic">
          „{p.citat}”
        </blockquote>
        {/* citatul rămâne în română: el e dovada; dedesubt, traducerea neoficială */}
        {en && p.en?.citat && (
          <p className="m-0 mt-1.5 text-[13.5px] leading-[1.5] text-v3-ink-2">
            <span className="font-semibold">Unofficial translation:</span> “{p.en.citat}”
          </p>
        )}
      </figure>

      <dl className="m-0 mt-3 grid gap-x-6 gap-y-1.5 text-[14px] sm:grid-cols-[auto_1fr]">
        <dt className="font-semibold text-v3-ink-2">{en ? "Applies from" : "Se aplică de la"}</dt>
        <dd className="m-0 text-v3-ink">{dataScurta(p.in_vigoare_de_la, limba)}</dd>
        {p.actiuni.map((ac, i) => (
          <div key={i} className="contents">
            <dt className="font-semibold text-v3-ink-2">{en ? "Action" : "Acțiune"}</dt>
            <dd className="m-0 text-v3-ink">{en && p.en ? p.en.actiuni[i] : ac.text}</dd>
          </div>
        ))}
        <dt className="font-semibold text-v3-ink-2">{en ? "Model confidence" : "Încrederea modelului"}</dt>
        <dd className="m-0 text-v3-ink">{INCREDERE[p.incredere]?.[limba] ?? p.incredere}</dd>
      </dl>

      <details className="mt-3 text-[14px]">
        <summary className="cursor-pointer font-semibold text-v3-ink">{en ? "Model's note for the reviewer" : "Nota modelului pentru revizor"}</summary>
        <p className="m-0 mt-1.5 leading-[1.55] text-v3-ink-2">{en && p.en ? p.en.nota : p.nota}</p>
      </details>

      <div className="mt-4">
        <p className="m-0 mb-1.5 text-[12px] font-extrabold tracking-[.08em] text-v3-ink-2 uppercase">
          {en ? "Who it applies to (tags)" : "Pe cine privește (etichete)"}
          {p.taguri.length === 0 && <span className="ml-2 tracking-normal normal-case text-v3-urg">{en ? "the model proposed none" : "modelul n-a propus niciuna"}</span>}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {alese.map((t) => (
            <button
              key={t}
              type="button"
              disabled={!!aprobata}
              onClick={() => setTaguri(taguri.filter((x) => x !== t))}
              aria-label={`${en ? "Remove" : "Scoate"} ${etichetaTagL(limba, t)}`}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-v3-ink bg-v3-ink px-2.5 text-[13px] font-semibold text-v3-on-ink disabled:opacity-80"
            >
              {etichetaTagL(limba, t)}
              {!aprobata && <span aria-hidden="true">×</span>}
            </button>
          ))}
          {!aprobata && (
            <select
              aria-label={en ? "Add a tag" : "Adaugă o etichetă"}
              value=""
              onChange={(e) => esteTag(e.target.value) && !taguri.includes(e.target.value) && setTaguri([...taguri, e.target.value])}
              className="min-h-9 rounded-lg border border-v3-line bg-v3-card px-2 text-[13px] text-v3-ink"
            >
              <option value="">{en ? "+ add a tag" : "+ adaugă o etichetă"}</option>
              {TOATE_TAGURILE.filter((t) => !taguri.includes(t)).map((t) => (
                <option key={t} value={t}>
                  {etichetaTagL(limba, t)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {aprobata ? (
          <>
            <span className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-v3-pos-soft px-4 font-bold text-v3-pos">
              ✓ {en ? "Approved, now in the matching feeds" : "Aprobat, acum în fluxurile potrivite"}
            </span>
            <button type="button" onClick={anuleaza} className="min-h-11 text-sm text-v3-ink-2 underline underline-offset-2">
              {en ? "Withdraw" : "Retrage"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={aproba}
              disabled={taguri.length === 0}
              className="inline-flex min-h-11 items-center rounded-[10px] bg-v3-ink px-[18px] font-bold text-v3-on-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              {en ? "Approve and publish" : "Aprobă și publică"}
            </button>
            {taguri.length === 0 && (
              <span className="text-[13px] text-v3-ink-2">{en ? "Add at least one tag first." : "Adaugă întâi cel puțin o etichetă."}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
