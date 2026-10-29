"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArticolLegi } from "@/components/ArticolLegi";
import { useLimba } from "@/components/Limba";
import { useAprobate } from "@/components/useAprobate";
import { useProfil } from "@/components/useProfil";
import proiecteJson from "@/data/noutati-proiecte.json";
import { dataScurta } from "@/lib/card";
import { CATALOG, type Schimbare } from "@/lib/catalog";
import type { ArticolGhid } from "@/lib/ghid";
import { niveluri } from "@/lib/continut";
import { etichetaTagL, lunaScurta } from "@/lib/i18n";
import { persoanaDemo } from "@/lib/persoane-demo";
import { aziISO, potriveste } from "@/lib/potrivire";
import { sursaAct } from "@/lib/traduceri";
import { TAGURI, type TagId } from "@/lib/taguri";

// „Toate legile”: Noutățile din macheta v6 și ghidul de dinainte de la /legi, într-o singură secțiune.
// Lista e tot ce s-a publicat, nu doar ce te privește: cel mai nou primul sau după cât poți salva.
// O lege deschisă arată ghidul complet (components/ArticolLegi.tsx). Actele vin din catalog (verificate);
// proiectele din data/noutati-proiecte.json au doar surse de presă.

type Proiect = {
  id: string;
  data: string;
  emitent: string;
  emitent_en: string;
  titlu: string;
  titlu_en: string;
  text: string;
  text_en: string;
  act: string;
  act_en: string;
  url: string;
  sursa: string;
  taguri: string[];
};
const PROIECTE = proiecteJson as Proiect[];

type Stare = "proiect" | "adoptat" | "in_vigoare";
type Stire =
  | { tip: "act"; id: string; data: string; stare: Stare; s: Schimbare }
  | { tip: "proiect"; id: string; data: string; stare: "proiect"; pr: Proiect };

