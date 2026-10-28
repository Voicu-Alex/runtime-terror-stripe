import Link from "next/link";
import { dataScurta, mii, zile, ZILE_URGENT } from "@/lib/card";
import { CATALOG, gasesteSchimbarea } from "@/lib/catalog";
import { GHID, ordoneaza } from "@/lib/ghid";
import { aziISO } from "@/lib/potrivire";

// Landing page după DotCom Secrets (Russell Brunson): cârlig → poveste → ofertă, cu FOMO și urgență.
// Regulile din docs/echipa/design-brief.md: doar urgență reală (termene din lege, calculate față de azi),
// fără „locuri limitate”, fără testimoniale inventate, fără preț (abonamentul e încă decizie de echipă).
// Termenele deschise se calculează la fiecare cerere, ca numărătoarea să fie mereu cea de azi.
export const dynamic = "force-dynamic";

function zileIntre(deLa: string, panaLa: string): number {
  const ms = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((ms(panaLa) - ms(deLa)) / 86_400_000);
}

type Caz = {
  id: string;
  eticheta: string;
  titlu: string;
  suma: string;
  /** ziua în care s-a putut afla (publicarea în Monitorul Oficial) */
  aflat: string;
  /** ultima zi în care se mai putea face ceva; null când „termenul” e un moment din viața ta */
  termen: string | null;
  termenText: string;
  ceTrebuia: string;
  notificare: string;
  ipoteza: string;
  /** cine pierde suma */
  cine: string;
};

// Trei cazuri reale, din catalog (data/catalog.json) și din pagina „Toate legile” (data/ghid.json).
const CAZURI: Caz[] = [
  {
    id: "tva_locuinta",
    eticheta: "Cazul 1 · Locuința",
    titlu: "6 zile ca să păstrezi 48.000 de lei",
    suma: "48.000",
    aflat: "2025-07-25",
    termen: "2025-07-31",
    termenText: "avansul de 20% plătit până pe 31 iulie 2025",
    ceTrebuia: "Să semnezi contractul cu avans și să plătești 20% din preț până pe 31 iulie. Așa locuința nouă rămânea cu TVA 9%, nu 21%.",
    notificare: "Locuința nouă pe care o vrei: TVA crește de la 9% la 21% pe 1 august. Ca să rămâi la 9%, plătește avansul de 20% până pe 31 iulie. Mai ai 6 zile.",
    ipoteza: "apartament nou de 400.000 lei fără TVA; Legea 141/2025, art. III",
    cine: "lei pierduți de cine a aflat prea târziu",
  },
  {
    id: "dividende_16",
    eticheta: "Cazul 2 · Firma ta",
    titlu: "5 luni ca să nu dai statului încă 6.000 de lei",
    suma: "6.000",
    aflat: "2025-07-25",
    termen: "2025-12-31",
    termenText: "dividendele distribuite până pe 31 decembrie 2025",
    ceTrebuia: "Să distribui dividendele din profitul anului 2025 până pe 31 decembrie, cu impozitul vechi de 10%. Din 1 ianuarie 2026 impozitul e 16%.",
    notificare: "Impozitul pe dividende crește de la 10% la 16% din 1 ianuarie 2026. Distribuie profitul din 2025 până pe 31 decembrie. Vorbește cu contabilul din timp.",
    ipoteza: "100.000 lei dividende × 6 puncte; Legea 141/2025, art. II",
    cine: "lei pierduți de cine a aflat prea târziu",
  },
  {
    id: "prima_stabilitate",
    eticheta: "Cazul 3 · Primul job",
    titlu: "27.000 de lei care depind de ordinea în care semnezi",
    suma: "27.000",
    aflat: "2026-03-09",
    termen: null,
    termenText: "înregistrarea la AJOFM înainte să semnezi contractul",
    ceTrebuia: "Să te înregistrezi la AJOFM înainte să semnezi primul contract pe durată nedeterminată. Cine semnează întâi nu mai primește prima de stabilitate.",
    notificare: "Cauți primul job? Înainte să semnezi, înregistrează-te la AJOFM. Statul îți dă 1.000 lei pe lună în primul an și 1.250 în al doilea: 27.000 de lei.",
    ipoteza: "tineri sub 30 de ani; OUG 11/2026, Legea 76/2002 art. 76^5",
    cine: "lei pierduți de cine semnează contractul înainte de AJOFM",
  },
];

