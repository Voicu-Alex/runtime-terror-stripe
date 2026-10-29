/**
 * Parser pur pentru pagina unui act din Portal Legislativ:
 * https://legislatie.just.ro/Public/DetaliiDocument/<id> (HTML randat pe server).
 *
 * Fără rețea, fără dependențe: doar regex și șiruri. Scraperul (scripts/legi) aduce HTML-ul,
 * aici îl transformăm în text curat + metadate. Nimic nu se deduce: câmpul pe care pagina
 * nu îl oferă rămâne `null` (de pildă `data_vigoare`, pagina nu are un câmp pentru ea).
 *
 * Structura paginii (verificată pe fixturile din lib/fixtures/portal, 29 oct 2026):
 *  - antet: span.S_DEN („LEGE nr. 204 din 22 octombrie 2026”), span.S_HDR (titlul),
 *    table.S_EMT (emitentul), span.S_PUB („MONITORUL OFICIAL nr. 886 din 22 octombrie 2026”);
 *  - corp: S_CAP / S_SEC / S_ART (S_ART_TTL = „Articolul 76^5”) / S_ALN / S_LIT / S_PCT / S_PAR;
 *  - forma consolidată: adnotări „(la 09-03-2026, … a fost modificat de …)” ca span.S_PAR,
 *    și note editoriale span.S_NTA; ambele se scot din text și se păstrează în `anotari`;
 *  - o pagină inexistentă răspunde 500 cu <title>Error</title>.
 */

export type Articol = { nr: string; inceput: number; sfarsit: number };

export type ActParsat = {
  sursa_id: string;
  tip_act: string;
  numar: string | null;
  an: number | null;
  data_act: string | null;
  titlu: string;
  emitent: string | null;
  mo_ref: string | null;
  publicat_la: string | null;
  data_vigoare: string | null;
  consolidat: boolean;
  text: string;
  anotari: string[];
  lungime: number;
  articole: Articol[];
  url: string;
};

export const URL_ACT = (id: string | number) =>
  `https://legislatie.just.ro/Public/DetaliiDocument/${id}`;

const LUNI: Record<string, number> = {
  ianuarie: 1, februarie: 2, martie: 3, aprilie: 4, mai: 5, iunie: 6,
  iulie: 7, august: 8, septembrie: 9, octombrie: 10, noiembrie: 11, decembrie: 12,
};
const LUNI_SCURT = ["ian", "feb", "mar", "apr", "mai", "iun", "iul", "aug", "sep", "oct", "nov", "dec"];

const ENTITATI: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "–", mdash: "—", laquo: "«", raquo: "»", hellip: "…",
};

function decodeazaEntitati(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const cod = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(cod) && cod > 0 && cod <= 0x10ffff ? String.fromCodePoint(cod) : m;
    }
    return ENTITATI[e.toLowerCase()] ?? m;
  });
}

/** Cedilă (ş ţ) devine virgulă (ș ț), cum se scrie corect în română. */
function normalizeazaDiacritice(s: string): string {
  return s.replace(/ş/g, "ș").replace(/Ş/g, "Ș").replace(/ţ/g, "ț").replace(/Ţ/g, "Ț");
}

function curataText(s: string): string {
  return normalizeazaDiacritice(decodeazaEntitati(s)).replace(/\s+/g, " ").trim();
}

function faraTaguri(html: string): string {
  return curataText(html.replace(/<!--[\s\S]*?-->/g, "").replace(/<\/?(?:a|b|i|u|em|strong|span|sup|sub)(?=[\s>/])[^>]*>/gi, "").replace(/<[^>]*>/g, " "));
}

function iso(zi: string | number, luna: string, an: string | number): string | null {
  const l = LUNI[luna.toLowerCase()];
  if (!l) return null;
  const z = Number(zi);
  if (!(z >= 1 && z <= 31)) return null;
  return `${an}-${String(l).padStart(2, "0")}-${String(z).padStart(2, "0")}`;
}

/** „MO 886 / 22 oct 2026”, formatul din data/catalog.json (zi fără zero în față). */
function formatMo(nr: string, dataIso: string): string {
  const [a, l, z] = dataIso.split("-");
  return `MO ${nr} / ${Number(z)} ${LUNI_SCURT[Number(l) - 1]} ${a}`;
}

export function esteLipsa(html: string, status?: number): boolean {
  if (status !== undefined && status >= 400) return true;
  if (!html || html.trim().length === 0) return true;
  if (/<title>\s*Error\s*<\/title>/i.test(html)) return true;
  return !/class="S_DEN"/.test(html);
}

