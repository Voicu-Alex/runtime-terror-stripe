"use client";

import Link from "next/link";
import { useLimba } from "@/components/Limba";
import { bani, dataScurta, zile, ZILE_URGENT } from "@/lib/card";
import { gasesteSchimbarea } from "@/lib/catalog";
import { sursaAct } from "@/lib/traduceri";
import type { Limba } from "@/lib/i18n";

// Landing page după DotCom Secrets (Russell Brunson): cârlig → poveste → ofertă, cu FOMO și urgență.
// E pagina principală (app/page.tsx); aplicația, macheta v6 a lui Andrei, e la /aplicatie. Aspectul urmează v6.
// Regulile din docs/echipa/design-brief.md: doar urgență reală (termene din lege, calculate față de azi),
// fără „locuri limitate”, fără testimoniale inventate, fără preț (abonamentul e încă decizie de echipă).
// Textul e în română și engleză (pitch-ul e în engleză); engleza traduce aceleași fapte, fără cifre noi.

/** Cel mai apropiat termen deschis acum, din pagina „Toate legile”, calculat pe server (app/page.tsx). */
export type TermenDeschis = { zile: number; termen: string };

type Text = Record<Limba, string>;

type Caz = {
  id: string;
  eticheta: Text;
  /** cine a pierdut, la începutul titlului: „Cumpărătorii de apartamente noi care n-au aflat la timp” */
  cine: Text;
  suma: number;
  /** ziua în care s-a putut afla (publicarea în Monitorul Oficial) */
  aflat: string;
  /** ultima zi în care se mai putea face ceva; null când „termenul” e un moment din viața ta */
  termen: string | null;
  termenText: Text;
  ceTrebuia: Text;
  notificare: Text;
  ipoteza: Text;
  /** categoria de persoane afectată, cu condițiile din lege, sub titlu */
  afectati: Text;
};

