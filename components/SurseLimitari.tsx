"use client";

import Link from "next/link";
import { useLimba } from "@/components/Limba";
import { dataScurta } from "@/lib/card";
import type { Limba } from "@/lib/i18n";

// Pagina „Surse și limitări”, cerută explicit de brief-ul juriului (docs/rethinking_financial_futures_hackathon_stripe.pdf, p. 4):
// ipotezele, sursele de date, considerentele de reglementare și limitările. Textul vine din docs/product.md (4.4),
// docs/adr/0002-abonament-stripe.md și docs/eval-modele.md; cifrele se calculează din catalog, pe server (app/surse/page.tsx).

export type StatisticiCatalog = {
  acte: number;
  inVigoare: number;
  adoptate: number;
  estimari: number;
  incredere: { ridicata: number; medie: number; scazuta: number };
  verificatLa: string | null;
  destinatii: number;
};

type Text = Record<Limba, string>;
type Sectiune = { titlu: Text; puncte: Text[] };

function sectiuni(s: StatisticiCatalog, limba: Limba): Sectiune[] {
  const verificat = s.verificatLa ? dataScurta(s.verificatLa, limba) : "—";
  return [
    {
      titlu: { ro: "Sursele de date", en: "Data sources" },
      puncte: [
        {
          ro: `Catalogul are ${s.acte} de acte normative (${s.inVigoare} în vigoare, ${s.adoptate} adoptate), fiecare verificat în textul oficial: actul, numărul și data Monitorului Oficial, articolul și linkul la Portalul Legislativ (legislatie.just.ro). Ultima verificare: ${verificat}.`,
          en: `The catalogue holds ${s.acte} legal acts (${s.inVigoare} in force, ${s.adoptate} adopted), each checked against the official text: the act, the Official Gazette (Monitorul Oficial) issue and date, the article and a link to the Legislative Portal (legislatie.just.ro). Last checked: ${verificat}.`,
        },
        {
          ro: "Lângă fiecare act stă o sursă explicativă (ANAF, ANRE, ministere, presa de specialitate) și gradul nostru de încredere în sumă.",
          en: "Each act has an explanatory source (ANAF, ANRE, ministries, specialist press) and our confidence level in the amount.",
        },
        {
          ro: `Butoanele „unde rezolvi” duc la ${s.destinatii} pagini oficiale verificate (ANAF, comparatorul ANRE, AJOFM, CNPP și altele) sau la ghișeul unde mergi (primăria, HR-ul), niciodată la adrese scrise de un model.`,
          en: `“Where to act” buttons lead to ${s.destinatii} verified official pages (ANAF, the ANRE comparison tool, AJOFM, CNPP and others) or to the office you go to (town hall, HR), never to addresses written by a model.`,
        },
      ],
    },
    {
      titlu: { ro: "Ipotezele din calcule", en: "Assumptions behind the amounts" },
      puncte: [
        {
          ro: "Suma de pe card e calculul nostru pe profilul tău, nu o cifră scrisă în lege. Formula și ipoteza sunt afișate lângă sumă.",
          en: "The amount on a card is our calculation for your profile, not a figure written in the law. The formula and the assumption are shown next to it.",
        },
        {
          ro: `${s.estimari} acte folosesc valori medii (consum, prețuri) și sunt marcate „estimare”. Încrederea în sume: ${s.incredere.ridicata} ridicată, ${s.incredere.medie} medie, ${s.incredere.scazuta} scăzută.`,
          en: `${s.estimari} acts rely on averages (consumption, prices) and are marked “estimate”. Confidence in the amounts: ${s.incredere.ridicata} high, ${s.incredere.medie} medium, ${s.incredere.scazuta} low.`,
        },
        {
          ro: "Potrivirea dintre lege și om se face pe etichete (cum câștigi, ce ai, unde lucrezi). Unde nu știm o cifră, cardul îți cere una, nu o ghicește.",
          en: "Laws are matched to people through tags (how you earn, what you own, where you work). Where we do not know a figure, the card asks you for it instead of guessing.",
        },
        {
          ro: "Ce n-am putut verifica în textul oficial scrie „de verificat” sau lipsește. Nu completăm cu cifre din presă.",
          en: "Anything we could not verify in the official text says “to be verified” or is left out. We do not fill gaps with press figures.",
        },
      ],
    },
    {
      titlu: { ro: "Unde intervine AI-ul", en: "Where AI is involved" },
      puncte: [
        {
          ro: "Claude citește documentele pe care le încarci (fluturaș, contract, factură) și propune etichete și câteva cifre. Tu le confirmi sau le scoți.",
          en: "Claude reads the documents you upload (payslip, contract, bill) and proposes tags and a few figures. You confirm or remove them.",
        },
        {
          ro: "În produs, un model citește zilnic Monitorul Oficial și propune etichetele, data aplicării, acțiunea și articolul; un om verifică înainte de publicare. Pe 13 documente și 9 legi de test, Haiku și Sonnet au trecut toate verificările automate (docs/eval-modele.md).",
          en: "In the product, a model reads the Official Gazette daily and proposes the tags, the effective date, the action and the article; a person reviews before anything is published. On 13 test documents and 9 test laws, Haiku and Sonnet passed every automatic check (docs/eval-modele.md).",
        },
        {
          ro: "Conținutul generat cu AI e marcat pe fiecare ecran (AI Act, art. 50).",
          en: "AI-generated content is labelled on every screen (EU AI Act, art. 50).",
        },
      ],
    },
    {
      titlu: { ro: "Datele tale", en: "Your data" },
      puncte: [
        {
          ro: "Profilul (etichetele și cifrele) stă pe dispozitivul tău. Nu avem cont de utilizator pentru profil și nu îl trimitem pe server.",
          en: "Your profile (tags and figures) stays on your device. There is no user account for the profile and it is not sent to our server.",
        },
        {
          ro: "Un document se trimite o singură dată la analiză și nu se păstrează. CNP-ul și IBAN-ul sunt mascate din tot ce întoarce analiza.",
          en: "A document is sent once for analysis and never stored. Personal ID numbers (CNP) and IBANs are masked in everything the analysis returns.",
        },
        {
          ro: "Plata Pro se face pe pagina Stripe; noi nu vedem datele cardului. Abonamentul se leagă doar de emailul contului Google.",
          en: "Pro is paid on the Stripe page; we never see card details. The subscription is linked only to your Google account email.",
        },
      ],
    },
    {
      titlu: { ro: "Reglementare", en: "Regulatory considerations" },
      puncte: [
        {
          ro: "Informare, nu consultanță financiară, fiscală sau juridică. Arătăm ce schimbă legea și ce acțiuni permite ea; nu recomandăm produse financiare.",
          en: "Information, not financial, tax or legal advice. We show what the law changes and which actions it allows; we do not recommend financial products.",
        },
        {
          ro: "Consultanța fiscală e o activitate reglementată (OG 71/2001), iar recomandarea personalizată de investiții ține de ASF. Pentru situațiile complexe trimitem la un specialist din registrele oficiale (CECCAR, CCF). Încadrarea exactă trebuie confirmată de un jurist.",
          en: "Tax consulting is a regulated activity in Romania (GO 71/2001) and personalised investment advice falls under the ASF. For complex cases we refer people to a specialist from the official registers (CECCAR, CCF). The exact legal classification still has to be confirmed by a lawyer.",
        },
      ],
    },
    {
      titlu: { ro: "Limitările prototipului", en: "Prototype limitations" },
      puncte: [
        {
          ro: `Catalogul e o selecție verificată de mână (${s.acte} de acte), nu tot Monitorul Oficial. Fluxul automat de citire zilnică e evaluat, dar nu rulează încă în producție.`,
          en: `The catalogue is a hand-verified selection (${s.acte} acts), not the whole Official Gazette. The automatic daily reading pipeline has been evaluated but does not run in production yet.`,
        },
        {
          ro: "Textele juridice detaliate (nivelurile Curios și Expert) sunt în română; interfața, titlurile și acțiunile sunt și în engleză.",
          en: "The detailed legal texts (the Curious and Expert levels) are in Romanian; the interface, titles and actions are also in English.",
        },
        {
          ro: "Cifrele trebuie reverificate periodic: o lege nouă poate modifica una veche, iar forma la zi se reconstruiește din modificări.",
          en: "Figures need regular re-checking: a new law can amend an old one, and the current version is rebuilt from the amendments.",
        },
        {
          ro: "Nu depunem declarații și nu interpretăm legea pentru cazuri individuale.",
          en: "We do not file tax returns and do not interpret the law for individual cases.",
        },
      ],
    },
  ];
}

