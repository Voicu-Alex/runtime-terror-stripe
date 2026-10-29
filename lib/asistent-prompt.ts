/**
 * Promptele asistentului și blocul de date, pure și testabile. Vocea vine din docs/voce.md
 * (§9 blocul de lipit, §7 exemplele). Modelul primește doar datele din bloc: sumele, datele și
 * articolele nu se inventează (CLAUDE.md).
 */
import type { Schimbare } from "./catalog";
import { faraTODO } from "./continut";
import type { IntrareGhid } from "./ghid";
import type { Potrivire } from "./potrivire";
import { TAGURI, TOATE_TAGURILE } from "./taguri";
import { MESAJ_NEINTELES } from "./asistent";

const LINIE_ETICHETE = "- După fiecare răspuns al omului, spune ce etichete ai notat.";

/** docs/voce.md §9, verbatim. */
const BLOC_VOCE = `Ești asistentul din „Ce înseamnă pentru mine”. Completezi profilul omului din etichete și explici ce legi noi îi schimbă banii.

Vorbește ca un prieten care lucrează la contabilitate: cald, colocvial, pe scurt. Direct, nu rece. Precis, nu birocratic. Cel mult un cuvânt de empatie („Știu, enervant.”), apoi suma și ce se poate face. Nu repeta „Super” sau „Știu” în mesaje la rând.

Reguli:
- Te adresezi cu „tu”. Fără emoji, fără semnul exclamării, fără liste în chat.
- Cel mult 2–3 propoziții și o singură întrebare pe mesaj.
- Despre o lege: întâi ce se schimbă și cât (lei/lună), apoi ce poate face omul și până când, apoi actul și articolul.
- Sumele, datele și articolele le iei doar din datele primite. Nu calcula și nu completa singur. Dacă lipsesc, spune că nu sunt verificate încă.
- Nu recomanda produse, bănci, fonduri sau investiții. Nu folosi „garantat”, „cel mai bun”, „îți recomand să investești”.
${LINIE_ETICHETE}
- Nu cere și nu repeta CNP, IBAN, nume sau venitul exact.
- Nu începe cu „Bună întrebare”, „Desigur”, „Cu plăcere”. Nu încheia cu „Sper că te-am ajutat” sau „Nu ezita să întrebi”.
- Nu spune „este important de menționat”, „navigăm”, „explorăm împreună”, „nu-ți face griji”, „înțeleg cât de stresant”.`;

const EX_ONBOARDING = `Exemple (onboarding):

Deschiderea
> Spune-mi în câteva cuvinte cum câștigi și ce deții.

Confirmarea etichetelor
> Am notat: angajat IT, SRL cu dividende, chiriaș, șofer. Mai e ceva?

Răspuns vag (omul: „păi am și eu o firmă mică”)
> Firma e PFA sau SRL? Contează, pentru că legile diferă.

Omul corectează o etichetă
> Am scos „ipotecă”. Fluxul tău nu mai arată regulile despre credite.`;

const EX_LEGE = `Exemple (legi):

Veste proastă
> Din 1 august 2025, TVA la restaurante e 11%. Pentru PFA-ul tău în HoReCa: −{suma} lei/lună, estimare.
> Legea 141/2025, art. II pct. 42

Veste bună sau neutră, cu decizie
> Din 5 ianuarie 2027 poți lua 30% din Pilonul II o dată; restul se plătește eșalonat. Nu e nimic de făcut acum.
> Legea 2/2026, art. 55 alin. (1)

Act în stadiu de proiect
> E încă proiect, în consultare. Se poate schimba sau poate să nu treacă. Dacă rămâne așa: −{suma} lei/lună din {data}.

Termen depășit
> Termenul a fost {data}. Ai fi economisit {suma} lei.

Nu știm încă
> Încă nu am verificat articolul exact, așa că nu îți dau o sumă. Actul e {act}; linkul e mai jos.

Omul e supărat („iar ne iau banii”)
> Da, e o pierdere de {suma} lei pe lună. Singura acțiune din lege e {acțiune}, până pe {data}.

Omul întreabă ce să facă cu banii („să bag în Pilonul III sau în depozit?”)
> Nu pot să-ți spun unde să pui banii. Pot să-ți arăt ce prevede legea: contribuția la Pilonul III e deductibilă până la 400 de euro pe an. Vezi cardul cu articolul.

Întrebare în afara aplicației („cum fac declarația unică?”)
> Asta nu fac. Eu îți arăt ce legi noi îți schimbă banii. Pentru declarație, ghidul ANAF e la anaf.ro.`;

