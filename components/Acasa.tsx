"use client";

import Link from "next/link";
import { useLimba } from "@/components/Limba";
import { bani, dataScurta, zile, ZILE_URGENT } from "@/lib/card";
import { gasesteSchimbarea } from "@/lib/catalog";
import { sursaAct } from "@/lib/traduceri";
import type { Limba } from "@/lib/i18n";

// Landing page după DotCom Secrets (Russell Brunson): cârlig → poveste → ofertă, cu FOMO și urgență.
// Regulile din docs/echipa/design-brief.md: doar urgență reală (termene din lege, calculate față de azi),
// fără „locuri limitate”, fără testimoniale inventate, fără preț (abonamentul e încă decizie de echipă).
// Textul e în română și engleză (pitch-ul e în engleză); engleza traduce aceleași fapte, fără cifre noi.

/** Un termen deschis acum, din pagina „Toate legile”, calculat pe server (app/page.tsx). */
export type TermenDeschis = {
  id: string;
  zile: number;
  termen: string;
  pentru: string;
  ce: string;
  salvezi: { lei: number; cand: string; perioada?: string } | null;
};

type Text = Record<Limba, string>;

type Caz = {
  id: string;
  eticheta: Text;
  titlu: Text;
  suma: number;
  /** ziua în care s-a putut afla (publicarea în Monitorul Oficial) */
  aflat: string;
  /** ultima zi în care se mai putea face ceva; null când „termenul” e un moment din viața ta */
  termen: string | null;
  termenText: Text;
  ceTrebuia: Text;
  notificare: Text;
  ipoteza: Text;
  /** categoria de persoane afectată, scurt, sub titlu */
  afectati: Text;
  /** propoziția „cine a pierdut cât”, cu categoria exactă */
  aPierdut: Text;
};

