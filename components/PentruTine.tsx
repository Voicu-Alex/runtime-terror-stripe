"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CardSchimbare from "@/components/CardSchimbare";
import { useLimba } from "@/components/Limba";
import { useAbonament } from "@/components/useAbonament";
import { useAprobate } from "@/components/useAprobate";
import { useProfil } from "@/components/useProfil";
import { evenimente } from "@/components/RevistaFlux";
import { ETICHETA_STARE, bani, cuSemn, dataScurta, vedere, zile, ZILE_URGENT, type VedereCard } from "@/lib/card";
import { CATALOG } from "@/lib/catalog";
import { PRET_BANI } from "@/lib/abonament";
import { areAcces, deblocariRamase, deblocheaza, incarcaFreemium, salveazaFreemium, FREEMIUM_GOL, type StareFreemium } from "@/lib/freemium";
import { etichetaTagL, familieL, lunaScurta } from "@/lib/i18n";
import { PERSOANE_DEMO, persoanaDemo } from "@/lib/persoane-demo";
import { incarcaPlan, salveazaPlan } from "@/lib/plan";
import { aziISO, potriveste, type Potrivire } from "@/lib/potrivire";
import type { Profil } from "@/lib/profil";
import { TAGURI, type TagId } from "@/lib/taguri";

// „Pentru tine” din macheta v6 a lui Andrei (mockup/v6, decis pe 29 oct ca design principal), pe motorul aplicației:
// bilanțul sus, filtre în stânga, rândurile cu sume, termenele în dreapta. Freemium (ADR 0003, 0004):
// o deblocare gratuită, încă una pentru profilul completat, Pro deschide tot. Cardul deschis e CardSchimbare.

const AZI_DEMO = "2026-10-28";

type StareFiltru = "proiect" | "urmeaza" | "in_vigoare" | "incheiata";
const STARI: StareFiltru[] = ["proiect", "urmeaza", "in_vigoare", "incheiata"];
const ETICHETA_FILTRU: Record<StareFiltru, string> = {
  proiect: "Proiect",
  urmeaza: "Urmează",
  in_vigoare: "În vigoare",
  incheiata: "Acțiune încheiată",
};

type Rand = { p: Potrivire; v: VedereCard; familie: string; stare: StareFiltru; valoare: number };

function stareFiltru(p: Potrivire, v: VedereCard, azi: string): StareFiltru {
  if (v.stare === "termen_depasit") return "incheiata";
  if (v.stare === "proiect") return "proiect";
  if (p.schimbare.in_vigoare_de_la > azi || v.stare === "adoptat") return "urmeaza";
  return "in_vigoare";
}

