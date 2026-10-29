import { articolDupaNumar, type ActParsat } from "./portal";

/** Peste atâtea caractere nu mai trimitem modelului tot actul, ci doar articolele cerute la triaj. */
export const LIMITA_TEXT_INTEGRAL = 120_000;

/** Câmpurile din rândul `acte` de care are nevoie textul pentru model. */
export type ActPentruModel = {
  id: string;
  titlu: string;
  url: string;
  mo_ref?: string | null;
  publicat_la?: string | null;
  data_vigoare?: string | null;
  text?: string | null;
  lungime?: number | null;
  articole?: ActParsat["articole"] | null;
  triaj?: { articole_cerute?: string[] } | null;
};

export type TextPentruModel = {
  antet: string;
  corp: string;
  /** antet + corp + newline final: exact ce primește modelul și ce se scrie în <id>.txt */
  text: string;
  articoleCerute: string[];
  avertisment?: string;
};

/**
 * Textul unui act așa cum îl vede modelul: antet (titlu, link, Monitorul Oficial, intrarea în vigoare după Portal),
 * apoi tot actul (până la LIMITA_TEXT_INTEGRAL) sau doar articolele cerute la triaj.
 */
export function textPentruModel(a: ActPentruModel): TextPentruModel {
  const cerute: string[] = a.triaj?.articole_cerute ?? [];
  const antet = `${String(a.titlu).replace(/\s+/g, " ").trim()}\n${a.url}\nPublicat în: ${a.mo_ref ?? "necunoscut"}${a.publicat_la ? ` (${a.publicat_la})` : ""}\nData intrării în vigoare (Portal): ${a.data_vigoare ?? "necunoscută"}\n\n`;
  const text = a.text ?? "";
  let corp: string;
  let avertisment: string | undefined;

  if (cerute.length === 0) {
    corp = text;
    if ((a.lungime ?? text.length) > LIMITA_TEXT_INTEGRAL) {
      avertisment = `text integral de ${text.length} caractere, peste ${LIMITA_TEXT_INTEGRAL}, fără articole cerute`;
    }
  } else {
    const parti: string[] = [];
    const gasite: string[] = [];
    for (const nr of cerute) {
      const bucata = articolDupaNumar({ text, articole: a.articole ?? [] } as ActParsat, nr);
      if (bucata === null) continue;
      gasite.push(nr);
      parti.push(`Art. ${nr}\n${bucata}`);
    }
    corp = `${parti.join("\n\n")}\n\nTextul primit conține doar articolele: ${gasite.join(", ")}`;
    if (gasite.length < cerute.length) avertisment = `articole negăsite: ${cerute.filter((n) => !gasite.includes(n)).join(", ")}`;
  }
  return { antet, corp, text: `${antet}${corp}\n`, articoleCerute: cerute, ...(avertisment ? { avertisment } : {}) };
}
