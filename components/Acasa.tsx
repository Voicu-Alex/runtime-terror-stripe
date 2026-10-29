"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLimba } from "@/components/Limba";
import { SemnBuzunar } from "@/components/Logo";
import { useAbonament } from "@/components/useAbonament";
import { bani, cuSemn, dataScurta, zile } from "@/lib/card";
import { gasesteSchimbarea } from "@/lib/catalog";
import { sursaAct } from "@/lib/traduceri";
import type { Limba } from "@/lib/i18n";

// Landing page-ul: 7 ecrane pe toată înălțimea ferestrei, cu trecere animată între ele (o rotiță = un ecran),
// mereu pe tema închisă (data-theme="dark" pe rădăcină, ca tokenurile și logo-ul să urmeze tema închisă a site-ului).
// Ordinea: cârlig → trei cazuri reale → ce primești → ce promitem → îndemnul final. Stilurile sunt în app/globals.css (.ld-*).
// Regulile din docs/echipa/design-brief.md: doar urgență reală (termene din lege, calculate față de azi),
// fără „locuri limitate”, fără testimoniale inventate. Textul e în română și engleză, cu aceleași fapte.

/** Cel mai apropiat termen deschis acum, din pagina „Toate legile”, calculat pe server (app/page.tsx). */
export type TermenDeschis = { zile: number; termen: string };

export type Text = Record<Limba, string>;

/** Un card din telefonul primului ecran: o potrivire reală a persoanei fictive, calculată pe server. */
export type CardTelefon = { kicker: Text; titlu: Text; suma: number; unitate: Text; act: Text };
export type Telefon = { nume: string; numar: number; carduri: CardTelefon[] };

type Caz = {
  id: string;
  eticheta: Text;
  /** cine a pierdut: „Cumpărătorii de apartamente noi care n-au aflat la timp” */
  cine: Text;
  suma: number;
  /** ziua în care s-a putut afla (publicarea în Monitorul Oficial) */
  aflat: string;
  ceTrebuia: Text;
  notificare: Text;
  ipoteza: Text;
};