function primulSpan(html: string, clasa: string): string | null {
  const m = html.match(new RegExp(`<span[^>]*class="${clasa}"[^>]*>([\\s\\S]*?)</span>`));
  return m ? m[1] : null;
}

type Stare = { clasa: string; sari: boolean; nota: boolean };

// Blocuri care încep pe rând nou (în afara unui articol) sau cu spațiu (în interiorul lui).
const BLOCURI = new Set([
  "S_ART", "S_CAP", "S_SEC", "S_ANX", "S_PAR", "S_ALN", "S_LIT", "S_PCT", "S_SMN", "S_SMN_PAR",
]);
// Conținut care nu face parte din textul actului (antetul e în câmpuri separate).
const ANTET = new Set(["S_DEN", "S_HDR", "S_EMT", "S_PUB"]);
const ANOTARE_LA = /<span[^>]*class="S_PAR"[^>]*>\s*\(la \d{2}-\d{2}-\d{4},[\s\S]*?<\/span>/g;

function construiesteText(corp: string): { text: string; articole: Articol[]; anotari: string[] } {
  const anotari: string[] = [];
  const fara = corp
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<table[^>]*class="S_EMT"[\s\S]*?<\/table>/g, "")
    .replace(ANOTARE_LA, (m) => {
      anotari.push(faraTaguri(m));
      return "";
    });

  let out = "";
  let separator: 0 | 1 | 2 = 0; // 0 nimic, 1 spațiu, 2 rând nou
  let adancimeArt = 0;
  let artCurent: { nr: string; inceput: number | null } | null = null;
  let titluArt = false;
  let bufTitlu = "";
  let notaBuf: string[] | null = null;
  const articole: Articol[] = [];
  const stiva: Stare[] = [];
  let sariCount = 0;

  const cere = (s: 1 | 2) => {
    if (s > separator) separator = s;
  };
  const scrie = (t: string) => {
    const t2 = curataText(t);
    if (!t2) {
      if (/\s/.test(t)) cere(1);
      return;
    }
    if (/^\s/.test(t)) cere(1);
    if (out.length > 0) {
      if (separator === 2) out += "\n";
      else if (separator === 1 && !out.endsWith("\n")) out += " ";
    }
    separator = 0;
    if (artCurent && artCurent.inceput === null) artCurent.inceput = out.length;
    out += t2;
    if (/\s$/.test(t)) cere(1);
  };

  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)([^>]*)>|([^<]+)|</g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(fara)) !== null) {
    if (m[4] !== undefined) {
      if (sariCount > 0) {
        if (notaBuf) notaBuf.push(m[4]);
        continue;
      }
      if (titluArt) bufTitlu += m[4];
      scrie(m[4]);
      continue;
    }
    const tag = m[2]?.toLowerCase();
    if (!tag) continue;
    const inchide = m[1] === "/";
    if (tag === "span") {
      if (!inchide) {
        const clasa = (m[3].match(/class="([^"]*)"/)?.[1] ?? "").split(/\s+/)[0];
        const sari =
          ANTET.has(clasa) || clasa === "TAG_COLLAPSED" || clasa.endsWith("_SHORT") || clasa === "S_NTA";
        const nota = clasa === "S_NTA";
        stiva.push({ clasa, sari, nota });
        if (sari) {
          sariCount++;
          if (nota) notaBuf = [];
        }
        if (sariCount > 0) {
          if (notaBuf && (BLOCURI.has(clasa) || clasa.endsWith("_TTL"))) notaBuf.push(" ");
          continue;
        }
        if (clasa === "S_ART" && adancimeArt === 0) {
          adancimeArt = 1;
          artCurent = { nr: "", inceput: null };
          cere(2);
        } else if (clasa === "S_ART") {
          adancimeArt++;
          cere(1);
        } else if (clasa === "S_ART_TTL" && adancimeArt === 1) {
          titluArt = true;
          bufTitlu = "";
        } else if (clasa.endsWith("_DEN")) {
          cere(1);
        } else if (BLOCURI.has(clasa) || clasa.endsWith("_TTL")) {
          cere(adancimeArt > 0 ? 1 : 2);
        }
      } else {
        const st = stiva.pop();
        if (!st) continue;
        if (st.sari) {
          sariCount--;
          if (st.nota && notaBuf && sariCount === 0) {
            const t = curataText(notaBuf.join(""));
            if (t) anotari.push(t);
            notaBuf = null;
          }
          continue;
        }
        if (sariCount > 0) continue; // span închis în interiorul unei note sărite
        if (st.clasa === "S_ART_TTL" && titluArt) {
          titluArt = false;
          const t = curataText(bufTitlu);
          const nm = t.match(/^art(?:icolul|\.)?\s*(.+)$/i);
          if (artCurent) artCurent.nr = `art. ${(nm ? nm[1] : t).replace(/\s+/g, "")}`;
          cere(1);
        } else if (st.clasa === "S_ART") {
          adancimeArt--;
          if (adancimeArt === 0 && artCurent) {
            if (artCurent.inceput !== null && artCurent.nr) {
              articole.push({ nr: artCurent.nr, inceput: artCurent.inceput, sfarsit: out.length });
            }
            artCurent = null;
            cere(2);
          }
        } else if (BLOCURI.has(st.clasa)) {
          cere(adancimeArt > 0 ? 1 : 2);
        }
      }
    } else if (!inchide && sariCount === 0 && /^(br|p|div|tr|li)$/.test(tag)) {
      cere(adancimeArt > 0 ? 1 : 2);
    }
  }
  return { text: out.trim(), articole, anotari };
}

