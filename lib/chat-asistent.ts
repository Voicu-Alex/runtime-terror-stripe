import termeniJson from "@/data/termeni-asistent.json";
import { CATALOG, type Schimbare } from "./catalog";
import { CAMPURI_VALORI, type Profil } from "./profil";
import { esteTag, etichetaTag, type TagId } from "./taguri";

export type SursaChat = { id: string; titlu: string; url: string; articol?: string; verificatLa?: string };
export type CerereChat = {
  mod: "chat"; mesaj: string; istoric: { rol: "om" | "asistent"; text: string }[];
  profil: Profil; contextId?: string; limba?: "ro" | "en";
};
export type RaspunsChat = {
  text: string; intentie: "profil" | "lege" | "termen" | "clarificare";
  surse: SursaChat[]; propuneri: { adauga: TagId[]; scoate: TagId[] };
  contextId?: string; sugestii: string[]; mod: "demo" | "model";
};

type Termen = { id: string; termen: string; aliasuri: string[]; definitie: string; pe_scurt: string; sursa: { titlu: string; articol: string; url: string; verificatLa: string } };
const TERMENI: Termen[] = termeniJson;
const MAX_MESAJ = 2000;
const MAX_ISTORIC = 12;
const MAX_CORP = 30000;

export function esteCerereChat(x: unknown): x is CerereChat {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  if (o.mod !== "chat" || typeof o.mesaj !== "string" || !o.mesaj.trim() || o.mesaj.length > MAX_MESAJ) return false;
  if (o.limba !== undefined && o.limba !== "ro" && o.limba !== "en") return false;
  if (o.contextId !== undefined && (typeof o.contextId !== "string" || !esteContext(o.contextId))) return false;
  if (!Array.isArray(o.istoric) || o.istoric.length > MAX_ISTORIC || !o.istoric.every((m) => m && typeof m === "object" && (m.rol === "om" || m.rol === "asistent") && typeof m.text === "string" && m.text.length <= MAX_MESAJ)) return false;
  const p = o.profil as Record<string, unknown> | null;
  if (!p || typeof p !== "object" || !Array.isArray(p.taguri) || p.taguri.length > 40 || !p.taguri.every(esteTag) || !p.valori || typeof p.valori !== "object" || Array.isArray(p.valori)) return false;
  const v = p.valori as Record<string, unknown>;
  if (Object.keys(v).some((k) => !(k in CAMPURI_VALORI) || typeof v[k] !== "number" || !Number.isFinite(v[k]))) return false;
  return JSON.stringify(o).length <= MAX_CORP;
}