export function SurseLimitari({ statistici }: { statistici: StatisticiCatalog }) {
  const { limba } = useLimba();
  const en = limba === "en";
  return (
    <div className="mx-auto max-w-[760px]">
      <p className="m-0 mb-2 text-xs font-extrabold tracking-[.12em] text-v3-accent uppercase">{en ? "How we work" : "Cum lucrăm"}</p>
      <h1 className="m-0 font-head text-[clamp(28px,6.6vw,40px)] leading-[1.12] font-extrabold tracking-[-.015em] text-v3-ink">
        {en ? "Sources, assumptions and limitations" : "Surse, ipoteze și limitări"}
      </h1>
      <p className="m-0 mt-3 text-[17px] leading-[1.6] text-v3-ink-2">
        {en
          ? "Every amount in the app comes from a law you can open. Here is where the data comes from, how we calculate, and what the prototype does not do yet."
          : "Fiecare sumă din aplicație vine dintr-o lege pe care o poți deschide. Aici e de unde vin datele, cum calculăm și ce nu face încă prototipul."}
      </p>
      {sectiuni(statistici, limba).map((s) => (
        <section key={s.titlu.ro} className="mt-8 border-t border-v3-line pt-5">
          <h2 className="m-0 text-[19px] font-bold text-v3-ink">{s.titlu[limba]}</h2>
          <ul className="m-0 mt-3 list-none space-y-2.5 p-0">
            {s.puncte.map((p) => (
              <li key={p.ro} className="flex gap-2.5 text-[16px] leading-[1.55] text-v3-ink-soft">
                <span aria-hidden="true" className="mt-[9px] size-1.5 flex-none rounded-full bg-v3-ink-2" />
                <span>{p[limba]}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="m-0 mt-10 text-[15px] text-v3-ink-2">
        <Link href="/legi" className="font-semibold text-v3-ink underline decoration-v3-line underline-offset-2">
          {en ? "See all laws with their sources" : "Vezi toate legile, cu sursele lor"}
        </Link>
      </p>
    </div>
  );
}