export function parseazaPaginaAct(html: string, sursaId: string): ActParsat | null {
  if (esteLipsa(html)) return null;

  const den = primulSpan(html, "S_DEN");
  if (den === null) return null;
  const denumire = faraTaguri(den);
  const hdr = primulSpan(html, "S_HDR");
  const subiect = hdr ? faraTaguri(hdr) : "";
  const titlu = `${denumire} ${subiect}`.replace(/\s+/g, " ").trim();

  let tip_act = denumire.split(/\s+nr\.?\s/i)[0].trim();
  let numar: string | null = null;
  let an: number | null = null;
  let data_act: string | null = null;
  const d = denumire.match(/^(.*?)\s+nr\.?\s*(\S+)\s+din\s+(\d{1,2})\s+([A-Za-zăâîșțĂÂÎȘȚ]+)\s+(\d{4})/i);
  if (d) {
    tip_act = d[1].trim();
    numar = d[2];
    data_act = iso(d[3], d[4], d[5]);
    an = data_act ? Number(d[5]) : null;
  }

  const emt = primulSpan(html, "S_EMT_BDY");
  const emitent = emt ? faraTaguri(emt.replace(/<\/li>/gi, "; ")).replace(/;\s*$/, "") || null : null;

  let mo_ref: string | null = null;
  let publicat_la: string | null = null;
  const pub = primulSpan(html, "S_PUB_BDY");
  if (pub) {
    const p = faraTaguri(pub).match(/nr\.?\s*(\S+)\s+din\s+(\d{1,2})\s+([A-Za-zăâîșțĂÂÎȘȚ]+)\s+(\d{4})/i);
    if (p) {
      publicat_la = iso(p[2], p[3], p[4]);
      if (publicat_la) mo_ref = formatMo(p[1], publicat_la);
    }
  }

  // Conținutul actului stă între div#div_Formaconsolidata și div#div_Formerepublicate.
  const start = html.match(/<div[^>]*id="div_Formaconsolidata"[^>]*>/);
  const inceputCorp = start ? (start.index ?? 0) + start[0].length : html.indexOf('class="S_DEN"');
  const sfarsitCorp = html.indexOf('<div id="div_Formerepublicate"', inceputCorp);
  const corp = html.slice(inceputCorp, sfarsitCorp === -1 ? undefined : sfarsitCorp);

  const { text, articole, anotari } = construiesteText(corp);
  const consolidat = /<input[^>]*id="Formaconsolidata"/.test(html) || anotari.length > 0;

  return {
    sursa_id: sursaId,
    tip_act,
    numar,
    an,
    data_act,
    titlu,
    emitent,
    mo_ref,
    publicat_la,
    // Pagina nu are un câmp „data intrării în vigoare”; nu o deducem din text.
    data_vigoare: null,
    consolidat,
    text,
    anotari,
    lungime: text.length,
    articole,
    url: URL_ACT(sursaId),
  };
}

function cheieArticol(nr: string): string {
  return nr
    .toLowerCase()
    .replace(/^\s*(articolul|art)\.?\s*/, "")
    .replace(/\s+/g, "");
}

export function articolDupaNumar(act: ActParsat, nr: string): string | null {
  const cautat = cheieArticol(nr);
  if (!cautat) return null;
  const a = act.articole.find((x) => cheieArticol(x.nr) === cautat);
  return a ? act.text.slice(a.inceput, a.sfarsit) : null;
}