function simplu(s: string): string {
  return s.toLocaleLowerCase("ro").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function contine(s: string, fragment: string): boolean {
  return (` ${s} `).includes(` ${simplu(fragment)} `);
}
/** Înlocuiri de vocabular, fără schimbarea procentelor, condițiilor sau termenelor. */
function faraJargon(text: string): string {
  return text.replace(/eșalonat(?=[\s,.;:]|$)/gi, "în mai multe plăți")
    .replace(/rentă viageră/gi, "o pensie plătită toată viața")
    .replace(/CASS/g, "contribuția pentru sănătate (CASS)");
}
function esteContext(id: string): boolean { return CATALOG.some((s) => s.id === id) || TERMENI.some((t) => t.id === id); }
function sursaTermen(t: Termen): SursaChat { return { id: t.id, titlu: t.sursa.titlu, articol: t.sursa.articol, url: t.sursa.url, verificatLa: t.sursa.verificatLa }; }
function sursaLege(s: Schimbare): SursaChat[] {
  if (!s.sursa_url || s.sursa_url === "TODO" || !/^https:\/\/(legislatie\.just\.ro|static\.anaf\.ro|ms\.ro)\//i.test(s.sursa_url)) return [];
  if (!s.verificat_la || !s.articol || /TODO|necitit|de confirmat|not confirmed|din pres[ăa]|nu e scris[ăa]/i.test(s.articol)) return [];
  return [{ id: s.id, titlu: `${s.act} — ${s.mo_ref}`, articol: s.articol, url: s.sursa_url, verificatLa: s.verificat_la }];
}
const VID = { adauga: [] as TagId[], scoate: [] as TagId[] };
const sugestiiBaza = ["Ce este TVA?", "Explică legea despre dividende", "Vreau să îmi descriu situația"];
function raspuns(text: string, intentie: RaspunsChat["intentie"], opt: Partial<RaspunsChat> = {}): RaspunsChat {
  return { text, intentie, surse: [], propuneri: { ...VID }, sugestii: sugestiiBaza, mod: "demo", ...opt };
}

const SUBIECTE: { re: RegExp; ids: string[] }[] = [
  { re: /\bdividend/, ids: ["dividende_16"] },
  { re: /\btva\b/, ids: ["tva_21", "horeca_tva_11", "tva_locuinta"] },
  { re: /\bpilon(ul)? (ii|2)\b/, ids: ["pilon2_plata"] },
  { re: /\bpilon(ul)? (iii|3)\b/, ids: ["pilon3_deducere"] },
  { re: /\bcass\b/, ids: ["cass_pensii", "cass_intretinere", "cass_somaj", "cass_crestere_copil", "pfa_cass_plafon_72"] },
  { re: /\bsalariul? minim\b/, ids: ["salariu_minim_netaxabil_2026", "salariu_minim_2026"] },
  { re: /\bpensi/, ids: ["cass_pensii", "pensie_vpr_2026", "varsta_pensionare", "pilon2_plata"] },
  { re: /\bcopii|copil/, ids: ["alocatie_copii", "cass_crestere_copil", "masa_sanatoasa_2026"] },
  { re: /\bit\b/, ids: ["it_scutire"] },
  { re: /\bgaz/, ids: ["gaz_plafon", "ajutor_incalzire"] },
  { re: /\bchirie|inchiri/, ids: ["inchiriere_termen_scurt_2026"] },
  { re: /\bmicro/, ids: ["micro_1"] },
  { re: /\bimpozit auto|masin/, ids: ["impozit_auto_2026"] },
];

function termenDin(s: string): Termen | undefined {
  const normalizat = s.replace(/\bpilon(?:ul)? 2\b/g, "pilonul ii").replace(/\bpilon(?:ul)? 3\b/g, "pilonul iii");
  return TERMENI.find((t) => [t.termen, ...t.aliasuri].some((a) => contine(normalizat, a)));
}
function legeDin(s: string): Schimbare[] {
  const dupaRezumat = CATALOG.filter((a) => contine(s, a.rezumat));
  if (dupaRezumat.length) return dupaRezumat;
  const exact = CATALOG.filter((a) => contine(s, a.id) || contine(s, a.act));
  if (exact.length) return exact;
  const ids = new Set(SUBIECTE.filter((x) => x.re.test(s)).flatMap((x) => x.ids));
  let gasite = CATALOG.filter((a) => ids.has(a.id));
  const modificatori = [
    { re: /\blocuint/, reId: /locuinta/ }, { re: /\bhoreca|restaurant/, reId: /horeca/ },
    { re: /\bpensi/, reId: /pensii|pensie/ }, { re: /\bsomaj|somer/, reId: /somaj/ },
    { re: /\bcrestere copil/, reId: /crestere_copil/ }, { re: /\bstandard|cota/, reId: /^tva_21$/ },
  ];
  for (const m of modificatori) if (m.re.test(s)) { const filtrate = gasite.filter((a) => m.reId.test(a.id)); if (filtrate.length) gasite = filtrate; }
  return gasite;
}

const ETICHETE: { tag: TagId; re: RegExp }[] = [
  { tag: "angajat", re: /\bangajat|salariat|salariu\b/ }, { tag: "it", re: /\bit\b|programator|software/ },
  { tag: "pfa", re: /\bpfa\b/ }, { tag: "srl_dividende", re: /\bdividende\b|\bsrl\b/ },
  { tag: "pensionar", re: /\bpensionar|sunt la pensie/ }, { tag: "parinte", re: /\bcopii|copil\b/ },
  { tag: "pilon2", re: /\bpilon(ul)? (ii|2)\b/ }, { tag: "pilon3", re: /\bpilon(ul)? (iii|3)\b/ },
  { tag: "chirias", re: /\bchirias|stau in chirie/ }, { tag: "proprietar", re: /\bproprietar|am (o )?(casa|locuinta|apartament)/ },
  { tag: "masina", re: /\bmasina\b|\bautoturism/ }, { tag: "micro", re: /\bmicrointreprindere/ },
  { tag: "constructii", re: /\bconstructii/ }, { tag: "horeca", re: /\bhoreca|restaurant/ },
];
// Relația trebuie să fie despre vorbitor, nu doar un cuvânt într-o relatare.
const DECLARATII: Partial<Record<TagId, RegExp>> = {
  angajat: /^(?:sunt (?:un |o )?(?:angajat|salariat)|lucrez ca (?:angajat|salariat)|(?:am|primesc|castig) (?:un )?salariu)\b/,
  it: /^(?:sunt (?:un |o )?(?:programator|programatoare)|(?:lucrez|sunt angajat|sunt salariat) (?:in |in domeniul )?(?:it|software))\b/,
  pfa: /^(?:sunt|am|lucrez ca|detin) (?:un |o )?pfa\b/,
  srl_dividende: /^(?:am|detin|primesc|incasez) (?:un |o )?(?:srl|dividende)\b/,
  pensionar: /^sunt (?:un |o )?(?:pensionar|pensionara|la pensie)\b/,
  parinte: /^(?:sunt (?:parinte|mama|tata)|am (?:un |o |doi |doua |trei |\d+ )?(?:copil|copii))\b/,
  pilon2: /^(?:am|contribui la|cotizez la) (?:pensie la )?pilon(?:ul)? (?:ii|2)\b/,
  pilon3: /^(?:am|contribui la|cotizez la) (?:pensie la )?pilon(?:ul)? (?:iii|3)\b/,
  chirias: /^(?:sunt (?:un |o )?chirias|(?:stau|locuiesc) in chirie)\b/,
  proprietar: /^(?:sunt (?:un |o )?proprietar|(?:am|detin) (?:o |un )?(?:casa|locuinta|apartament))\b/,
  masina: /^(?:am|detin) (?:o |un )?(?:masina|autoturism)\b/,
  micro: /^(?:am|detin) (?:o )?microintreprindere\b/,
  constructii: /^(?:lucrez|sunt angajat) in constructii\b/,
  horeca: /^(?:lucrez|sunt angajat) (?:in |la un )?(?:horeca|restaurant)\b/,
};
function profilDin(mesaj: string, profil: Profil): RaspunsChat | undefined {
  const s = simplu(mesaj);
  if (mesaj.includes("?") || /\bam o intrebare\b/.test(s)) return undefined;
  const scoate: TagId[] = [], adauga: TagId[] = [];
  let declarat = false;
  for (const segment of s.split(/\b(?:si|dar|iar)\b|[,;]/).map((x) => x.trim())) {
    const persoana = /^(?:eu )?(?:sunt|am|lucrez|detin|stau|locuiesc|primesc|castig|contribui|cotizez|incasez|mi am|nu am|nu sunt|nu lucrez|nu detin|nu mai|scoate|sterge|elimina)\b/.test(segment);
    if (!persoana) continue;
    const sterge = /^(?:eu )?(?:nu |scoate|sterge|elimina)/.test(segment);
    const comanda = /^(?:eu )?(?:scoate|sterge|elimina)\b/.test(segment);
    const afirmatie = segment.replace(/^eu /, "").replace(/^nu (?:mai )?/, "");
    for (const { tag, re } of ETICHETE) {
      const gasit = re.exec(segment); if (!gasit) continue;
      if (!comanda && !DECLARATII[tag]?.test(afirmatie)) continue;
      declarat = true;
      const negat = sterge || /\b(fara|niciun|nicio)\s*$/.test(segment.slice(0, gasit.index));
      if (negat) { if (profil.taguri.includes(tag) && !scoate.includes(tag)) scoate.push(tag); }
      else if (!profil.taguri.includes(tag) && !adauga.includes(tag)) adauga.push(tag);
    }
  }
  if (!declarat) return undefined;
  const ordine = (tag: TagId) => ETICHETE.find((e) => e.tag === tag)?.re.exec(s)?.index ?? s.length;
  adauga.sort((a, b) => ordine(a) - ordine(b));
  scoate.sort((a, b) => ordine(a) - ordine(b));
  if (!adauga.length && !scoate.length) return raspuns("Am înțeles. Nu este nevoie de o schimbare a etichetelor din profil.", "profil");
  const fragmente = [...adauga.map((t) => `adaug „${etichetaTag(t)}”`), ...scoate.map((t) => `scot „${etichetaTag(t)}”`)];
  return raspuns(`Am înțeles: propun să ${fragmente.join(" și să ")}. Confirmă schimbarea înainte să fie aplicată.`, "profil", { propuneri: { adauga, scoate }, sugestii: ["Ce este CASS?", "Explică legea despre dividende"] });
}

export function raspundeDemoChat(c: CerereChat): RaspunsChat {
  const s = simplu(c.mesaj);
  const maiSimplu = /\b(mai simplu|mai pe scurt|pe intelesul meu|pe intelesul tuturor|nu am inteles|nu inteleg|fara jargon|simplifica)\b/.test(s);
  const p = profilDin(c.mesaj, c.profil);
  if (p) return p;
  if (/^(buna|salut|hei|hello|hi)\b/.test(s)) return raspuns("Bună! Îți pot explica legile din catalog, termenii financiari verificați sau pot propune etichete pentru profilul tău. Cu ce vrei să începem?", "clarificare");
  if (/\b(germania|franta|france|germany|italia|spania|sua|uk|marea britanie|alte tari)\b/.test(s))
    return raspuns("Catalogul acoperă acte din România. Precizează un act românesc sau verifică sursele oficiale pentru țara menționată.", "clarificare");
  const cereAct = /\b(legea|lege|actul|ordonanta)\b/.test(s);
  const cereDefinitie = /\b(ce este|ce inseamna|defineste|explica mi|explica termenul|what is|define)\b/.test(s) && !cereAct;
  const t = termenDin(s);
  if ((cereDefinitie || (maiSimplu && !cereAct)) && t) return raspuns(maiSimplu ? t.pe_scurt : t.definitie, "termen", { surse: [sursaTermen(t)], contextId: t.id, sugestii: ["Explică mai simplu", `Ce lege schimbă ${t.termen}?`] });
  const legi = legeDin(s);
  const cereLege = /\b(lege|act|ordonanta|schimba|modific|impozit|taxa|explica|priveste|trebuie sa fac)\b/.test(s);
  const urmareContext = maiSimplu || /^(si|dar|atunci|in cazul asta|mai exact|explica mai simplu|ce trebuie|ce fac|cum ma afecteaza|de ce|cand|cat|pana cand|care este termenul)\b/.test(s);
  if (legi.length > 1) return raspuns(`Am găsit mai multe acte pe această temă. Precizează schimbarea: ${legi.slice(0, 4).map((a) => a.rezumat).join("; ")}.`, "clarificare", { sugestii: legi.slice(0, 3).map((a) => `Explică ${a.rezumat}`) });
  let lege = legi.length === 1 ? legi[0] : undefined;
  const termenContext = TERMENI.find((x) => x.id === c.contextId);
  if (!lege && !t && termenContext && urmareContext && !/\b(lege|act|ordonanta)\b/.test(s)) {
    if (/\b(afecteaza|priveste|trebuie sa fac|cat platesc)\b/.test(s))
      return raspuns(`Ca să îți spun ce înseamnă ${termenContext.termen} pentru tine, am nevoie de puțin context. Despre ce venit sau lege întrebi?`, "clarificare", { contextId: termenContext.id, surse: [sursaTermen(termenContext)] });
    return raspuns(maiSimplu ? termenContext.pe_scurt : termenContext.definitie, "termen", { contextId: termenContext.id, surse: [sursaTermen(termenContext)], sugestii: [`Ce lege schimbă ${termenContext.termen}?`, "Explică alt termen"] });
  }
  if (!lege && !t && c.contextId && urmareContext && !/\b(lege|act|ordonanta|ce este|ce inseamna)\b/.test(s)) lege = CATALOG.find((a) => a.id === c.contextId);
  if (lege && (cereLege || !t || !!c.contextId)) {
    const surse = sursaLege(lege);
    if (!surse.length) return raspuns(`Am găsit ${lege.act}, dar nu am verificat articolul și sursa pentru o explicație sigură. Spune-mi o altă schimbare sau consultă catalogul.`, "clarificare");
    const actiune = /\b(ce trebuie|ce fac|pasi|termen|pana cand|how)\b/.test(s);
    const azi = new Date().toISOString().slice(0, 10);
    const stare = lege.status === "proiect" ? "Proiect: regula nu este în vigoare." : lege.in_vigoare_de_la > azi
      ? `Adoptat; nu se aplică încă. Intră în vigoare la ${lege.in_vigoare_de_la}.`
      : lege.expira_la && lege.expira_la < azi ? `Aplicarea s-a încheiat la ${lege.expira_la}.`
      : `În vigoare din ${lege.in_vigoare_de_la}.`;
    // Articolul și numărul actului rămân în citarea de sub mesaj.
    const explicatie = faraJargon(lege.rezumat);
    let text = `${stare}\n\n${maiSimplu ? "Pe scurt: " : ""}${explicatie}.`;
    const termenLege = termenDin(simplu(lege.rezumat));
    if (termenLege && !maiSimplu) text += `\n\n${termenLege.pe_scurt.replace(/^Pe scurt: /, "")}`;
    if (actiune) {
      const disponibile = lege.actiuni.filter((a) => a.text && (!a.termen || a.termen >= azi));
      text = `${stare}\n\n` + (disponibile.length && lege.status !== "proiect" && (!lege.expira_la || lege.expira_la >= azi)
        ? `Ce poți face: ${disponibile.map((a) => `${faraJargon(a.text)}${a.termen ? ` (termen: ${a.termen})` : ""}`).join("; ")}. Verifică în sursa de mai jos dacă regula se aplică și în cazul tău.`
        : "Nu am un pas verificat pe care îl poți face acum. Poți verifica detaliile în sursa de mai jos.");
    }
    return raspuns(text, "lege", { surse: termenLege && !actiune && !maiSimplu ? [...surse, sursaTermen(termenLege)] : surse, contextId: lege.id, sugestii: ["Explică mai simplu", "Și ce trebuie să fac?"] });
  }
  if (t && c.contextId === t.id) return raspuns(t.definitie, "termen", { surse: [sursaTermen(t)], contextId: t.id });
  return raspuns("Spune-mi ce act sau termen vrei să explic. Dacă îmi descrii situația personală, pot propune etichete pentru profil, pe care le confirmi tu.", "clarificare");
}