// Trei cazuri reale, din catalog (data/catalog.json) și din pagina „Toate legile” (data/ghid.json).
const CAZURI: Caz[] = [
  {
    id: "tva_locuinta",
    eticheta: { ro: "Cazul 1 · Locuința", en: "Case 1 · Your home" },
    cine: { ro: "Cumpărătorii de apartamente noi care n-au aflat la timp.", en: "Buyers of new flats who did not find out in time." },
    suma: 48000,
    aflat: "2025-07-25",
    ceTrebuia: {
      ro: "Să semnezi contractul cu avans și să plătești 20% din preț până pe 31 iulie. Așa locuința nouă rămânea cu TVA 9%, nu 21%.",
      en: "Sign the contract with a down payment and pay 20% of the price by 31 July. That kept the new home at 9% VAT instead of 21%.",
    },
    notificare: {
      ro: "Locuința nouă pe care o vrei: TVA crește de la 9% la 21% pe 1 august. Ca să rămâi la 9%, plătește avansul de 20% până pe 31 iulie. Mai ai 6 zile.",
      en: "The new home you want: VAT goes from 9% to 21% on 1 August. To stay at 9%, pay the 20% down payment by 31 July. You have 6 days left.",
    },
    ipoteza: { ro: "apartament nou de 400.000 lei fără TVA; Legea 141/2025, art. III", en: "a new flat of 400,000 lei before VAT; Law 141/2025, art. III" },
  },
  {
    id: "dividende_16",
    eticheta: { ro: "Cazul 2 · Firma ta", en: "Case 2 · Your company" },
    cine: { ro: "Asociații de SRL care n-au distribuit dividendele la timp.", en: "SRL owners who did not pay out their dividends in time." },
    suma: 6000,
    aflat: "2025-07-25",
    ceTrebuia: {
      ro: "Să distribui dividendele din profitul anului 2025 până pe 31 decembrie, cu impozitul vechi de 10%. Din 1 ianuarie 2026 impozitul e 16%.",
      en: "Pay out the dividends from 2025 profit by 31 December, at the old 10% tax. From 1 January 2026 the tax is 16%.",
    },
    notificare: {
      ro: "Impozitul pe dividende crește de la 10% la 16% din 1 ianuarie 2026. Distribuie profitul din 2025 până pe 31 decembrie. Vorbește cu contabilul din timp.",
      en: "Dividend tax goes from 10% to 16% on 1 January 2026. Pay out your 2025 profit by 31 December. Talk to your accountant early.",
    },
    ipoteza: { ro: "100.000 lei dividende × 6 puncte; Legea 141/2025, art. II", en: "100,000 lei in dividends × 6 points; Law 141/2025, art. II" },
  },
  {
    id: "prima_stabilitate",
    eticheta: { ro: "Cazul 3 · Primul job", en: "Case 3 · First job" },
    cine: { ro: "Tinerii angajați prima dată fără să treacă pe la AJOFM.", en: "Young people hired for the first time without going to AJOFM." },
    suma: 27000,
    aflat: "2026-03-09",
    ceTrebuia: {
      ro: "Să te înregistrezi la AJOFM înainte să semnezi primul contract pe durată nedeterminată. Cine semnează întâi nu mai primește prima de stabilitate.",
      en: "Register with AJOFM before signing your first permanent contract. Whoever signs first no longer gets the stability bonus.",
    },
    notificare: {
      ro: "Cauți primul job? Înainte să semnezi, înregistrează-te la AJOFM. Statul îți dă 1.000 lei pe lună în primul an și 1.250 în al doilea: 27.000 de lei.",
      en: "Looking for your first job? Register with AJOFM before you sign. The state pays you 1,000 lei a month in year one and 1,250 in year two: 27,000 lei.",
    },
    ipoteza: { ro: "tineri sub 30 de ani; OUG 11/2026, Legea 76/2002 art. 76^5", en: "people under 30; GEO 11/2026, Law 76/2002 art. 76^5" },
  },
];

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
    { ro: "Pașii permiși de lege și termenul, cu numărătoarea calculată din data din act.", en: "The steps the law allows and the deadline, counted down from the date in the act." },
  ],
  [{ ro: "Planul meu", en: "My plan" }, { ro: "Bifezi ce faci și vezi cât păstrezi pe an.", en: "Tick what you do and see how much you keep per year." }],
  [
    { ro: "Sursa lângă fiecare sumă", en: "The source next to every amount" },
    {
      ro: "Actul, Monitorul Oficial, articolul și linkul la Portalul Legislativ. Ce nu am verificat scrie „de confirmat”.",
      en: "The act, the Official Gazette, the article and the link to the Legislative Portal. Anything we have not verified says “to be confirmed”.",
    },
  ],
  [
    { ro: "Toate legile, ordonate după bani", en: "All laws, ranked by money" },
    { ro: "Fiecare schimbare, de la cea care poate salva cei mai mulți bani în jos.", en: "Every change, starting with the one that can save the most money." },
  ],
];

// Răspunsul despre date urmează docs/date-personale.md (fluxurile verificate în cod), nu promisiunea veche „nimic nu pleacă de pe telefon”.
const PROMISIUNI: { mare: [Text, Text]; intrebare: Text; raspuns: Text }[] = [
  {
    mare: [{ ro: "Arătăm", en: "We show" }, { ro: "efectul legii.", en: "the law's effect." }],
    intrebare: { ro: "E sfat financiar?", en: "Is this financial advice?" },
    raspuns: {
      ro: "Nu. Îți arătăm ce schimbă legea și ce acțiuni permite ea. Nu recomandăm produse: trimitem la instrumente oficiale, iar furnizorii apar în ordine alfabetică.",
      en: "No. We show what the law changes and which actions it allows. We do not recommend products: we link to official tools, and providers are listed alphabetically.",
    },
  },
  {
    mare: [{ ro: "Fără", en: "No" }, { ro: "bancă.", en: "bank." }],
    intrebare: { ro: "Ce date îmi luați?", en: "What data do you take?" },
    raspuns: {
      ro: "Nu conectăm banca. Profilul completat de mână e salvat în browser. Dacă încarci un document, fișierul ajunge la serverul aplicației și, pentru analiza AI, la modelul Claude; îți spunem asta înainte, iar formularul manual rămâne alternativa.",
      en: "We never connect to your bank. A profile filled in by hand is saved in your browser. If you upload a document, the file goes to our server and, for the AI analysis, to the Claude model; we tell you before you upload, and the manual form remains an alternative.",
    },
  },
  {
    mare: [{ ro: "Articolul,", en: "The article," }, { ro: "lângă.", en: "right there." }],
    intrebare: { ro: "De unde știu că e adevărat?", en: "How do I know it is true?" },
    raspuns: {
      ro: "Fiecare act are sursa: Monitorul Oficial, articolul și linkul la text. Sumele calculate de noi sunt marcate așa.",
      en: "Every act has its source: the Official Gazette, the article and a link to the text. Amounts we calculated are marked as such.",
    },
  },
];