const esteTag = (x: string): x is TagId => x in TAGURI;
const ETICHETA: Record<Stare, string> = { proiect: "Proiect", adoptat: "Adoptat", in_vigoare: "În vigoare" };
const normal = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function ToateLegile({ qInitial, ghid }: { qInitial: string; ghid: ArticolGhid[] }) {
  const { t, limba } = useLimba();
  const profilReal = useProfil();
  const aprobate = useAprobate();
  const [q, setQ] = useState(qInitial);
  const [st, setSt] = useState<Stare | "toate">("toate");
  const [arata, setArata] = useState<"toate" | "eu" | "rest">("toate");
  const [deschis, setDeschis] = useState<string | null>(null);
  const [ordine, setOrdine] = useState<"noi" | "bani">("noi");
  useEffect(() => setQ(qInitial), [qInitial]);
  // linkurile vechi /legi#<id> (și /noutati) deschid legea direct
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    setDeschis(id);
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
  }, []);
  const dinGhid = useMemo(() => new Map(ghid.map((g, i) => [g.id, { g, loc: i }])), [ghid]);

  // „te privesc”: pe profilul tău; fără profil, pe exemplul Andrei, ca în „Pentru tine”.
  const profil = profilReal && profilReal.taguri.length ? profilReal : persoanaDemo("andrei").profil;
  const ale = useMemo(() => new Set(potriveste(profil, [...aprobate, ...CATALOG], aziISO()).map((p) => p.schimbare.id)), [profil, aprobate]);
  const taguriMele = new Set<string>(profil.taguri);

  const stiri: Stire[] = useMemo(
    () =>
      [
        ...[...aprobate, ...CATALOG].map(
          (s): Stire => ({ tip: "act", id: s.id, data: s.publicat_la, stare: s.status, s }),
        ),
        ...PROIECTE.map((pr): Stire => ({ tip: "proiect", id: pr.id, data: pr.data, stare: "proiect", pr })),
      ].sort((a, b) => b.data.localeCompare(a.data)),
    [aprobate],
  );

  const titlu = (x: Stire) =>
    x.tip === "act" ? (limba === "en" && x.s.rezumat_en ? x.s.rezumat_en : x.s.rezumat) : limba === "en" ? x.pr.titlu_en : x.pr.titlu;
  const taguri = (x: Stire) => (x.tip === "act" ? x.s.taguri : x.pr.taguri.filter(esteTag));
  const aMea = (x: Stire) => (x.tip === "act" ? ale.has(x.id) : taguri(x).some((g) => taguriMele.has(g)));
  const cauta = (x: Stire) => {
    if (!q) return true;
    const h = normal(
      [titlu(x), x.tip === "act" ? `${x.s.act} ${x.s.rezumat} ${x.s.rezumat_en ?? ""} ${dinGhid.get(x.id)?.g.pentru ?? ""} ${dinGhid.get(x.id)?.g.ce ?? ""}` : `${x.pr.act} ${x.pr.emitent} ${x.pr.titlu}`, ...taguri(x).map((g) => (esteTag(g) ? etichetaTagL(limba, g) : g))].join(" "),
    );
    return normal(q).split(/\s+/).every((w) => h.includes(w));
  };
  const potrivit = (x: Stire, fara?: "st" | "arata") =>
    (fara === "st" || st === "toate" || x.stare === st) && (fara === "arata" || arata === "toate" || (arata === "eu") === aMea(x)) && cauta(x);
  // „cât poți salva”: ordinea din ghid (lib/ghid.ts ordoneaza); ce nu e în ghid, la final, cel mai nou primul
  const vizibile = stiri
    .filter((x) => potrivit(x))
    .sort((a, b) => (ordine === "noi" ? 0 : (dinGhid.get(a.id)?.loc ?? 1e6) - (dinGhid.get(b.id)?.loc ?? 1e6)));

  const buton = (on: boolean, n: number, onClick: () => void, eticheta: string) => (
    <button
      key={eticheta}
      type="button"
      aria-pressed={on}
      disabled={!n && !on}
      onClick={onClick}
      className="flex min-h-9 shrink-0 items-center justify-between gap-2 rounded-lg px-2.5 text-left text-[14px] whitespace-nowrap text-v3-ink hover:bg-v3-accent-soft disabled:opacity-40 aria-pressed:bg-v3-ink aria-pressed:text-v3-on-ink"
    >
      {eticheta}
      <em className="text-[12px] not-italic opacity-70">{n}</em>
    </button>
  );
  const filtre = (
    <>
      <h3 className="m-0 mb-2 hidden text-[13px] font-bold text-v3-ink lg:block">{t("Stare")}</h3>
      <div className="flex gap-1 lg:mb-5 lg:flex-col lg:gap-0.5">
        {buton(st === "toate", stiri.filter((x) => potrivit(x, "st")).length, () => setSt("toate"), t("Toate"))}
        {(["proiect", "adoptat", "in_vigoare"] as Stare[]).map((s) =>
          buton(st === s, stiri.filter((x) => x.stare === s && potrivit(x, "st")).length, () => setSt(st === s ? "toate" : s), t(ETICHETA[s])),
        )}
      </div>
      <h3 className="m-0 mb-2 hidden text-[13px] font-bold text-v3-ink lg:block">{t("Arată")}</h3>
      <div className="flex gap-1 lg:flex-col lg:gap-0.5">
        {buton(arata === "eu", stiri.filter((x) => aMea(x) && potrivit(x, "arata")).length, () => setArata(arata === "eu" ? "toate" : "eu"), t("Te privesc"))}
        {buton(arata === "rest", stiri.filter((x) => !aMea(x) && potrivit(x, "arata")).length, () => setArata(arata === "rest" ? "toate" : "rest"), t("Restul"))}
      </div>
      <p className="mt-4 hidden text-[12.5px] text-v3-ink-2 lg:block">{t("Proiectele au doar surse de presă până apare textul oficial.")}</p>
    </>
  );

  return (
    <div className="grid gap-x-8 lg:grid-cols-[170px_minmax(0,1fr)]">
      <aside aria-label={t("Filtre")} className="hidden lg:block">
        {filtre}
      </aside>
      <div className="min-w-0">
        <h1 className="m-0 font-head text-[clamp(28px,6vw,38px)] leading-[1.12] font-extrabold tracking-[-.015em] text-v3-ink">{t("Toate legile")}</h1>
        <p className="mt-2 mb-4 max-w-[60ch] text-[16px] text-v3-ink-2">
          {t("Tot ce s-a publicat, nu doar ce te privește. Deschide o lege ca să vezi cât poți salva și ce poți face, pas cu pas. Proiectele pot să se schimbe sau să nu fie adoptate.")}
        </p>
        <label className="flex items-center rounded-xl border border-v3-line bg-v3-card pr-1.5 focus-within:border-v3-accent">
          <span className="sr-only">{t("Caută în toate legile")}</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Caută în toate legile")}
            className="min-h-11 w-full min-w-0 bg-transparent px-3.5 text-[15px] text-v3-ink outline-none placeholder:text-v3-ink-2"
          />
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 flex-none fill-none stroke-v3-ink-2 stroke-2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </label>
        <div className="-mx-4 mt-3 flex gap-1 overflow-x-auto px-4 pb-1 lg:hidden">{filtre}</div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="m-0 text-[13.5px] text-v3-ink-2">
            {vizibile.length} {vizibile.length === 1 ? t("rezultat") : t("rezultate")}
          </p>
          <span role="group" aria-label={t("Ordine")} className="inline-flex rounded-full border border-v3-line p-0.5 text-[13px] font-semibold">
            {(["noi", "bani"] as const).map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={ordine === o}
                onClick={() => setOrdine(o)}
                className="min-h-8 rounded-full px-3 text-v3-ink-2 aria-pressed:bg-v3-ink aria-pressed:text-v3-on-ink"
              >
                {o === "noi" ? t("Cele mai noi") : t("Cât poți salva")}
              </button>
            ))}
          </span>
        </div>
        <ul className="m-0 mt-1 list-none border-t border-v3-line p-0">
          {vizibile.map((x) => {
            const [y, m, d] = x.data.split("-").map(Number);
            const o = deschis === x.id;
            const mea = aMea(x);
            const sursa = x.tip === "act" ? sursaAct(x.s, limba) : null;
            return (
              <li key={x.id} id={x.id} className="scroll-mt-20 border-b border-v3-line py-4">
                <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 sm:grid-cols-[52px_minmax(0,1fr)_auto]">
                  <span className="text-center">
                    <b className="block font-num text-[24px] leading-none font-semibold text-v3-ink">{d}</b>
                    <small className="text-[11.5px] text-v3-ink-2">
                      {lunaScurta(limba, m - 1)} {y}
                    </small>
                  </span>
                  <button type="button" aria-expanded={o} onClick={() => setDeschis(o ? null : x.id)} className="min-w-0 text-left">
                    <span className="block text-[16.5px] leading-[1.35] font-bold text-v3-ink">{titlu(x)}</span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12.5px] text-v3-ink-2">
                      <span
                        className={`rounded-full px-2 py-px font-semibold ${
                          x.stare === "proiect" ? "bg-v3-urg-soft text-v3-urg" : x.stare === "adoptat" ? "bg-v3-accent-soft text-v3-ink" : "bg-v3-pos-soft text-v3-pos"
                        }`}
                      >
                        {t(ETICHETA[x.stare])}
                      </span>
                      <span>{x.tip === "act" ? sursa!.act.text : limba === "en" ? x.pr.act_en : x.pr.act}</span>
                      {x.tip === "proiect" && <span>{limba === "en" ? x.pr.emitent_en : x.pr.emitent}</span>}
                      {taguri(x)
                        .filter(esteTag)
                        .map((g) => (
                          <span
                            key={g}
                            className={`rounded-full px-2 py-px text-[12px] font-semibold ${taguriMele.has(g) ? "bg-v3-ink text-v3-on-ink" : "border border-v3-line"}`}
                          >
                            {etichetaTagL(limba, g)}
                          </span>
                        ))}
                    </span>
                  </button>
                  {mea && x.tip === "act" && (
                    <Link
                      href={`/#c-${x.id}`}
                      className="col-start-2 inline-flex min-h-9 items-center self-start justify-self-start rounded-full border border-v3-line px-3 text-[13px] font-semibold whitespace-nowrap text-v3-ink no-underline sm:col-start-3"
                    >
                      {t("Vezi în Pentru tine")}
                    </Link>
                  )}
                </div>
                {o && (
                  <div className="mt-3 text-[14.5px] text-v3-ink sm:ml-[64px]">
                    {x.tip === "act" && dinGhid.has(x.id) ? (
                      <ArticolLegi a={dinGhid.get(x.id)!.g} inLista />
                    ) : x.tip === "act" ? (
                      <>
                        <p className="m-0 mb-2" lang={niveluri(x.s, limba).limbaZero}>
                          {niveluri(x.s, limba).zero}
                        </p>
                        <p className="m-0 mb-2 text-v3-ink-2">
                          {t("Se aplică de la")} {dataScurta(x.s.in_vigoare_de_la, limba)} · {sursa!.mo_ref.text}
                        </p>
                        <p className="m-0 flex flex-wrap gap-x-4 gap-y-1">
                          <a href={x.s.sursa_url} target="_blank" rel="noopener" className="font-semibold text-v3-accent">
                            {t("Textul actului")} ↗︎
                          </a>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="m-0 mb-2">{limba === "en" ? x.pr.text_en : x.pr.text}</p>
                        <p className="m-0 mb-2 text-v3-ink-2">{t("E un proiect. Textul oficial nu e încă publicat (TODO).")}</p>
                        <a href={x.pr.url} target="_blank" rel="noopener" className="font-semibold text-v3-accent">
                          {t("Sursa:")} {x.pr.sursa} ↗︎
                        </a>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {!vizibile.length && <p className="py-6 text-[15px] text-v3-ink-2">{t("Nimic nou care să se potrivească.")}</p>}
      </div>
    </div>
  );
}