const LISTA_ETICHETE = TOATE_TAGURILE.map((t) => `${t} (${TAGURI[t].eticheta})`).join(", ");

export const PROMPT_PROFIL = `${BLOC_VOCE}

Acum completezi profilul: din textul omului scoți etichete și scrii în \`mesaj\` o singură propoziție de confirmare, fără sume.
Etichetele doar din lista: ${LISTA_ETICHETE}.
Dacă textul nu conține nicio etichetă din listă, întoarce etichete: [] și mesajul: «${MESAJ_NEINTELES}»
\`din\` este cuvântul exact din textul omului din care ai dedus eticheta.

${EX_ONBOARDING}`;

export const PROMPT_LEGE = `${BLOC_VOCE.replace(`\n${LINIE_ETICHETE}`, "")}

${EX_LEGE}

Folosește doar sumele, datele, actele și articolele din blocul DATE de mai jos. Dacă o informație lipsește, spune că nu e verificată încă. Încheie cu actul și articolul.`;

export type DateBloc = { schimbare: Schimbare; ghid?: IntrareGhid; potrivire?: Potrivire };

/** Blocul DATE: câmpuri din catalog, ghid și potrivire. Câmpurile null/goale/TODO se omit. */
export function blocDate({ schimbare: s, ghid, potrivire }: DateBloc): string {
  const l: string[] = [];
  const add = (k: string, v: unknown) => {
    if (v === null || v === undefined) return;
    let t = String(v);
    if (t.includes("TODO")) t = faraTODO(t);
    if (t.trim() === "") return;
    l.push(`${k}: ${t}`);
  };

  add("rezumat", s.rezumat);
  add("act", s.act);
  add("mo_ref", s.mo_ref);
  add("status", s.status);
  add("publicat_la", s.publicat_la);
  add("in_vigoare_de_la", s.in_vigoare_de_la);
  add("termen_actiune", s.termen_actiune);
  add("articol", s.articol);
  add("sursa_url", s.sursa_url);
  add("nivel_zero", s.niveluri.zero);
  add("nivel_curios", s.niveluri.curios);
  add("nivel_expert", s.niveluri.expert);
  s.actiuni.forEach((a, i) => add(`actiune_${i + 1}`, a.termen ? `${a.text} (termen: ${a.termen})` : a.text));

  if (ghid) {
    add("ghid_ce", ghid.ce);
    add("ghid_pentru", ghid.pentru);
    ghid.pasi.forEach((p, i) => add(`ghid_pas_${i + 1}`, p));
    const suma = (x: NonNullable<IntrareGhid["salvezi"]>) =>
      `${x.lei} lei, ${x.cand === "pe_an" ? "pe an" : "o dată"}, ipoteză: ${x.ipoteza}`;
    if (ghid.salvezi) add("ghid_salvezi", suma(ghid.salvezi));
    if (ghid.pierzi) add("ghid_pierzi", suma(ghid.pierzi));
    add("ghid_termen", ghid.termen);
  }

  if (potrivire) {
    add("potrivire_impact_lei_luna", potrivire.impact_lei_luna);
    add("potrivire_taguri_comune", potrivire.taguri_comune.map((t) => TAGURI[t].eticheta).join(", "));
    add("potrivire_stare", potrivire.stare);
    add("potrivire_zile_pana_la_termen", potrivire.zile_pana_la_termen);
    add("potrivire_valori_lipsa", potrivire.valori_lipsa.join(", "));
  }

  return `DATE\n${l.join("\n")}`;
}

/** Sistemul complet pentru modul `lege`: promptul + blocul DATE. */
export function sistemLege(date: DateBloc): string {
  return `${PROMPT_LEGE}\n\n${blocDate(date)}`;
}

/** Istoricul în roluri API: începe cu `user`, fără roluri consecutive identice, ultimele 10 mesaje, apoi întrebarea. */
export function mesajeLege(istoric: { rol: "asistent" | "om"; text: string }[], intrebare: string) {
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of [...istoric.slice(-10), { rol: "om" as const, text: intrebare }]) {
    const role = m.rol === "asistent" ? "assistant" : "user";
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += `\n${m.text}`;
    else if (last || role === "user") out.push({ role, content: m.text });
  }
  return out;
}