/** Aplicația („Pentru tine”), la /aplicatie. */
const APLICATIA = "/aplicatie";
const ECRANE = 7;
/** Cât durează alunecarea între două ecrane; până atunci nu pornim alta. */
const BLOCAJ_MS = 900;

/** Sumele în formatul limbii: 48.000 în română, 48,000 în engleză. */
function suma(n: number, limba: Limba): string {
  return bani(n, limba);
}

function Buton({ href, onClick, secundar, children }: { href?: string; onClick?: () => void; secundar?: boolean; children: React.ReactNode }) {
  const cls = `ld-btn${secundar ? " ld-btn-sec" : ""}`;
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/** Bara fixă de sus: logo, „Toate legile”, „Intră” / „Cont”, RO · EN. */
function Bara() {
  const { limba, setLimba, t } = useLimba();
  const stare = useAbonament();
  return (
    <div className="ld-bara">
      <Link href="/" className="ld-marca">
        <SemnBuzunar className="h-7" />
        <b>{t("Buzunar")}</b>
      </Link>
      <nav aria-label={t("Secțiuni")} className="ld-bara-dr">
        <Link href="/legi" className="ld-ascuns-mic">
          {t("Toate legile")}
        </Link>
        <Link href="/conectare">{stare?.conectat ? t("Cont") : t("Intră")}</Link>
        <span role="group" aria-label="Limba / Language" className="ld-limbi">
          {(["ro", "en"] as Limba[]).map((l, i) => (
            <span key={l}>
              {i > 0 && <span aria-hidden="true"> · </span>}
              <button type="button" aria-pressed={limba === l} onClick={() => setLimba(l)}>
                {l}
              </button>
            </span>
          ))}
        </span>
      </nav>
    </div>
  );
}

function Hero({ primul, telefon, spreCum }: { primul: TermenDeschis | null; telefon: Telefon; spreCum: () => void }) {
  const { limba } = useLimba();
  const en = limba === "en";
  return (
    <section className="ld-ecran ld-hero" id="e1" aria-label={en ? "Start" : "Început"}>
      <div className="ld-grain" />
      <div className="ld-glow" style={{ width: "46vw", height: "46vw", left: "28vw", top: "34vh", background: "#00853A", "--o": 0.28 } as React.CSSProperties} />
      <div className="ld-glow" style={{ width: "24vw", height: "24vw", left: "50vw", top: "10vh", background: "#E0101E", "--o": 0.28, animationDelay: "-4s" } as React.CSSProperties} />
      <div>
        <h1 className="ld-h1 ld-in" style={{ "--i": 0 } as React.CSSProperties}>
          {en ? (
            <>
              The law gave you
              <br />6 days to keep
              <br />
              <span className="ld-pos">48,000 lei.</span>
            </>
          ) : (
            <>
              Legea ți-a dat
              <br />6 zile să păstrezi
              <br />
              <span className="ld-pos">48.000 de lei.</span>
            </>
          )}
        </h1>
        <div className="ld-butoane ld-in" style={{ "--i": 1 } as React.CSSProperties}>
          <Buton href={APLICATIA}>{en ? "Open the app" : "Deschide aplicația"}</Buton>
          <Buton onClick={spreCum} secundar>
            {en ? "How it works" : "Cum funcționează"}
          </Buton>
        </div>
        <p className="ld-lead ld-in" style={{ "--i": 2 } as React.CSSProperties}>
          {en ? "Every new law, translated into lei per year for you, with what you can do and by when." : "Fiecare lege nouă, tradusă în lei pe an pentru tine, cu ce poți face și până când."}
        </p>
      </div>

      {/* Telefonul: potrivirile reale ale persoanei fictive, calculate pe server */}
      <div className="ld-tel ld-in ld-urca" style={{ "--i": 2 } as React.CSSProperties} aria-label={en ? "Preview of the app" : "Previzualizarea aplicației"}>
        <div className="ld-tel-sus" />
        <div className="ld-tel-in">
          <p className="ld-kick">
            {en ? "For you" : "Pentru tine"} · {telefon.nume}
          </p>
          <p className="ld-tel-t">{en ? `${telefon.numar} laws touch your money.` : `${telefon.numar} legi îți ating banii.`}</p>
          {telefon.carduri.map((c) => (
            <div key={c.titlu.ro} className="ld-lcard">
              <small>{c.kicker[limba]}</small>
              <div className="ld-lcard-t">{c.titlu[limba]}</div>
              <div className={`ld-lcard-s ${c.suma < 0 ? "ld-neg" : "ld-pos"}`}>
                {cuSemn(c.suma, limba)}
                <em>{c.unitate[limba]}</em>
              </div>
              <div className="ld-lcard-a">{c.act[limba]}</div>
            </div>
          ))}
          {primul && <span className="ld-pilula">{en ? `A deadline closes in ${zile(primul.zile, limba)}` : `Un termen se închide peste ${zile(primul.zile)}`}</span>}
        </div>
      </div>
      <p className="ld-deruleaza" aria-hidden="true">
        {en ? "Scroll" : "Derulează"}
      </p>
    </section>
  );
}

function CazEcran({ c, nr }: { c: Caz; nr: number }) {
  const { limba } = useLimba();
  const en = limba === "en";
  const s = gasesteSchimbarea(c.id)!;
  const rosu = nr % 2 === 0;
  const stil = rosu
    ? ({ width: "36vw", height: "36vw", right: "-6vw", top: "20vh", background: "#E0101E", "--o": 0.22 } as React.CSSProperties)
    : ({ width: "40vw", height: "40vw", right: "-4vw", bottom: "-12vh", background: "#00853A", "--o": 0.28 } as React.CSSProperties);
  return (
    <section className="ld-ecran ld-caz" id={`e${nr + 1}`} aria-label={c.eticheta[limba]}>
      <div className="ld-grain" />
      <div className="ld-glow" style={stil} />
      <div>
        <p className="ld-eyebrow ld-in" style={{ "--i": 0 } as React.CSSProperties}>
          {c.eticheta[limba]}
        </p>
        <h2 className="ld-h1 ld-h1-caz ld-in" style={{ "--i": 1 } as React.CSSProperties}>
          {c.cine[limba]}
        </h2>
        <p className="ld-suma ld-neg ld-in" style={{ "--i": 2 } as React.CSSProperties}>
          −{suma(c.suma, limba)}
          <small>lei</small>
        </p>
        <p className="ld-lead ld-in" style={{ "--i": 3 } as React.CSSProperties}>
          <b>{en ? "What the law allowed:" : "Ce permitea legea:"}</b> {c.ceTrebuia[limba]}
        </p>
        <p className="ld-ipoteza ld-in" style={{ "--i": 4 } as React.CSSProperties}>
          {en ? "Our calculation:" : "Calculul nostru:"} {c.ipoteza[limba]}.{" "}
          <a href={s.sursa_url} target="_blank" rel="noopener">
            {en ? "The law text (RO) ↗︎" : "Textul legii ↗︎"}
          </a>
        </p>
      </div>

      {/* Ce ar fi făcut aplicația: notificarea din ziua în care a apărut legea */}
      <aside className="ld-notif ld-in ld-urca" style={{ "--i": 3 } as React.CSSProperties} aria-label={en ? "What the app would have done" : "Ce ar fi făcut aplicația"}>
        <p className="ld-notif-sus">
          <SemnBuzunar className="h-4" />
          <b>{en ? "Pocket" : "Buzunar"}</b>
          <span>
            · {dataScurta(c.aflat, limba)} · {en ? "what we would have told you that day" : "ce ți-am fi spus în ziua aceea"}
          </span>
        </p>
        <p className="ld-notif-text">{c.notificare[limba]}</p>
        <p className="ld-notif-jos ld-pos">{en ? `What you could keep: ${suma(c.suma, limba)} lei` : `Ce puteai păstra: ${suma(c.suma, limba)} lei`}</p>
      </aside>
    </section>
  );
}

function CePrimesti() {
  const { limba } = useLimba();
  const en = limba === "en";
  return (
    <section className="ld-ecran" id="e5" aria-label={en ? "What you get" : "Ce primești"}>
      <div className="ld-grain" />
      <div className="ld-glow" style={{ width: "40vw", height: "40vw", left: "30vw", top: "-20vh", background: "#00853A", "--o": 0.22 } as React.CSSProperties} />
      <p className="ld-eyebrow ld-in" style={{ "--i": 0 } as React.CSSProperties}>
        {en ? "What you get" : "Ce primești"}
      </p>
      <h2 className="ld-h1 ld-h2 ld-in" style={{ "--i": 1 } as React.CSSProperties}>
        {en ? "One place that tells you what to do with your money, before it is too late." : "Un singur loc care îți spune ce faci cu banii, înainte să fie târziu."}
      </h2>
      <ul className="ld-grila">
        {CE_PRIMESTI.map(([t, desc], i) => (
          <li key={t.ro} className="ld-tile ld-in" style={{ "--i": i + 2 } as React.CSSProperties}>
            <b>{t[limba]}</b>
            <p>{desc[limba]}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Promisiuni() {
  const { limba } = useLimba();
  const en = limba === "en";
  const s = gasesteSchimbarea("tva_locuinta")!;
  const sursa = sursaAct(s, limba);
  const mini = [
    <div key="a" className="ld-mini">
      <small>{en ? "What you can do · from the law" : "Ce poți face · din lege"}</small>
      <div className="ld-rand">
        <span className="ld-bifa" />
        {en ? "Pay the 20% down payment by 31 July" : "Plătești avansul de 20% până pe 31 iulie"}
      </div>
      <div className="ld-rand">
        <span className="ld-bifa" />
        {en ? "Ask for the 9% VAT contract in writing" : "Ceri contractul cu TVA 9% în scris"}
      </div>
      <div className="ld-rand ld-gri">
        <span className="ld-bifa ld-x" />
        <s>{en ? "The best loan for you" : "Cel mai bun credit pentru tine"}</s>
      </div>
    </div>,
    <div key="b" className="ld-mini">
      <small>{en ? "Your profile · saved on this device" : "Profilul tău · salvat pe dispozitiv"}</small>
      <div className="ld-cipuri">
        {(en ? ["Salary", "IT", "Renting", "Car", "Pillar II"] : ["Salariu", "IT", "Chirie", "Mașină", "Pilon II"]).map((x) => (
          <span key={x}>{x}</span>
        ))}
        <span className="ld-plus">+ 3</span>
      </div>
    </div>,
    <div key="c" className="ld-mini">
      <small>{en ? "Source" : "Sursa"}</small>
      <div className="ld-rand">
        <b>{sursa.act.text}, art. III</b>
      </div>
      <div className="ld-rand ld-gri">{sursa.mo_ref.text}</div>
      <div className="ld-rand">
        <a href={s.sursa_url} target="_blank" rel="noopener" className="ld-link">
          legislatie.just.ro ↗
        </a>
        <span className="ld-calc">{en ? "our calculation" : "calcul propriu"}</span>
      </div>
    </div>,
  ];
  return (
    <section className="ld-ecran" id="e6" aria-label={en ? "Before you start" : "Înainte să începi"}>
      <div className="ld-grain" />
      <div className="ld-glow" style={{ width: "38vw", height: "38vw", right: "-8vw", top: "-14vh", background: "#00853A", "--o": 0.2 } as React.CSSProperties} />
      <p className="ld-eyebrow ld-in" style={{ "--i": 0 } as React.CSSProperties}>
        {en ? "Before you start" : "Înainte să începi"}
      </p>
      <h2 className="ld-h1 ld-h2 ld-in" style={{ "--i": 1 } as React.CSSProperties}>
        {en ? "Three things we promise." : "Trei lucruri pe care le promitem."}
      </h2>
      <div className="ld-grila ld-trei">
        {PROMISIUNI.map((p, i) => (
          <div key={p.intrebare.ro} className="ld-tile ld-in" style={{ "--i": i + 2 } as React.CSSProperties}>
            <p className="ld-mare">
              {p.mare[0][limba]} <span className="ld-pos">{p.mare[1][limba]}</span>
            </p>
            <b>{p.intrebare[limba]}</b>
            <p>{p.raspuns[limba]}</p>
            {mini[i]}
          </div>
        ))}
      </div>
    </section>
  );
}

function Final({ primul }: { primul: TermenDeschis | null }) {
  const { limba } = useLimba();
  const en = limba === "en";
  return (
    <section className="ld-ecran ld-final" id="e7" aria-label={en ? "Start now" : "Începe acum"}>
      <div className="ld-grain" />
      <div className="ld-glow" style={{ width: "50vw", height: "30vw", left: "25vw", top: "35vh", background: "#00853A", "--o": 0.28 } as React.CSSProperties} />
      <SemnBuzunar className="ld-in h-[72px]" />
      <h2 className="ld-h1 ld-h2 ld-in" style={{ "--i": 1 } as React.CSSProperties}>
        {en ? "The next law with a deadline will not announce itself." : "Următoarea lege cu termen nu te va anunța singură."}
      </h2>
      <p className="ld-lead ld-in" style={{ "--i": 2 } as React.CSSProperties}>
        {en ? "We will." : "Noi da."}
      </p>
      {primul && (
        <p className="ld-lead ld-termen ld-in" style={{ "--i": 3 } as React.CSSProperties}>
          {en ? (
              <>
                The nearest deadline closes on <b>{dataScurta(primul.termen, limba)}</b>: you have <b className="ld-neg">{zile(primul.zile, limba)}</b> left.
              </>
            ) : (
              <>
                Cel mai apropiat termen se închide pe <b>{dataScurta(primul.termen)}</b>: mai ai <b className="ld-neg">{zile(primul.zile)}</b>.
              </>
            )}
        </p>
      )}
      <div className="ld-butoane ld-in" style={{ "--i": 4 } as React.CSSProperties}>
        <Buton href={APLICATIA}>{en ? "Open the app" : "Deschide aplicația"}</Buton>
        <Buton href="/legi" secundar>
          {en ? "All laws" : "Toate legile"}
        </Buton>
      </div>
      <p className="ld-nota ld-in" style={{ "--i": 5 } as React.CSSProperties}>
        {en ? "Not financial advice. We show the effect of the law and what the law allows." : "Nu e sfat financiar. Arătăm efectul legii și ce permite legea."}{" "}
        <Link href="/surse">{en ? "Sources and limits" : "Surse și limitări"}</Link>
      </p>
    </section>
  );
}

export function Acasa({ primul, telefon }: { primul: TermenDeschis | null; telefon: Telefon }) {
  const { limba } = useLimba();
  const en = limba === "en";
  const pagini = useRef<HTMLDivElement>(null);
  const [activ, setActiv] = useState(0);
  const blocat = useRef(false);
  const ultimaRotita = useRef({ t: 0, dy: 0 });

  const ecrane = useCallback(() => (pagini.current ? ([...pagini.current.querySelectorAll<HTMLElement>(".ld-ecran")] as HTMLElement[]) : []), []);
  const lin = () => (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  const mergiLa = useCallback(
    (i: number) => {
      const e = ecrane();
      const tinta = e[Math.min(e.length - 1, Math.max(0, i))];
      if (!tinta || blocat.current) return;
      blocat.current = true;
      tinta.scrollIntoView({ behavior: lin() });
      setTimeout(() => (blocat.current = false), BLOCAJ_MS);
    },
    [ecrane],
  );

  useEffect(() => {
    const p = pagini.current;
    if (!p) return;
    // pagina din spate (layout-ul) nu derulează cât e landing-ul pe ecran
    document.documentElement.classList.add("ld-blocat");

    // intrările: când ecranul e pe jumătate vizibil, elementele lui intră și punctul lui se aprinde
    const e = ecrane();
    // (pe telefon un ecran poate fi mai înalt decât fereastra: atunci contează cât din fereastră acoperă)
    const io = new IntersectionObserver(
      (xs) =>
        xs.forEach((x) => {
          if (x.intersectionRatio >= 0.5 || x.intersectionRect.height >= p.clientHeight * 0.5) {
            x.target.classList.add("ld-vizibil");
            setActiv(e.indexOf(x.target as HTMLElement));
          }
        }),
      { root: p, threshold: [0.2, 0.35, 0.5] },
    );
    e.forEach((s) => io.observe(s));

    // link direct la un ecran (#e3): sari acolo fără animație
    const m = /^#e([1-7])$/.exec(location.hash);
    if (m) {
      p.style.scrollBehavior = "auto";
      p.scrollTop = e[Number(m[1]) - 1]?.offsetTop ?? 0;
      requestAnimationFrame(() => (p.style.scrollBehavior = ""));
    }

    const curent = () => {
      const i = e.findIndex((s) => Math.abs(s.offsetTop - p.scrollTop) < 10);
      return i < 0 ? Math.round(p.scrollTop / p.clientHeight) : i;
    };
    // o rotiță = un ecran; inerția trackpad-ului (evenimente dese, cu delta în scădere) nu pornește încă unul
    const peRotita = (ev: WheelEvent) => {
      const acum = performance.now();
      const dy = Math.abs(ev.deltaY);
      const { t, dy: dyVechi } = ultimaRotita.current;
      ultimaRotita.current = { t: acum, dy };
      if (dy < 4) return;
      const cur = curent();
      // un ecran mai înalt decât fereastra se derulează normal, ca să nu sărim peste conținut
      if (e[cur] && e[cur].offsetHeight > p.clientHeight + 2) return;
      ev.preventDefault();
      if (blocat.current) return;
      const gestNou = acum - t > 80 || dy > dyVechi * 2;
      if (!gestNou) return;
      mergiLa(cur + (ev.deltaY > 0 ? 1 : -1));
    };
    const peTasta = (ev: KeyboardEvent) => {
      if (ev.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
      if (ev.key === "ArrowDown" || ev.key === "PageDown") (ev.preventDefault(), mergiLa(curent() + 1));
      if (ev.key === "ArrowUp" || ev.key === "PageUp") (ev.preventDefault(), mergiLa(curent() - 1));
    };
    p.addEventListener("wheel", peRotita, { passive: false });
    addEventListener("keydown", peTasta);
    return () => {
      io.disconnect();
      p.removeEventListener("wheel", peRotita);
      removeEventListener("keydown", peTasta);
      document.documentElement.classList.remove("ld-blocat");
    };
  }, [ecrane, mergiLa]);

  return (
    <div className="ld" data-theme="dark">
      <Bara />
      <nav aria-label={en ? "Screens" : "Ecranele"} className="ld-puncte">
        {Array.from({ length: ECRANE }, (_, i) => (
          <button key={i} type="button" aria-label={en ? `Screen ${i + 1}` : `Ecranul ${i + 1}`} aria-current={activ === i ? "true" : undefined} onClick={() => mergiLa(i)} />
        ))}
      </nav>
      <div ref={pagini} className="ld-pagini">
        <Hero primul={primul} telefon={telefon} spreCum={() => mergiLa(4)} />
        {CAZURI.map((c, i) => (
          <CazEcran key={c.id} c={c} nr={i + 1} />
        ))}
        <CePrimesti />
        <Promisiuni />
        <Final primul={primul} />
      </div>
    </div>
  );
}