// Trei cazuri reale, din catalog (data/catalog.json) și din pagina „Toate legile” (data/ghid.json).
const CAZURI: Caz[] = [
  {
    id: "tva_locuinta",
    eticheta: { ro: "Cazul 1 · Locuința", en: "Case 1 · Your home" },
    cine: { ro: "Cumpărătorii de apartamente noi care n-au aflat la timp", en: "Buyers of new flats who did not find out in time" },
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
  },
  {
    id: "dividende_16",
    eticheta: { ro: "Cazul 2 · Firma ta", en: "Case 2 · Your company" },
    cine: { ro: "Asociații de SRL care n-au distribuit dividendele la timp", en: "SRL owners who did not pay out their dividends in time" },
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
  },
  {
    id: "prima_stabilitate",
    eticheta: { ro: "Cazul 3 · Primul job", en: "Case 3 · First job" },
    cine: { ro: "Tinerii angajați prima dată fără să treacă pe la AJOFM", en: "Young people hired for the first time without going to AJOFM" },
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

// Stilul machetei v6 a lui Andrei (mockup/v6/index.html, mockup/v5/base.css): carduri cu bordură fină și colțuri de 14 px,
// degradeu de la gri cald la alb, titluri Raleway 800, cifre în Geist, butoane închise cu colțuri de 10 px.
const CARD = "rounded-[14px] border border-v3-line bg-v3-card";
const BILANT = "rounded-[14px] border border-v3-line bg-linear-to-b from-v3-tint2 to-v3-card to-70%";

function Cta({ href, children, secundar }: { href: string; children: React.ReactNode; secundar?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[46px] items-center justify-center rounded-[10px] border px-[18px] text-[15px] font-bold no-underline ${
        secundar ? "border-v3-ink bg-v3-card text-v3-ink" : "border-v3-ink bg-v3-ink text-v3-on-ink hover:bg-v3-ink-strong"
      }`}
    >
      {children}
    </Link>
  );
}

/** Titlul unei secțiuni, ca „lh” din v6: Raleway 800, cu o notă mică în dreapta. */
function Titlu({ children, nota }: { children: React.ReactNode; nota?: string }) {
  return (
    <h2 className="m-0 mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-head text-[clamp(22px,4.4vw,28px)] leading-[1.2] font-extrabold tracking-[-.01em] text-v3-ink">
      {children}
      {nota && <span className="font-sans text-[13.5px] font-medium tracking-normal text-v3-ink-2">{nota}</span>}
    </h2>
  );
}

function CazReal({ c, nr }: { c: Caz; nr: number }) {
  const { limba } = useLimba();
  const en = limba === "en";
  const s = gasesteSchimbarea(c.id)!;
  const fereastra = c.termen ? zileIntre(c.aflat, c.termen) : null;
  const d = (iso: string) => dataScurta(iso, limba);
  return (
    <article className="grid gap-6 border-b border-v3-line py-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
      <div>
        <p className="m-0 mb-2 flex flex-wrap items-center gap-2 text-[13px] text-v3-ink-2">
          <span className="font-num text-[15px] font-semibold tabular-nums text-v3-ink-2">{String(nr).padStart(2, "0")}</span>
          <span className="font-semibold">{c.eticheta[limba]}</span>
        </p>
        <h3 className="m-0 font-head text-[clamp(22px,4.6vw,30px)] leading-[1.18] font-extrabold tracking-[-.01em] text-v3-ink">
          {c.cine[limba]} {en ? "lost" : "au pierdut"}{" "}
          <span className="font-num font-semibold tracking-[-.03em] whitespace-nowrap text-v3-neg">
            {suma(c.suma, limba)} {en ? "lei" : "de lei"}
          </span>
        </h3>
        <p className="m-0 mt-2.5 flex flex-wrap items-center gap-1.5 text-[13.5px] text-v3-ink-2">
          {en ? "Affects:" : "Îi privește pe:"}
          <span className="rounded-full bg-v3-ink px-2.5 py-0.5 text-[12.5px] font-semibold text-v3-on-ink">{c.afectati[limba]}</span>
        </p>

        {/* Linia timpului: când se putea afla, până când se putea face ceva */}
        <ol className="m-0 mt-5 grid list-none gap-3 p-0 sm:grid-cols-3">
          <li className={`${CARD} px-3.5 py-3`}>
            <span className="block text-[12.5px] font-semibold text-v3-ink-2">{en ? "The law appears" : "Apare legea"}</span>
            <b className="block font-num text-[17px] font-semibold tabular-nums">{d(c.aflat)}</b>
            <span className="block text-[12.5px] text-v3-ink-2">{sursaAct(s, limba).mo_ref.text}</span>
          </li>
          <li className="rounded-[14px] border border-v3-urg/30 bg-v3-urg-soft px-3.5 py-3">
            <span className="block text-[12.5px] font-semibold text-v3-urg">{en ? "Deadline" : "Termen"}</span>
            <b className="block font-num text-[17px] font-semibold tabular-nums text-v3-urg">
              {fereastra !== null ? zile(fereastra, limba) : en ? "until you sign" : "până semnezi"}
            </b>
            <span className="block text-[12.5px] text-v3-ink-2">{c.termenText[limba]}</span>
          </li>
          <li className="rounded-[14px] border border-v3-line bg-v3-past-bg px-3.5 py-3">
            <span className="block text-[12.5px] font-semibold text-v3-past">{en ? "Action closed" : "Acțiune încheiată"}</span>
            <b className="block text-[15px] font-semibold text-v3-past">
              {c.termen ? (en ? "nothing left to do" : "nu se mai poate face nimic") : en ? "the bonus is lost" : "prima e pierdută"}
            </b>
            <span className="block text-[12.5px] text-v3-ink-2">
              {c.termen ? (en ? `from ${d(c.termen)}` : `din ${d(c.termen)}`) : en ? "if you signed first" : "dacă ai semnat întâi"}
            </span>
          </li>
        </ol>

        <p className="m-0 mt-5 max-w-[62ch] text-[16px] leading-[1.6] text-v3-ink-soft">
          <b>{en ? "What the law allowed:" : "Ce permitea legea:"}</b> {c.ceTrebuia[limba]}
        </p>
        <p className="m-0 mt-2 text-[13px] text-v3-ink-2">
          {en ? "Our calculation:" : "Calculul nostru:"} {c.ipoteza[limba]}.{" "}
          <a href={s.sursa_url} target="_blank" rel="noopener" className="font-semibold text-v3-accd">
            {en ? "The law text (RO) ↗︎" : "Textul legii ↗︎"}
          </a>
        </p>
      </div>

      {/* Ce ar fi făcut aplicația: notificarea din ziua în care a apărut legea */}
      <aside aria-label={en ? "What the app would have done" : "Ce ar fi făcut aplicația"} className="self-start">
        <p className="m-0 mb-2 text-[13px] font-semibold text-v3-pos">{en ? "What we would have told you that day" : "Ce ți-am fi spus în ziua aceea"}</p>
        <div className={`${BILANT} p-4`}>
          <p className="m-0 flex items-center justify-between gap-2 text-[12.5px] text-v3-ink-2">
            <span className="flex items-center gap-2 font-semibold">
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-v3-logo text-[10px] font-extrabold text-v3-on-ink">B</span>
              {en ? "Pocket" : "Buzunar"}
            </span>
            <span className="font-num tabular-nums">{d(c.aflat)}</span>
          </p>
          <p className="m-0 mt-2.5 text-[14.5px] leading-[1.45] font-semibold text-v3-ink">{c.notificare[limba]}</p>
          <p className="m-0 mt-2.5 text-[13px] font-semibold text-v3-pos">
            {en ? `What you could keep: ${suma(c.suma, limba)} lei` : `Ce puteai păstra: ${suma(c.suma, limba)} lei`}
          </p>
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
    { ro: "Ce te privește, în lei pe an", en: "What affects you, in lei per year" },
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
    { ro: "Bifezi ce faci și vezi cât păstrezi pe an.", en: "Tick what you do and see how much you keep per year." },
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

// Răspunsul despre date urmează docs/date-personale.md (fluxurile verificate în cod), nu promisiunea veche „nimic nu pleacă de pe telefon”.
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
      ro: "Nu conectăm banca. Profilul completat de mână e salvat în browser. Dacă încarci un document, fișierul ajunge la serverul aplicației și, pentru analiza AI, la Anthropic; îți spunem asta înainte, iar formularul manual rămâne alternativa.",
      en: "We never connect to your bank. A profile filled in by hand is saved in your browser. If you upload a document, the file goes to our server and, for the AI analysis, to Anthropic; we tell you before you upload, and the manual form remains an alternative.",
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

/** Aplicația (macheta v6 a lui Andrei), servită la /aplicatie (next.config.ts). */
const APLICATIA = "/aplicatie";

export function Acasa({ primul }: { primul: TermenDeschis | null }) {
  const { limba } = useLimba();
  const en = limba === "en";
  const d = (iso: string) => dataScurta(iso, limba);

  return (
    <div className="mx-auto max-w-[980px]">
      {/* CÂRLIG: ca „bilanțul” din v6 */}
      <section className={`${BILANT} px-5 py-8 sm:px-9 sm:py-10`}>
        <p className="m-0 mb-4 flex flex-wrap items-center gap-2 text-[13px] text-v3-ink-2">
          <span className="font-semibold">{en ? "The law, in your money" : "Legea, pe banii tăi"}</span>
          {primul && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[12.5px] font-semibold ${
                primul.zile < ZILE_URGENT ? "bg-v3-urg text-v3-on-ink" : "border border-v3-line bg-v3-card text-v3-ink"
              }`}
            >
              {en ? `A deadline in the law closes in ${zile(primul.zile, limba)}` : `Un termen din lege se închide peste ${zile(primul.zile)}`}
            </span>
          )}
        </p>
        <h1 className="m-0 max-w-[19ch] font-head text-[clamp(32px,6.6vw,54px)] leading-[1.06] font-extrabold tracking-[-.02em] text-v3-ink">
          {en ? (
            <>
              The law gave you 6 days to keep <span className="font-num font-semibold tracking-[-.035em] text-v3-pos">48,000 lei</span>. Did you know?
            </>
          ) : (
            <>
              Legea ți-a dat 6 zile să păstrezi <span className="font-num font-semibold tracking-[-.035em] text-v3-pos">48.000 de lei</span>. Ai aflat?
            </>
          )}
        </h1>
        <p className="m-0 mt-5 max-w-[58ch] text-[18px] leading-[1.55] text-v3-ink-soft">
          {en ? (
            <>
              On 25 July 2025, a law raised VAT on new homes from 9% to 21%. Anyone who paid a down payment in the next 6 days kept 9%. Anyone who
              found out later paid the difference. <b>We tell you on the day the law appears: what it costs you, what you can do and by when.</b>
            </>
          ) : (
            <>
              Pe 25 iulie 2025, o lege a crescut TVA-ul la locuințele noi de la 9% la 21%. Cine plătea un avans în următoarele 6 zile păstra 9%.
              Cine a aflat după a plătit diferența. <b>Noi îți spunem în ziua în care apare legea: cât te costă, ce poți face și până când.</b>
            </>
          )}
        </p>
        <div className="mt-7 flex flex-wrap gap-2.5">
          <Cta href={APLICATIA}>{en ? "See what affects you" : "Vezi ce te privește"}</Cta>
          <Cta href="/legi" secundar>
            {en ? "All laws, by how much you can save" : "Toate legile, după cât poți salva"}
          </Cta>
        </div>
        <p className="m-0 mt-4 text-[13px] text-v3-ink-2">
          {en
            ? "No bank login. Fill in your profile by hand or with AI. Every amount has the law and the article next to it."
            : "Nu conectezi banca. Poți completa profilul manual sau cu AI. Fiecare sumă are legea și articolul lângă ea."}
        </p>
      </section>

      {/* POVESTEA: trei cazuri reale */}
      <section className="mt-12">
        <Titlu nota={en ? "three real cases from the past year" : "trei cazuri reale din ultimul an"}>
          {en ? "The money was there. The deadline passed." : "Banii erau acolo. Termenul a trecut."}
        </Titlu>
        <p className="m-0 max-w-[62ch] text-[16px] leading-[1.6] text-v3-ink-2">
          {en
            ? "You do not need to know the law. You just need to find out in time. Here is what happened, and what we would have told you on the day the act appeared in the Official Gazette (Monitorul Oficial)."
            : "Nu e nevoie să cunoști legea. Trebuie doar să afli la timp. Iată ce s-a întâmplat și ce ți-am fi spus în ziua în care a apărut actul în Monitorul Oficial."}
        </p>
        <div className="mt-4 border-t border-v3-line">
          {CAZURI.map((c, i) => (
            <CazReal key={c.id} c={c} nr={i + 1} />
          ))}
        </div>
      </section>


      {/* OFERTA: ce primești */}
      <section className="mt-12">
        <Titlu>{en ? "One place that tells you what to do with your money, before it is too late" : "Un singur loc care îți spune ce faci cu banii, înainte să fie târziu"}</Titlu>
        <ul className="m-0 mt-4 grid list-none gap-3 p-0 sm:grid-cols-2">
          {CE_PRIMESTI.map(([t, desc]) => (
            <li key={t.ro} className={`${CARD} p-4`}>
              <p className="m-0 flex items-center gap-2 text-[16px] font-bold text-v3-ink">
                <span aria-hidden="true" className="inline-flex size-[22px] items-center justify-center rounded-full bg-v3-pos-soft text-[12px] text-v3-pos">
                  ✓
                </span>
                {t[limba]}
              </p>
              <p className="m-0 mt-1.5 text-[14.5px] leading-[1.5] text-v3-ink-2">{desc[limba]}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* OBIECȚII */}
      <section className="mt-12">
        <Titlu>{en ? "Before you start" : "Înainte să începi"}</Titlu>
        <dl className="m-0 mt-4 grid gap-x-8 gap-y-5 border-t border-v3-line pt-5 sm:grid-cols-3">
          {INTREBARI.map(([q, a]) => (
            <div key={q.ro}>
              <dt className="text-[16px] font-bold text-v3-ink">{q[limba]}</dt>
              <dd className="m-0 mt-1.5 text-[14.5px] leading-[1.55] text-v3-ink-2">{a[limba]}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ÎNDEMNUL FINAL */}
      <section className={`${BILANT} mt-12 px-5 py-9 text-center sm:px-9`}>
        <h2 className="m-0 mx-auto max-w-[24ch] font-head text-[clamp(26px,5.4vw,38px)] leading-[1.12] font-extrabold tracking-[-.015em] text-v3-ink">
          {en ? "The next law with a deadline will not announce itself." : "Următoarea lege cu termen nu te va anunța singură."}
        </h2>
        {primul && (
          <p className="m-0 mt-3 text-[16px] text-v3-ink-soft">
            {en ? (
              <>
                The nearest deadline closes on <b className="font-num">{d(primul.termen)}</b>: you have{" "}
                <b className="font-num text-v3-urg">{zile(primul.zile, limba)}</b> left.
              </>
            ) : (
              <>
                Cel mai apropiat termen se închide pe <b className="font-num">{d(primul.termen)}</b>: mai ai{" "}
                <b className="font-num text-v3-urg">{zile(primul.zile)}</b>.
              </>
            )}
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <Cta href={APLICATIA}>{en ? "Open the app" : "Deschide aplicația"}</Cta>
          <Cta href="/legi" secundar>
            {en ? "All laws" : "Toate legile"}
          </Cta>
        </div>
        <p className="m-0 mt-4 text-[13px] text-v3-ink-2">
          {en ? "Not financial advice. We show the effect of the law and what the law allows." : "Nu e sfat financiar. Arătăm efectul legii și ce permite legea."}
        </p>
      </section>
    </div>
  );
}