// Trei cazuri reale, din catalog (data/catalog.json) și din pagina „Toate legile” (data/ghid.json).
const CAZURI: Caz[] = [
  {
    id: "tva_locuinta",
    eticheta: { ro: "Cazul 1 · Locuința", en: "Case 1 · Your home" },
    titlu: { ro: "6 zile ca să păstrezi 48.000 de lei", en: "6 days to keep 48,000 lei" },
    suma: 48000,
    aflat: "2025-07-25",
    termen: "2025-07-31",
    termenText: { ro: "avansul de 20% plătit până pe 31 iulie 2025", en: "the 20% down payment made by 31 July 2025" },
    ceTrebuia: {
      ro: "Să semnezi contractul cu avans și să plătești 20% din preț până pe 31 iulie. Așa locuința nouă rămânea cu TVA 9%, nu 21%.",
      en: "Sign the contract with a down payment and pay 20% of the price by 31 July. That kept the new home at 9% VAT instead of 21%.",
    },
    notificare: {
      ro: "Locuința nouă pe care o vrei: TVA crește de la 9% la 21% pe 1 august. Ca să rămâi la 9%, plătește avansul de 20% până pe 31 iulie. Mai ai 6 zile.",
      en: "The new home you want: VAT goes from 9% to 21% on 1 August. To stay at 9%, pay the 20% down payment by 31 July. You have 6 days left.",
    },
    ipoteza: {
      ro: "apartament nou de 400.000 lei fără TVA; Legea 141/2025, art. III",
      en: "a new flat of 400,000 lei before VAT; Law 141/2025, art. III",
    },
    afectati: {
      ro: "Cumpărătorii de locuințe noi de până la 120 mp și 600.000 lei",
      en: "Buyers of new homes up to 120 m² and 600,000 lei",
    },
    aPierdut: {
      ro: "Cumpărătorii de locuințe noi care n-au plătit avansul de 20% până pe 31 iulie 2025 au pierdut 48.000 de lei la un apartament de 400.000 lei.",
      en: "Buyers of new homes who did not pay the 20% down payment by 31 July 2025 lost 48,000 lei on a 400,000 lei flat.",
    },
  },
  {
    id: "dividende_16",
    eticheta: { ro: "Cazul 2 · Firma ta", en: "Case 2 · Your company" },
    titlu: { ro: "5 luni ca să nu dai statului încă 6.000 de lei", en: "5 months to avoid paying the state another 6,000 lei" },
    suma: 6000,
    aflat: "2025-07-25",
    termen: "2025-12-31",
    termenText: { ro: "dividendele distribuite până pe 31 decembrie 2025", en: "dividends paid out by 31 December 2025" },
    ceTrebuia: {
      ro: "Să distribui dividendele din profitul anului 2025 până pe 31 decembrie, cu impozitul vechi de 10%. Din 1 ianuarie 2026 impozitul e 16%.",
      en: "Pay out the dividends from 2025 profit by 31 December, at the old 10% tax. From 1 January 2026 the tax is 16%.",
    },
    notificare: {
      ro: "Impozitul pe dividende crește de la 10% la 16% din 1 ianuarie 2026. Distribuie profitul din 2025 până pe 31 decembrie. Vorbește cu contabilul din timp.",
      en: "Dividend tax goes from 10% to 16% on 1 January 2026. Pay out your 2025 profit by 31 December. Talk to your accountant early.",
    },
    ipoteza: { ro: "100.000 lei dividende × 6 puncte; Legea 141/2025, art. II", en: "100,000 lei in dividends × 6 points; Law 141/2025, art. II" },
    afectati: { ro: "Asociații de SRL care își plătesc dividende", en: "Owners of limited companies (SRL) who pay themselves dividends" },
    aPierdut: {
      ro: "Asociații de SRL care n-au distribuit dividendele din 2025 până pe 31 decembrie au pierdut 6.000 de lei la fiecare 100.000 de lei de dividende.",
      en: "SRL owners who did not pay out their 2025 dividends by 31 December lost 6,000 lei for every 100,000 lei of dividends.",
    },
  },
  {
    id: "prima_stabilitate",
    eticheta: { ro: "Cazul 3 · Primul job", en: "Case 3 · First job" },
    titlu: { ro: "27.000 de lei care depind de ordinea în care semnezi", en: "27,000 lei that depend on the order you sign in" },
    suma: 27000,
    aflat: "2026-03-09",
    termen: null,
    termenText: { ro: "înregistrarea la AJOFM înainte să semnezi contractul", en: "registering with AJOFM (the employment agency) before you sign the contract" },
    ceTrebuia: {
      ro: "Să te înregistrezi la AJOFM înainte să semnezi primul contract pe durată nedeterminată. Cine semnează întâi nu mai primește prima de stabilitate.",
      en: "Register with AJOFM before signing your first permanent contract. Whoever signs first no longer gets the stability bonus.",
    },
    notificare: {
      ro: "Cauți primul job? Înainte să semnezi, înregistrează-te la AJOFM. Statul îți dă 1.000 lei pe lună în primul an și 1.250 în al doilea: 27.000 de lei.",
      en: "Looking for your first job? Register with AJOFM before you sign. The state pays you 1,000 lei a month in year one and 1,250 in year two: 27,000 lei.",
    },
    ipoteza: { ro: "tineri sub 30 de ani; OUG 11/2026, Legea 76/2002 art. 76^5", en: "people under 30; GEO 11/2026, Law 76/2002 art. 76^5" },
    afectati: {
      ro: "Tinerii sub 30 de ani la primul contract pe durată nedeterminată",
      en: "People under 30 signing their first permanent contract",
    },
    aPierdut: {
      ro: "Tinerii sub 30 de ani angajați prima dată pe durată nedeterminată fără să fie înscriși la AJOFM înainte au pierdut 27.000 de lei.",
      en: "People under 30 hired on their first permanent contract without registering with AJOFM first lost 27,000 lei.",
    },
  },
];

/** Sumele în formatul limbii: 48.000 în română, 48,000 în engleză. */
function suma(n: number, limba: Limba): string {
  return limba === "en" ? Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 }) : bani(n);
}

function zileIntre(deLa: string, panaLa: string): number {
  const ms = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((ms(panaLa) - ms(deLa)) / 86_400_000);
}