function Cta({ href, children, secundar }: { href: string; children: React.ReactNode; secundar?: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-[52px] items-center justify-center rounded-[12px] px-6 text-[16px] font-bold no-underline ${
        secundar ? "border border-v3-line bg-white text-v3-ink" : "bg-v3-ink text-white hover:bg-black"
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
  const s = gasesteSchimbarea(c.id)!;
  const fereastra = c.termen ? zileIntre(c.aflat, c.termen) : null;
  return (
    <article className="grid gap-6 border-t border-v3-line py-9 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
      <div>
        <p className="m-0 mb-2 flex items-center gap-3 text-xs font-extrabold tracking-[.12em] text-v3-accent uppercase">
          <span className="font-head text-[40px] leading-none text-v3-tint1">{String(nr).padStart(2, "0")}</span>
          {c.eticheta}
        </p>
        <h3 className="m-0 font-head text-[clamp(24px,5vw,32px)] leading-[1.15] font-extrabold tracking-[-.015em] text-v3-ink">{c.titlu}</h3>

        {/* Linia timpului: când se putea afla, până când se putea face ceva */}
        <ol className="m-0 mt-5 grid list-none gap-0 p-0 sm:grid-cols-3">
          <li className="border-l-[3px] border-v3-accent py-1 pl-3 sm:border-t-[3px] sm:border-l-0 sm:pt-3 sm:pl-0">
            <span className="block text-[11px] font-extrabold tracking-[.1em] text-v3-ink-2 uppercase">Apare legea</span>
            <b className="block text-[16px]">{dataScurta(c.aflat)}</b>
            <span className="block text-[13px] text-v3-ink-2">{s.mo_ref}</span>
          </li>
          <li className="border-l-[3px] border-v3-urg py-1 pl-3 sm:border-t-[3px] sm:border-l-0 sm:pt-3 sm:pl-0">
            <span className="block text-[11px] font-extrabold tracking-[.1em] text-v3-urg uppercase">Fereastra</span>
            <b className="block text-[16px] text-v3-urg">{fereastra !== null ? zile(fereastra) : "până semnezi"}</b>
            <span className="block text-[13px] text-v3-ink-2">{c.termenText}</span>
          </li>
          <li className="border-l-[3px] border-v3-past py-1 pl-3 sm:border-t-[3px] sm:border-l-0 sm:pt-3 sm:pl-0">
            <span className="block text-[11px] font-extrabold tracking-[.1em] text-v3-past uppercase">După</span>
            <b className="block text-[16px] text-v3-past">{c.termen ? "nu se mai poate face nimic" : "prima e pierdută"}</b>
            <span className="block text-[13px] text-v3-ink-2">{c.termen ? `din ${dataScurta(c.termen)}` : "dacă ai semnat întâi"}</span>
          </li>
        </ol>

        <p className="m-0 mt-5 max-w-[62ch] text-[17px] leading-[1.6] text-[#1F2937]">
          <b>Ce trebuia făcut:</b> {c.ceTrebuia}
        </p>
        <p className="m-0 mt-4 flex flex-wrap items-baseline gap-x-3">
          <span className="font-head text-[44px] leading-none font-extrabold tracking-[-.02em] text-v3-neg">−{c.suma}</span>
          <span className="text-[15px] font-semibold text-v3-ink-2">{c.cine}</span>
        </p>
        <p className="m-0 mt-1 text-[13px] text-v3-ink-2">
          Calculul nostru: {c.ipoteza}.{" "}
          <a href={s.sursa_url} target="_blank" rel="noopener" className="font-semibold text-v3-accent">
            Textul legii ↗︎
          </a>
        </p>
      </div>

      {/* Ce ar fi făcut aplicația: notificarea din ziua în care a apărut legea */}
      <aside aria-label="Ce ar fi făcut aplicația" className="self-start">
        <p className="m-0 mb-2 text-[11px] font-extrabold tracking-[.1em] text-v3-pos uppercase">Ce ți-am fi spus în ziua aceea</p>
        <div className="rounded-[22px] bg-v3-ink p-3 shadow-[0_18px_40px_-18px_rgba(17,24,39,.55)]">
          <p className="m-0 mb-2 text-center text-[12px] font-semibold text-[#D1D5DB]">{dataScurta(c.aflat)} · 09:41</p>
          <div className="rounded-2xl bg-white p-3.5">
            <p className="m-0 flex items-center gap-2 text-[12px] font-bold text-v3-ink-2">
              <span className="inline-flex size-5 items-center justify-center rounded-md bg-v3-logo text-[10px] font-extrabold text-white">cî</span>
              Ce înseamnă pentru mine · acum
            </p>
            <p className="m-0 mt-2 text-[14.5px] leading-[1.45] font-semibold text-v3-ink">{c.notificare}</p>
            <p className="m-0 mt-2 text-[12.5px] font-bold text-v3-pos">Păstrezi până la {c.suma} lei</p>
          </div>
        </div>
      </aside>
    </article>
  );
}

export default function Acasa() {
  const azi = aziISO();
  // Termenele care se închid acum, din pagina „Toate legile”: doar cele încă deschise, cele mai apropiate primele.
  const deschise = ordoneaza(GHID, CATALOG, azi)
    .active.filter((a) => a.zile !== null && a.zile >= 0)
    .sort((a, b) => a.zile! - b.zile!);
  const primul = deschise[0];

  return (
    <div className="mx-auto max-w-[980px]">
      {/* HOOK */}
      <section className="rounded-3xl border border-v3-tintb bg-linear-135 from-v3-tint1 via-v3-tint2 via-45% to-white px-5 py-9 sm:px-10 sm:py-12">
        <p className="m-0 mb-4 inline-flex flex-wrap items-center gap-2 text-xs font-extrabold tracking-[.12em] text-v3-accent uppercase">
          Legea, pe banii tăi
          {primul && (
            <span className={`rounded-full px-2.5 py-1 tracking-normal normal-case ${primul.zile! < ZILE_URGENT ? "bg-v3-urg text-white" : "bg-white text-v3-ink"}`}>
              Un termen din lege se închide peste {zile(primul.zile!)}
            </span>
          )}
        </p>
        <h1 className="m-0 max-w-[18ch] font-head text-[clamp(34px,7.4vw,60px)] leading-[1.04] font-extrabold tracking-[-.025em] text-v3-ink">
          Legea ți-a dat 6 zile să păstrezi <span className="text-v3-pos">48.000 de lei</span>. Ai aflat?
        </h1>
        <p className="m-0 mt-5 max-w-[56ch] text-[19px] leading-[1.55] text-[#1F2937]">
          Pe 25 iulie 2025, o lege a scumpit locuințele noi cu 12%. Cine plătea un avans în următoarele 6 zile scăpa. Cine a aflat după a
          plătit diferența. <b>Noi îți spunem în ziua în care apare legea: cât te costă, ce poți face și până când.</b>
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Cta href="/profil">Vezi ce te privește</Cta>
          <Cta href="/legi" secundar>
            Toate legile, după cât poți salva
          </Cta>
        </div>
        <p className="m-0 mt-4 text-[13.5px] text-v3-ink-2">Fără cont. Profilul rămâne pe telefonul tău. Fiecare sumă are legea și articolul lângă ea.</p>
      </section>

      {/* STORY: trei cazuri reale */}
      <section className="mt-14">
        <Titlu eticheta="Trei cazuri reale din ultimul an">Banii erau acolo. Termenul a trecut.</Titlu>
        <p className="m-0 max-w-[62ch] text-[17px] leading-[1.6] text-v3-ink-2">
          Nu e nevoie să cunoști legea. Trebuie doar să afli la timp. Iată ce s-a întâmplat și ce ți-am fi spus în ziua în care a apărut actul în
          Monitorul Oficial.
        </p>
        <div className="mt-4">
          {CAZURI.map((c, i) => (
            <CazReal key={c.id} c={c} nr={i + 1} />
          ))}
        </div>
      </section>

      {/* URGENȚA REALĂ: termenele deschise acum */}
      <section className="mt-6 rounded-3xl bg-v3-ink px-5 py-9 text-white sm:px-10">
        <p className="m-0 mb-2 text-xs font-extrabold tracking-[.12em] text-[#D1D5DB] uppercase">Azi, {dataScurta(azi)}</p>
        <h2 className="m-0 font-head text-[clamp(26px,5.6vw,38px)] leading-[1.12] font-extrabold tracking-[-.015em]">
          Termenele care se închid acum
        </h2>
        <p className="m-0 mt-3 max-w-[60ch] text-[16px] text-[#D1D5DB]">
          Nu sunt numărători inventate: fiecare dată e scrisă în lege și zilele se calculează față de azi.
        </p>
        <ul className="m-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-2">
          {deschise.map((a) => {
            const urgent = a.zile! < ZILE_URGENT;
            return (
              <li key={a.id} className="rounded-2xl bg-white/[.06] p-4 ring-1 ring-white/15">
                <p className="m-0 flex flex-wrap items-center gap-2 text-[12.5px] font-bold">
                  <span className={`rounded-full px-2.5 py-0.5 ${urgent ? "bg-v3-urg" : "bg-white/15"}`}>mai ai {zile(a.zile!)}</span>
                  <span className="text-[#D1D5DB]">până pe {dataScurta(a.termen!)}</span>
                </p>
                <p className="m-0 mt-2 text-[15px] leading-[1.4] font-semibold">
                  <span className="text-[#D1D5DB]">{a.pentru}:</span> {a.ce}
                </p>
                {a.salvezi && (
                  <p className="m-0 mt-1.5 text-[14px] font-bold text-[#86EFAC]">
                    păstrezi până la {mii(a.salvezi.lei)} lei {a.salvezi.cand === "o_data" ? "o dată" : "pe an"}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/profil" className="inline-flex min-h-[52px] items-center rounded-[12px] bg-white px-6 text-[16px] font-bold text-v3-ink no-underline">
            Află care dintre ele te privesc
          </Link>
        </div>
      </section>

      {/* OFFER: ce primești */}
      <section className="mt-14">
        <Titlu eticheta="Ce primești">Un singur loc care îți spune ce faci cu banii, înainte să fie târziu</Titlu>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
          {[
            ["Profilul din documente", "Încarci un fluturaș, un contract sau o factură. Etichetele și cifrele se completează singure; tu scoți ce nu e cazul."],
            ["Fluxul tău, în lei pe lună", "Fiecare lege care te atinge, cu suma pentru tine: cât pierzi, cât câștigi."],
            ["Ce poți face și până când", "Pașii permiși de lege și termenul, cu numărătoarea calculată din data din act."],
            ["Planul meu", "Bifezi ce faci și vezi cât păstrezi pe an. Bara de jos se schimbă pe loc."],
            ["Sursa lângă fiecare sumă", "Actul, Monitorul Oficial, articolul și linkul la Portalul Legislativ. Ce nu am verificat scrie „de confirmat”."],
            ["Toate legile, ordonate după bani", "Pagina generală: fiecare schimbare, de la cea care poate salva cei mai mulți bani în jos."],
          ].map(([t, d]) => (
            <li key={t} className="rounded-2xl border border-v3-line bg-white p-5">
              <p className="m-0 flex items-center gap-2 text-[17px] font-bold text-v3-ink">
                <span aria-hidden="true" className="inline-flex size-6 items-center justify-center rounded-full bg-v3-pos-soft text-[13px] text-v3-pos">
                  ✓
                </span>
                {t}
              </p>
              <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-v3-ink-2">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* OBIECȚII */}
      <section className="mt-14">
        <Titlu eticheta="Întrebări">Înainte să începi</Titlu>
        <dl className="m-0 grid gap-x-8 gap-y-6 sm:grid-cols-3">
          {[
            ["E sfat financiar?", "Nu. Îți arătăm ce schimbă legea și ce acțiuni permite ea. Nu recomandăm produse: trimitem la instrumente oficiale, iar furnizorii apar în ordine alfabetică."],
            ["Ce date îmi luați?", "Profilul stă pe telefonul tău. Documentele sunt citite o dată și nu le păstrăm; acoperă CNP-ul și IBAN-ul înainte."],
            ["De unde știu că e adevărat?", "Fiecare act are sursa: Monitorul Oficial, articolul și linkul la text. Sumele calculate de noi sunt marcate așa."],
          ].map(([q, a]) => (
            <div key={q}>
              <dt className="text-[17px] font-bold text-v3-ink">{q}</dt>
              <dd className="m-0 mt-1.5 text-[15px] leading-[1.55] text-v3-ink-2">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA FINAL */}
      <section className="mt-14 rounded-3xl border border-v3-tintb bg-linear-135 from-v3-tint1 via-v3-tint2 via-45% to-white px-5 py-10 text-center sm:px-10">
        <h2 className="m-0 mx-auto max-w-[22ch] font-head text-[clamp(28px,6vw,42px)] leading-[1.1] font-extrabold tracking-[-.02em] text-v3-ink">
          Următoarea lege cu termen nu te va anunța singură.
        </h2>
        {primul && (
          <p className="m-0 mt-3 text-[17px] text-[#1F2937]">
            Cel mai apropiat termen se închide pe <b>{dataScurta(primul.termen!)}</b>: mai ai <b className="text-v3-urg">{zile(primul.zile!)}</b>.
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Cta href="/profil">Completează profilul</Cta>
          <Cta href="/flux?p=andrei" secundar>
            Vezi un exemplu: Andrei, 32
          </Cta>
        </div>
        <p className="m-0 mt-4 text-[13.5px] text-v3-ink-2">
          Alte exemple fictive: <Link href="/flux?p=maria">Maria, 45</Link> · <Link href="/flux?p=ion">Ion, 67</Link> ·{" "}
          <Link href="/flux?p=ioana">Ioana, 23</Link>
        </p>
      </section>
    </div>
  );
}