/** Fără diacritice și litere mari, ca „motorina” să găsească „Motorină”. */
function normal(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function PentruTine({ demoId }: { demoId: string | null }) {
  const { t, limba } = useLimba();
  const profilReal = useProfil();
  const abonament = useAbonament();
  const aprobate = useAprobate();

  // Profilul: persoana fictivă din ?p=, altfel profilul tău, altfel exemplul Andrei (ca în v6), marcat clar ca exemplu.
  const areProfil = !!profilReal && profilReal.taguri.length > 0;
  const idDemo = demoId && demoId in PERSOANE_DEMO ? demoId : areProfil ? null : "andrei";
  const persoana = idDemo ? persoanaDemo(idDemo) : null;
  const profil: Profil | null = persoana ? persoana.profil : profilReal;
  const azi = idDemo ? AZI_DEMO : aziISO();

  // Pro vine doar de la Stripe (ADR 0002); fără el, freemium-ul de mai jos.
  const premium = !!abonament?.activ;

  const [fm, setFm] = useState<StareFreemium>(FREEMIUM_GOL);
  useEffect(() => setFm(incarcaFreemium()), []);
  const profilCompletat = areProfil;
  const ramase = deblocariRamase(fm, profilCompletat);
  function foloseste(id: string) {
    const urm = deblocheaza(fm, id, profilCompletat);
    setFm(urm);
    salveazaFreemium(urm);
    if (typeof window !== "undefined") window.location.hash = `c-${id}`;
  }

  const [bifate, setBifate] = useState<Set<string>>(new Set());
  useEffect(() => setBifate(incarcaPlan()), []);
  function comuta(id: string) {
    const urm = new Set(bifate);
    if (urm.has(id)) urm.delete(id);
    else urm.add(id);
    setBifate(urm);
    salveazaPlan(urm);
  }

  const [cat, setCat] = useState<string>("toate");
  const [st, setSt] = useState<StareFiltru | "toate">("toate");
  const [tag, setTag] = useState<TagId | null>(null);
  const [q, setQ] = useState("");

  const potriviri = useMemo(() => (profil ? potriveste(profil, [...aprobate, ...CATALOG], azi) : []), [profil, aprobate, azi]);
  const randuri: Rand[] = useMemo(
    () =>
      profil
        ? potriviri.map((p) => {
            const v = vedere(p, profil.valori, limba);
            const familie = familieL(limba, TAGURI[p.taguri_comune[0]].familie);
            const valoare = Math.abs(v.suma ?? 0) || (v.economie?.suma ?? 0);
            return { p, v, familie, stare: stareFiltru(p, v, azi), valoare };
          })
        : [],
    [potriviri, profil, limba, azi],
  );

  // până citim profilul de pe dispozitiv nu arătăm exemplul, ca să nu clipească
  if (!profil || (!demoId && profilReal === null)) return <p className="mt-4 text-sm text-v3-ink-2">{t("Se încarcă profilul de pe dispozitiv…")}</p>;

  const acces = (id: string) => areAcces(fm, id, premium);
  const textul = (r: Rand) =>
    normal([r.v.titlu, r.v.kicker, r.v.act, r.p.schimbare.rezumat, r.p.schimbare.rezumat_en ?? "", ...r.p.taguri_comune.map((x) => etichetaTagL(limba, x))].join(" "));
  const cauta = (r: Rand) => !q || normal(q).split(/\s+/).every((w) => textul(r).includes(w));
  const potrivit = (r: Rand, fara?: "cat" | "st") =>
    (fara === "cat" || cat === "toate" || r.familie === cat) &&
    (fara === "st" || st === "toate" || r.stare === st) &&
    (!tag || r.p.taguri_comune.includes(tag)) &&
    cauta(r);
  const vizibile = randuri.filter((r) => potrivit(r)).sort((a, b) => b.valoare - a.valoare);
  const familii = [...new Set(randuri.map((r) => r.familie))];
  const taguriProfil = [...new Set(randuri.flatMap((r) => r.p.taguri_comune))];
  const inCatalog = q && vizibile.length === 0 ? CATALOG.filter((s) => normal(`${s.rezumat} ${s.rezumat_en ?? ""} ${s.act}`).includes(normal(q))).length : 0;
  const filtrat = cat !== "toate" || st !== "toate" || !!tag || !!q;

  return (
    <div className="grid gap-x-8 lg:grid-cols-[170px_minmax(0,1fr)_230px]">
      {/* Filtre: coloană pe desktop, pastile pe telefon */}
      <aside aria-label={t("Filtre")} className="hidden lg:block">
        <Filtre titlu={t("Categorie")}>
          <Buton on={cat === "toate"} n={randuri.filter((r) => potrivit(r, "cat")).length} onClick={() => setCat("toate")}>
            {t("Toate")}
          </Buton>
          {familii.map((f) => (
            <Buton key={f} on={cat === f} n={randuri.filter((r) => r.familie === f && potrivit(r, "cat")).length} onClick={() => setCat(f)}>
              {f}
            </Buton>
          ))}
        </Filtre>
        <Filtre titlu={t("Stare")}>
          <Buton on={st === "toate"} n={randuri.filter((r) => potrivit(r, "st")).length} onClick={() => setSt("toate")}>
            {t("Toate")}
          </Buton>
          {STARI.map((s) => (
            <Buton key={s} on={st === s} n={randuri.filter((r) => r.stare === s && potrivit(r, "st")).length} onClick={() => setSt(s)}>
              {t(ETICHETA_FILTRU[s])}
            </Buton>
          ))}
        </Filtre>
      </aside>

      <div className="min-w-0">
        <label className="flex items-center rounded-xl border border-v3-line bg-v3-card pr-1.5 focus-within:border-v3-accent">
          <span className="sr-only">{t("Caută o lege sau o etichetă")}</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Caută o lege sau o etichetă")}
            className="min-h-11 w-full min-w-0 bg-transparent px-3.5 text-[15px] text-v3-ink outline-none placeholder:text-v3-ink-2"
          />
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 flex-none fill-none stroke-v3-ink-2 stroke-2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </label>

        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
          <Pastila on={st === "toate" && cat === "toate"} n={randuri.length} onClick={() => (setSt("toate"), setCat("toate"))}>
            {t("Toate")}
          </Pastila>
          {STARI.map((s) => (
            <Pastila key={s} on={st === s} n={randuri.filter((r) => r.stare === s).length} onClick={() => setSt(st === s ? "toate" : s)}>
              {t(ETICHETA_FILTRU[s])}
            </Pastila>
          ))}
          {familii.map((f) => (
            <Pastila key={f} on={cat === f} n={randuri.filter((r) => r.familie === f).length} onClick={() => setCat(cat === f ? "toate" : f)}>
              {f}
            </Pastila>
          ))}
        </div>

        {persoana ? (
          // Exemplul e marcat vizibil ca fictiv, cu tot profilul lui, ca să nu fie luat drept al cititorului.
          <section aria-label={t("Exemplu")} className="mt-3 rounded-2xl border border-dashed border-v3-accent bg-v3-accent-soft p-4">
            <p className="m-0 text-[11.5px] font-extrabold tracking-[.12em] text-v3-accent uppercase">{t("Exemplu · persoană fictivă")}</p>
            <p className="m-0 mt-1 text-[15.5px] leading-snug text-v3-ink">
              <b>{persoana.nume}</b> · {persoana.profil.taguri.map((x) => etichetaTagL(limba, x)).join(", ")}
            </p>
            <p className="m-0 mt-2 text-[14px] text-v3-ink-2">
              {t("Sumele de mai jos sunt pe acest profil.")}{" "}
              <Link href="/profil" className="font-semibold text-v3-ink underline decoration-v3-line underline-offset-2">
                {t("Fă-ți profilul: manual sau dintr-un document")}
              </Link>
            </p>
          </section>
        ) : (
          <p className="mt-3 mb-0 text-sm text-v3-ink-2">
            {t("Profilul tău:")} {profil.taguri.map((x) => etichetaTagL(limba, x)).join(", ")} ·{" "}
            <Link href="/profil" className="text-v3-ink underline decoration-v3-line underline-offset-2">
              {t("modifică")}
            </Link>
          </p>
        )}

        <Freemium premium={premium} ramase={ramase} profilCompletat={profilCompletat} />

        <Bilant randuri={randuri} acces={acces} />

        {taguriProfil.length > 1 && (
          <div className="mt-5 flex flex-wrap items-center gap-1.5 text-[13.5px] text-v3-ink-2">
            {t("Caută după etichetă:")}
            {taguriProfil.map((x) => (
              <button
                key={x}
                type="button"
                aria-pressed={tag === x}
                onClick={() => setTag(tag === x ? null : x)}
                className="min-h-8 rounded-full border border-v3-line bg-v3-card px-3 text-[13px] text-v3-ink-2 aria-pressed:border-v3-ink aria-pressed:bg-v3-ink aria-pressed:text-v3-on-ink"
              >
                {etichetaTagL(limba, x)}
              </button>
            ))}
          </div>
        )}

        <h2 className="mt-5 mb-0 flex items-baseline justify-between gap-3 border-b border-v3-line pb-2 font-head text-[19px] font-extrabold text-v3-ink">
          {filtrat ? t("Rezultate") : persoana ? t("Acte și scenarii de explorat") : t("Acte pe etichetele tale")}
          <span className="font-sans text-[13.5px] font-medium text-v3-ink-2">
            {vizibile.length} {vizibile.length === 1 ? t("act") : t("acte")}
          </span>
        </h2>

        {vizibile.length ? (
          <ul className="m-0 list-none p-0">
            {vizibile.map((r) =>
              acces(r.p.schimbare.id) ? (
                <CardSchimbare
                  key={r.p.schimbare.id}
                  p={r.p}
                  valori={profil.valori}
                  bifata={bifate.has(r.p.schimbare.id)}
                  onBifeaza={() => comuta(r.p.schimbare.id)}
                />
              ) : (
                <RandBlocat key={r.p.schimbare.id} r={r} ramase={ramase} onDeblocheaza={() => foloseste(r.p.schimbare.id)} />
              ),
            )}
          </ul>
        ) : (
          <p className="py-6 text-[15px] text-v3-ink-2">
            {t("Nimic nu se potrivește.")}{" "}
            {inCatalog > 0 && (
              <Link href={`/legi?q=${encodeURIComponent(q)}`} className="font-semibold text-v3-ink underline underline-offset-2">
                {t("Caută în tot catalogul")} ({inCatalog})
              </Link>
            )}
          </p>
        )}
        <p className="mt-4 text-[13px] text-v3-ink-2">{t("Nu e sfat financiar. Arătăm efectul legii pe profilul tău și ce permite legea.")}</p>
      </div>

      <Termene randuri={randuri} acces={acces} azi={azi} />
    </div>
  );
}

function Filtre({ titlu, children }: { titlu: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="m-0 mb-2 text-[13px] font-bold text-v3-ink">{titlu}</h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function Buton({ on, n, onClick, children }: { on: boolean; n: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={!n && !on}
      onClick={onClick}
      className="flex min-h-9 items-center justify-between rounded-lg px-2.5 text-left text-[14px] text-v3-ink hover:bg-v3-accent-soft disabled:opacity-40 disabled:hover:bg-transparent aria-pressed:bg-v3-ink aria-pressed:text-v3-on-ink"
    >
      {children}
      <em className="text-[12px] not-italic opacity-70">{n}</em>
    </button>
  );
}

function Pastila({ on, n, onClick, children }: { on: boolean; n: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="min-h-10 shrink-0 rounded-full border border-v3-line bg-v3-card px-3.5 text-[14px] whitespace-nowrap text-v3-ink aria-pressed:border-v3-ink aria-pressed:bg-v3-ink aria-pressed:text-v3-on-ink"
    >
      {children} <em className="ml-0.5 text-[12px] not-italic opacity-70">{n}</em>
    </button>
  );
}

function Freemium({ premium, ramase, profilCompletat }: { premium: boolean; ramase: number; profilCompletat: boolean }) {
  const { t } = useLimba();
  return (
    <section className="mt-4 rounded-2xl border border-v3-line bg-v3-card p-5">
      <h2 className="m-0 font-head text-[18px] font-extrabold text-v3-ink">
        {premium ? (
          <>
            {t("Pro activ")} · {PRET_BANI / 100} {t("lei/lună")}
          </>
        ) : (
          <>
            {t("Deblocări gratuite")} · {ramase} {ramase === 1 ? t("disponibilă") : t("disponibile")}
          </>
        )}
      </h2>
      {premium ? (
        <p className="m-0 mt-1.5 text-[14.5px] text-v3-ink-2">{t("Vezi toate legile, sumele și ghidurile complete.")}</p>
      ) : (
        <>
          <p className="m-0 mt-1.5 text-[14.5px] text-v3-ink-2">
            {t("Prima lege o deschizi gratuit, cu tot ghidul. Celelalte îți arată categoria, suma și sursa; detaliile se deschid cu o deblocare sau cu Pro.")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {!profilCompletat && (
              <Link
                href="/profil"
                className="inline-flex min-h-11 items-center rounded-[10px] border border-v3-ink px-4 text-[14px] font-bold text-v3-ink no-underline"
              >
                {t("Completează profilul sau încarcă un document · +1 deblocare")}
              </Link>
            )}
            <Link
              href="/abonament"
              className="inline-flex min-h-11 items-center rounded-[10px] bg-v3-ink px-4 text-[14px] font-bold text-v3-on-ink no-underline hover:bg-v3-ink-strong"
            >
              {t("Upgrade la Pro")} · {PRET_BANI / 100} {t("lei/lună")}
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

/** Un act încă nedeblocat: categoria, suma, starea și sursa se văd; titlul detaliat și ghidul, nu (ADR 0004). */
function RandBlocat({ r, ramase, onDeblocheaza }: { r: Rand; ramase: number; onDeblocheaza: () => void }) {
  const { t, limba } = useLimba();
  const { v, p } = r;
  return (
    <li id={`c-${p.schimbare.id}`} className="scroll-mt-20 border-b border-v3-line py-4">
      <div className="grid grid-cols-[1fr_auto] items-start gap-x-3.5 gap-y-1.5">
        <span className="text-sm font-medium text-v3-accent">{r.familie}</span>
        <Suma v={v} />
        <span className="relative text-[17px] leading-[1.3] font-bold text-v3-ink">
          <span aria-hidden="true" className="blur-[5px] select-none">
            {v.titlu}
          </span>
          <span className="sr-only">{t("Titlu ascuns până la deblocare")}</span>
        </span>
        <span className="col-span-2 flex flex-wrap items-center gap-1.5 text-[12.5px] text-v3-ink-2">
          <span className="rounded-full border border-v3-line px-[9px] py-px font-semibold">{t(ETICHETA_STARE[v.stare])}</span>
          <span>{v.act}</span>
          {v.termen && !v.termen.depasit && (
            <span className={v.termen.urgent ? "font-bold text-v3-urg" : ""}>
              · {t("mai ai")} {zile(v.termen.zile, limba)}
            </span>
          )}
          {p.taguri_comune.map((x) => (
            <span key={x} className="rounded-full bg-v3-ink px-2 py-px text-[12px] font-semibold text-v3-on-ink">
              {etichetaTagL(limba, x)}
            </span>
          ))}
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {ramase > 0 ? (
          <button type="button" onClick={onDeblocheaza} className="min-h-10 rounded-[10px] border border-v3-ink px-3.5 text-[14px] font-bold text-v3-ink">
            {t("Deschide gratuit")} · {ramase} {ramase === 1 ? t("deblocare rămasă") : t("deblocări rămase")}
          </button>
        ) : (
          <Link href="/abonament" className="inline-flex min-h-10 items-center rounded-[10px] bg-v3-ink px-3.5 text-[14px] font-bold text-v3-on-ink no-underline">
            {t("Vezi detaliile cu Pro")}
          </Link>
        )}
        <a href={p.schimbare.sursa_url} target="_blank" rel="noopener" className="text-[13px] font-semibold text-v3-accent">
          {t("Sursa oficială")} ↗︎
        </a>
      </div>
    </li>
  );
}

function Suma({ v }: { v: VedereCard }) {
  const { t , limba } = useLimba();
  const val = v.suma ?? v.economie?.suma ?? null;
  const dep = v.termen?.depasit;
  return (
    <span
      className={`row-span-2 text-right font-num text-xl font-semibold tracking-[-.03em] whitespace-nowrap tabular-nums lining-nums ${
        dep ? "text-v3-past" : !val ? "text-v3-ink" : val < 0 ? "text-v3-neg" : "text-v3-pos"
      }`}
    >
      {val === null ? "—" : v.suma !== null ? cuSemn(val, limba) : `+${bani(val, limba)}`}
      <small className="block text-[12.5px] font-semibold tracking-normal text-v3-ink-2">
        {val === null ? t("de calculat") : v.suma !== null ? t("lei/an") : t(v.economie!.unitate)}
      </small>
    </span>
  );
}

/** Bilanțul din v6: costurile și ce poți păstra, ca bare; o bară duce la legea ei. */
function Bilant({ randuri, acces }: { randuri: Rand[]; acces: (id: string) => boolean }) {
  const { t , limba } = useLimba();
  // un cost rămâne cost și după ce termenul acțiunii a trecut (impozitul pe dividende se plătește în continuare);
  // ce n-a intrat încă în vigoare și proiectele nu intră
  const costuri = randuri.filter((r) => (r.stare === "in_vigoare" || r.stare === "incheiata") && (r.v.suma ?? 0) < 0).sort((a, b) => a.v.suma! - b.v.suma!);
  const castig = (r: Rand) => (r.v.suma && r.v.suma > 0 ? r.v.suma : !r.v.economie?.punctuala ? r.v.economie?.suma ?? 0 : 0);
  const castiguri = randuri.filter((r) => r.stare !== "incheiata" && r.stare !== "proiect" && castig(r) > 0).sort((a, b) => castig(b) - castig(a));
  const totalCost = costuri.reduce((s, r) => s + r.v.suma!, 0);
  const totalCastig = castiguri.reduce((s, r) => s + castig(r), 0);
  if (!costuri.length && !castiguri.length) return null;
  const mergi = (id: string) => {
    window.location.hash = `c-${id}`;
    document.getElementById(`c-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const eticheta = (r: Rand) =>
    acces(r.p.schimbare.id) ? (
      r.v.titlu
    ) : (
      <>
        <span aria-hidden="true" className="blur-[4px] select-none">
          {r.v.titlu}
        </span>
        <span className="sr-only">{r.familie}</span>
      </>
    );
  return (
    <section className="mt-4 rounded-2xl border border-v3-line bg-linear-to-b from-v3-tint2 to-v3-card p-5 sm:p-6">
      <h2 className="m-0 mb-4 font-head text-[21px] leading-[1.2] font-extrabold text-v3-ink">{t("Bilanț pe an, pe profilul tău")}</h2>
      <div className="mb-4 flex flex-wrap items-end gap-x-11 gap-y-3">
        {!!costuri.length && (
          <div>
            <span className="mb-1 block text-[13.5px] text-v3-ink-2">{t("Costuri din legi")}</span>
            <b className="font-num text-[40px] leading-none font-semibold tracking-[-.03em] text-v3-neg tabular-nums">
              {cuSemn(totalCost, limba)}
              <small className="ml-1 font-sans text-[14px] font-semibold tracking-normal text-v3-ink-2">{t("lei/an")}</small>
            </b>
          </div>
        )}
        {!!castiguri.length && (
          <div>
            <span className="mb-1 block text-[13.5px] text-v3-ink-2">{t("Ce poți păstra, dacă faci ce permite legea")}</span>
            <b className="font-num text-[40px] leading-none font-semibold tracking-[-.03em] text-v3-pos tabular-nums">
              +{bani(totalCastig, limba)}
              <small className="ml-1 font-sans text-[14px] font-semibold tracking-normal text-v3-ink-2">{t("lei/an")}</small>
            </b>
          </div>
        )}
      </div>
      {[
        { lista: costuri, val: (r: Rand) => -r.v.suma!, culoare: "bg-v3-neg", w: 100 },
        { lista: castiguri, val: castig, culoare: "bg-v3-pos", w: totalCost ? Math.max(12, Math.min(100, (totalCastig / -totalCost) * 100)) : 100 },
      ].map(({ lista, val, culoare, w }, i) =>
        lista.length ? (
          <div key={i} className="mb-3">
            <div className="mb-2 flex h-7 gap-0.5 overflow-hidden rounded-lg" style={{ width: `${w}%` }}>
              {lista.map((r) => (
                <button
                  key={r.p.schimbare.id}
                  type="button"
                  onClick={() => mergi(r.p.schimbare.id)}
                  style={{ flex: val(r) }}
                  aria-label={`${r.familie}, ${bani(val(r), limba)} ${t("lei/an")}`}
                  className={`min-w-2 ${culoare} hover:brightness-90`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {lista.map((r) => (
                <button
                  key={r.p.schimbare.id}
                  type="button"
                  onClick={() => mergi(r.p.schimbare.id)}
                  className="inline-flex max-w-full items-center gap-1.5 py-0.5 text-left text-[13px] text-v3-ink-2 hover:text-v3-ink"
                >
                  <i aria-hidden="true" className={`size-2.5 flex-none rounded-[3px] ${culoare}`} />
                  <span className="truncate">{eticheta(r)}</span>
                  <b className="font-semibold whitespace-nowrap text-v3-ink">
                    {i === 0 ? "−" : "+"}
                    {bani(val(r), limba)}
                  </b>
                </button>
              ))}
            </div>
          </div>
        ) : null,
      )}
      <p className="m-0 text-[12.5px] text-v3-ink-2">{t("Sumele sunt calculul nostru pe profil, nu cifre scrise în lege. Proiectele nu intră în bilanț.")}</p>
    </section>
  );
}

/** „Termene și ce urmează”, coloana din dreapta din v6. */
function Termene({ randuri, acces, azi }: { randuri: Rand[]; acces: (id: string) => boolean; azi: string }) {
  const { t, limba } = useLimba();
  const ev = evenimente(
    randuri.map((r) => r.p),
    {},
    azi,
    limba,
  ).slice(0, 7);
  if (!ev.length) return <aside className="hidden lg:block" />;
  return (
    <aside aria-label={t("Termene și ce urmează")} className="mt-8 lg:mt-0">
      <h3 className="m-0 mb-1 border-b border-v3-line pb-2 text-[13px] font-bold text-v3-ink">{t("Termene și ce urmează")}</h3>
      <ul className="m-0 list-none p-0">
        {ev.map((x) => {
          const [y, m, d] = x.iso.split("-").map(Number);
          const deschis = acces(x.p.schimbare.id);
          return (
            <li key={x.p.schimbare.id + x.iso} className="border-b border-v3-line">
              <a href={`#c-${x.p.schimbare.id}`} className="grid grid-cols-[44px_1fr] gap-2.5 py-3 text-v3-ink no-underline">
                <span className="text-center">
                  <b className={`block font-num text-[24px] leading-none font-semibold ${x.termen && x.zile < ZILE_URGENT ? "text-v3-urg" : ""}`}>{d}</b>
                  <small className="text-[11.5px] text-v3-ink-2">
                    {lunaScurta(limba, m - 1)} {y}
                  </small>
                </span>
                <span className="min-w-0 text-[13.5px] leading-[1.35]">
                  {deschis ? (
                    <span className="block">{x.text}</span>
                  ) : (
                    <span aria-hidden="true" className="block blur-[4px] select-none">
                      {x.text}
                    </span>
                  )}
                  <span className="text-v3-ink-2">
                    {x.termen ? `${t("mai ai")} ${zile(x.zile, limba)}` : `${t("din")} ${dataScurta(x.iso, limba)}`}
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