function Cta({ href, children, secundar }: { href: string; children: React.ReactNode; secundar?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[52px] items-center justify-center rounded-[12px] px-6 text-[16px] font-bold no-underline ${
        secundar ? "border border-v3-line bg-v3-card text-v3-ink" : "bg-v3-ink text-v3-on-ink hover:bg-v3-ink-strong"
      }`}
    >
      {children}
    </Link>
  );
}

function Titlu({ eticheta, children }: { eticheta: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="m-0 mb-2 text-xs font-extrabold tracking-[.12em] text-v3-accent uppercase">{eticheta}</p>
      <h2 className="m-0 font-head text-[clamp(26px,5.6vw,38px)] leading-[1.12] font-extrabold tracking-[-.015em] text-v3-ink">{children}</h2>
    </div>
  );
}

function CazReal({ c, nr }: { c: Caz; nr: number }) {
  const { limba } = useLimba();
  const en = limba === "en";
  const s = gasesteSchimbarea(c.id)!;
  const fereastra = c.termen ? zileIntre(c.aflat, c.termen) : null;
  const d = (iso: string) => dataScurta(iso, limba);
  return (
    <article className="grid gap-6 border-t border-v3-line py-9 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
      <div>
        <p className="m-0 mb-2 flex items-center gap-3 text-xs font-extrabold tracking-[.12em] text-v3-accent uppercase">
          <span className="font-num font-semibold tabular-nums lining-nums text-[40px] leading-none text-v3-tint1">{String(nr).padStart(2, "0")}</span>
          {c.eticheta[limba]}
        </p>
        <h3 className="m-0 font-head text-[clamp(24px,5vw,32px)] leading-[1.15] font-extrabold tracking-[-.015em] text-v3-ink">{c.titlu[limba]}</h3>
        <p className="m-0 mt-2.5 inline-flex flex-wrap items-center gap-2 rounded-full bg-v3-accent-soft px-3 py-1 text-[13.5px] font-semibold text-v3-ink">
          <span className="text-[11px] font-extrabold tracking-[.1em] text-v3-accent uppercase">{en ? "Affected" : "Afectați"}</span>
          {c.afectati[limba]}
        </p>

        {/* Linia timpului: când se putea afla, până când se putea face ceva */}
        <ol className="m-0 mt-5 grid list-none gap-0 p-0 sm:grid-cols-3">
          <li className="border-l-[3px] border-v3-accent py-1 pl-3 sm:border-t-[3px] sm:border-l-0 sm:pt-3 sm:pl-0">
            <span className="block text-[11px] font-extrabold tracking-[.1em] text-v3-ink-2 uppercase">{en ? "The law appears" : "Apare legea"}</span>
            <b className="block text-[16px]">{d(c.aflat)}</b>
            <span className="block text-[13px] text-v3-ink-2">{sursaAct(s, limba).mo_ref.text}</span>
          </li>
          <li className="border-l-[3px] border-v3-urg py-1 pl-3 sm:border-t-[3px] sm:border-l-0 sm:pt-3 sm:pl-0">
            <span className="block text-[11px] font-extrabold tracking-[.1em] text-v3-urg uppercase">{en ? "The window" : "Fereastra"}</span>
            <b className="block text-[16px] text-v3-urg">{fereastra !== null ? zile(fereastra, limba) : en ? "until you sign" : "până semnezi"}</b>
            <span className="block text-[13px] text-v3-ink-2">{c.termenText[limba]}</span>
          </li>
          <li className="border-l-[3px] border-v3-past py-1 pl-3 sm:border-t-[3px] sm:border-l-0 sm:pt-3 sm:pl-0">
            <span className="block text-[11px] font-extrabold tracking-[.1em] text-v3-past uppercase">{en ? "After" : "După"}</span>
            <b className="block text-[16px] text-v3-past">
              {c.termen ? (en ? "nothing can be done" : "nu se mai poate face nimic") : en ? "the bonus is lost" : "prima e pierdută"}
            </b>
            <span className="block text-[13px] text-v3-ink-2">
              {c.termen ? (en ? `from ${d(c.termen)}` : `din ${d(c.termen)}`) : en ? "if you signed first" : "dacă ai semnat întâi"}
            </span>
          </li>
        </ol>

        <p className="m-0 mt-5 max-w-[62ch] text-[17px] leading-[1.6] text-v3-ink-soft">
          <b>{en ? "What you had to do:" : "Ce trebuia făcut:"}</b> {c.ceTrebuia[limba]}
        </p>
        <div className="mt-5 rounded-2xl border border-v3-neg/20 bg-v3-urg-soft p-4">
          <p className="m-0 text-[11px] font-extrabold tracking-[.1em] text-v3-neg uppercase">{en ? "Who lost out" : "Cine a pierdut"}</p>
          <p className="m-0 mt-1 flex flex-wrap items-baseline gap-x-3">
            <span className="font-num font-semibold tabular-nums lining-nums text-[44px] leading-none tracking-[-.03em] text-v3-neg">−{suma(c.suma, limba)}</span>
            <span className="text-[15px] font-semibold text-v3-neg">lei</span>
          </p>
          <p className="m-0 mt-2 max-w-[60ch] text-[16px] leading-[1.5] font-semibold text-v3-ink">{c.aPierdut[limba]}</p>
        </div>
        <p className="m-0 mt-1 text-[13px] text-v3-ink-2">
          {en ? "Our calculation:" : "Calculul nostru:"} {c.ipoteza[limba]}.{" "}
          <a href={s.sursa_url} target="_blank" rel="noopener" className="font-semibold text-v3-accent">
            {en ? "The law text (RO) ↗︎" : "Textul legii ↗︎"}
          </a>
        </p>
      </div>

      {/* Ce ar fi făcut aplicația: notificarea din ziua în care a apărut legea */}
      <aside aria-label={en ? "What the app would have done" : "Ce ar fi făcut aplicația"} className="self-start">
        <p className="m-0 mb-2 text-[11px] font-extrabold tracking-[.1em] text-v3-pos uppercase">{en ? "What we would have told you that day" : "Ce ți-am fi spus în ziua aceea"}</p>
        <div className="rounded-[22px] bg-v3-band p-3 shadow-[0_18px_40px_-18px_rgba(17,24,39,.55)] ring-1 ring-white/10">
          <p className="m-0 mb-2 text-center text-[12px] font-semibold text-v3-band-ink-2">{d(c.aflat)} · 09:41</p>
          <div className="rounded-2xl bg-v3-card p-3.5">
            <p className="m-0 flex items-center gap-2 text-[12px] font-bold text-v3-ink-2">
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-v3-logo text-[10px] font-extrabold text-v3-on-ink">cî</span>
              Ce înseamnă pentru mine · {en ? "now" : "acum"}
            </p>
            <p className="m-0 mt-2 text-[14.5px] leading-[1.45] font-semibold text-v3-ink">{c.notificare[limba]}</p>
            <p className="m-0 mt-2 text-[12.5px] font-bold text-v3-pos">
              {en ? `You keep up to ${suma(c.suma, limba)} lei` : `Păstrezi până la ${suma(c.suma, limba)} lei`}
            </p>
          </div>
        </div>
      </aside>
    </article>
  );
}

const CE_PRIMESTI: [Text, Text][] = [
  [
    { ro: "Profilul din documente", en: "A profile from your documents" },
    {
      ro: "Încarci un fluturaș, un contract sau o factură. Etichetele și cifrele se completează singure; tu scoți ce nu e cazul.",
      en: "Upload a payslip, a contract or a bill. The tags and figures fill themselves in; you remove what does not apply.",
    },
  ],
  [
    { ro: "Fluxul tău, în lei pe an", en: "Your feed, in lei per year" },
    { ro: "Fiecare lege care te atinge, cu suma pentru tine: cât pierzi, cât câștigi.", en: "Every law that affects you, with your amount: what you lose, what you gain." },
  ],
  [
    { ro: "Ce poți face și până când", en: "What you can do, and by when" },
    {
      ro: "Pașii permiși de lege și termenul, cu numărătoarea calculată din data din act.",
      en: "The steps the law allows and the deadline, counted down from the date in the act.",
    },
  ],
  [
    { ro: "Planul meu", en: "My plan" },
    { ro: "Bifezi ce faci și vezi cât păstrezi pe an. Bara de jos se schimbă pe loc.", en: "Tick what you do and see how much you keep per year. The bar updates instantly." },
  ],
  [
    { ro: "Sursa lângă fiecare sumă", en: "The source next to every amount" },
    {
      ro: "Actul, Monitorul Oficial, articolul și linkul la Portalul Legislativ. Ce nu am verificat scrie „de confirmat”.",
      en: "The act, the Official Gazette, the article and the link to the Legislative Portal. Anything we have not verified says “to be confirmed”.",
    },
  ],
  [
    { ro: "Toate legile, ordonate după bani", en: "All laws, ranked by money" },
    {
      ro: "Pagina generală: fiecare schimbare, de la cea care poate salva cei mai mulți bani în jos.",
      en: "The overview page: every change, starting with the one that can save the most money.",
    },
  ],
];

const INTREBARI: [Text, Text][] = [
  [
    { ro: "E sfat financiar?", en: "Is this financial advice?" },
    {
      ro: "Nu. Îți arătăm ce schimbă legea și ce acțiuni permite ea. Nu recomandăm produse: trimitem la instrumente oficiale, iar furnizorii apar în ordine alfabetică.",
      en: "No. We show what the law changes and which actions it allows. We do not recommend products: we link to official tools, and providers are listed alphabetically.",
    },
  ],
  [
    { ro: "Ce date îmi luați?", en: "What data do you take?" },
    {
      ro: "Profilul stă pe telefonul tău. Documentele sunt citite o dată și nu le păstrăm; acoperă CNP-ul și IBAN-ul înainte.",
      en: "Your profile stays on your phone. Documents are read once and never stored; cover your personal ID number and IBAN first.",
    },
  ],
  [
    { ro: "De unde știu că e adevărat?", en: "How do I know it is true?" },
    {
      ro: "Fiecare act are sursa: Monitorul Oficial, articolul și linkul la text. Sumele calculate de noi sunt marcate așa.",
      en: "Every act has its source: the Official Gazette, the article and a link to the text. Amounts we calculated are marked as such.",
    },
  ],
];

export function Acasa({ azi, deschise }: { azi: string; deschise: TermenDeschis[] }) {
  const { limba } = useLimba();
  const en = limba === "en";
  const primul = deschise[0];
  const d = (iso: string) => dataScurta(iso, limba);
  // În engleză, termenele deschise folosesc titlul actului în engleză (textele din ghid sunt în română).
  const linie = (a: TermenDeschis) => (en ? gasesteSchimbarea(a.id)?.rezumat_en ?? a.ce : null);

  return (
    <div className="mx-auto max-w-[980px]">
      {/* HOOK */}
      <section className="rounded-3xl border border-v3-tintb bg-linear-135 from-v3-tint1 via-v3-tint2 via-45% to-v3-card px-5 py-9 sm:px-10 sm:py-12">
        <p className="m-0 mb-4 inline-flex flex-wrap items-center gap-2 text-xs font-extrabold tracking-[.12em] text-v3-accent uppercase">
          {en ? "The law, in your money" : "Legea, pe banii tăi"}
          {primul && (
            <span className={`rounded-full px-2.5 py-1 tracking-normal normal-case ${primul.zile < ZILE_URGENT ? "bg-v3-urg text-v3-on-ink" : "bg-v3-card text-v3-ink"}`}>
              {en ? `A deadline in the law closes in ${zile(primul.zile, limba)}` : `Un termen din lege se închide peste ${zile(primul.zile)}`}
            </span>
          )}
        </p>
        <h1 className="m-0 max-w-[18ch] font-head text-[clamp(34px,7.4vw,60px)] leading-[1.04] font-extrabold tracking-[-.025em] text-v3-ink">
          {en ? (
            <>
              The law gave you 6 days to keep <span className="font-num font-bold tracking-[-.035em] text-v3-pos">48,000 lei</span>. Did you know?
            </>
          ) : (
            <>
              Legea ți-a dat 6 zile să păstrezi <span className="font-num font-bold tracking-[-.035em] text-v3-pos">48.000 de lei</span>. Ai aflat?
            </>
          )}
        </h1>
        <p className="m-0 mt-5 max-w-[56ch] text-[19px] leading-[1.55] text-v3-ink-soft">
          {en ? (
            <>
              On 25 July 2025, a law made new homes 12% more expensive. Anyone who paid a down payment in the next 6 days escaped it. Anyone who
              found out later paid the difference. <b>We tell you on the day the law appears: what it costs you, what you can do and by when.</b>
            </>
          ) : (
            <>
              Pe 25 iulie 2025, o lege a scumpit locuințele noi cu 12%. Cine plătea un avans în următoarele 6 zile scăpa. Cine a aflat după a
              plătit diferența. <b>Noi îți spunem în ziua în care apare legea: cât te costă, ce poți face și până când.</b>
            </>
          )}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Cta href="/profil">{en ? "See what affects you" : "Vezi ce te privește"}</Cta>
          <Cta href="/legi" secundar>
            {en ? "All laws, by how much you can save" : "Toate legile, după cât poți salva"}
          </Cta>
        </div>
        <p className="m-0 mt-4 text-[13.5px] text-v3-ink-2">
          {en
            ? "No bank login. Fill in your profile by hand or with AI. Every amount has the law and the article next to it."
            : "Nu conectezi banca. Poți completa profilul manual sau cu AI. Fiecare sumă are legea și articolul lângă ea."}
        </p>
      </section>

      {/* STORY: trei cazuri reale */}
      <section className="mt-14">
        <Titlu eticheta={en ? "Three real cases from the past year" : "Trei cazuri reale din ultimul an"}>
          {en ? "The money was there. The deadline passed." : "Banii erau acolo. Termenul a trecut."}
        </Titlu>
        <p className="m-0 max-w-[62ch] text-[17px] leading-[1.6] text-v3-ink-2">
          {en
            ? "You do not need to know the law. You just need to find out in time. Here is what happened, and what we would have told you on the day the act appeared in the Official Gazette (Monitorul Oficial)."
            : "Nu e nevoie să cunoști legea. Trebuie doar să afli la timp. Iată ce s-a întâmplat și ce ți-am fi spus în ziua în care a apărut actul în Monitorul Oficial."}
        </p>
        <div className="mt-4">
          {CAZURI.map((c, i) => (
            <CazReal key={c.id} c={c} nr={i + 1} />
          ))}
        </div>
      </section>

      {/* URGENȚA REALĂ: termenele deschise acum */}
      <section className="mt-6 rounded-3xl bg-v3-band px-5 py-9 text-v3-band-ink sm:px-10">
        <p className="m-0 mb-2 text-xs font-extrabold tracking-[.12em] text-v3-band-ink-2 uppercase">
          {en ? "Today" : "Azi"}, {d(azi)}
        </p>
        <h2 className="m-0 font-head text-[clamp(26px,5.6vw,38px)] leading-[1.12] font-extrabold tracking-[-.015em]">
          {en ? "Deadlines closing now" : "Termenele care se închid acum"}
        </h2>
        <p className="m-0 mt-3 max-w-[60ch] text-[16px] text-v3-band-ink-2">
          {en
            ? "No made-up countdowns: every date is written in the law and the days are counted from today."
            : "Nu sunt numărători inventate: fiecare dată e scrisă în lege și zilele se calculează față de azi."}
        </p>
        <ul className="m-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-2">
          {deschise.map((a) => {
            const urgent = a.zile < ZILE_URGENT;
            return (
              <li key={a.id} className="rounded-2xl bg-white/[.06] p-4 ring-1 ring-white/15">
                <p className="m-0 flex flex-wrap items-center gap-2 text-[12.5px] font-bold">
                  <span className={`rounded-full px-2.5 py-0.5 ${urgent ? "bg-v3-urg text-v3-on-ink" : "bg-white/15"}`}>
                    {en ? `${zile(a.zile, limba)} left` : `mai ai ${zile(a.zile)}`}
                  </span>
                  <span className="text-v3-band-ink-2">{en ? `until ${d(a.termen)}` : `până pe ${d(a.termen)}`}</span>
                </p>
                <p className="m-0 mt-2 text-[15px] leading-[1.4] font-semibold">
                  {en ? (
                    linie(a)
                  ) : (
                    <>
                      <span className="text-v3-band-ink-2">{a.pentru}:</span> {a.ce}
                    </>
                  )}
                </p>
                {a.salvezi && (
                  <p className="m-0 mt-1.5 text-[14px] font-bold text-v3-band-pos">
                    {en
                      ? `keep up to ${suma(a.salvezi.lei, limba)} lei ${a.salvezi.cand === "o_data" ? "once" : "per year"}`
                      : `păstrezi până la ${suma(a.salvezi.lei, limba)} lei ${a.salvezi.perioada ?? (a.salvezi.cand === "o_data" ? "o dată" : "pe an")}`}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/profil" className="inline-flex min-h-[52px] items-center rounded-[12px] bg-v3-band-ink px-6 text-[16px] font-bold text-v3-band no-underline">
            {en ? "Find out which ones affect you" : "Află care dintre ele te privesc"}
          </Link>
        </div>
      </section>

      {/* OFFER: ce primești */}
      <section className="mt-14">
        <Titlu eticheta={en ? "What you get" : "Ce primești"}>
          {en ? "One place that tells you what to do with your money, before it is too late" : "Un singur loc care îți spune ce faci cu banii, înainte să fie târziu"}
        </Titlu>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {CE_PRIMESTI.map(([t, desc]) => (
            <li key={t.ro} className="rounded-2xl border border-v3-line bg-v3-card p-5">
              <p className="m-0 flex items-center gap-2 text-[17px] font-bold text-v3-ink">
                <span aria-hidden="true" className="inline-flex size-6 items-center justify-center rounded-full bg-v3-pos-soft text-[13px] text-v3-pos">
                  ✓
                </span>
                {t[limba]}
              </p>
              <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-v3-ink-2">{desc[limba]}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* OBIECȚII */}
      <section className="mt-14">
        <Titlu eticheta={en ? "Questions" : "Întrebări"}>{en ? "Before you start" : "Înainte să începi"}</Titlu>
        <dl className="m-0 grid gap-x-8 gap-y-6 sm:grid-cols-3">
          {INTREBARI.map(([q, a]) => (
            <div key={q.ro}>
              <dt className="text-[17px] font-bold text-v3-ink">{q[limba]}</dt>
              <dd className="m-0 mt-1.5 text-[15px] leading-[1.55] text-v3-ink-2">{a[limba]}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA FINAL */}
      <section className="mt-14 rounded-3xl border border-v3-tintb bg-linear-135 from-v3-tint1 via-v3-tint2 via-45% to-v3-card px-5 py-10 text-center sm:px-10">
        <h2 className="m-0 mx-auto max-w-[22ch] font-head text-[clamp(28px,6vw,42px)] leading-[1.1] font-extrabold tracking-[-.02em] text-v3-ink">
          {en ? "The next law with a deadline will not announce itself." : "Următoarea lege cu termen nu te va anunța singură."}
        </h2>
        {primul && (
          <p className="m-0 mt-3 text-[17px] text-v3-ink-soft">
            {en ? (
              <>
                The nearest deadline closes on <b>{d(primul.termen)}</b>: you have <b className="text-v3-urg">{zile(primul.zile, limba)}</b> left.
              </>
            ) : (
              <>
                Cel mai apropiat termen se închide pe <b>{d(primul.termen)}</b>: mai ai <b className="text-v3-urg">{zile(primul.zile)}</b>.
              </>
            )}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Cta href="/profil">{en ? "Fill in your profile" : "Completează profilul"}</Cta>
          <Cta href="/flux?p=andrei" secundar>
            {en ? "See an example: Andrei, 32" : "Vezi un exemplu: Andrei, 32"}
          </Cta>
        </div>
        <p className="m-0 mt-4 text-[13.5px] text-v3-ink-2">
          {en ? "Other fictional examples:" : "Alte exemple fictive:"} <Link href="/flux?p=maria">Maria, 45</Link> · <Link href="/flux?p=ion">Ion, 67</Link> ·{" "}
          <Link href="/flux?p=ioana">Ioana, 23</Link>
        </p>
      </section>
    </div>
  );
}
