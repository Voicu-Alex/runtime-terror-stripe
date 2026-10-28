import destinatiiJson from "@/data/destinatii.json";

/**
 * Unde merge omul ca să facă o acțiune: pagină, formular, registru sau ghișeu.
 * Lista e închisă și verificată de oameni, ca etichetele și formulele: modelul alege un id,
 * nu scrie niciodată un URL. scripts/verifica-destinatii.mjs verifică zilnic fiecare URL.
 */
export type Destinatie = {
  nume: string;
  url: string | null;
  ce_este: "formular" | "pagina" | "registru" | "ghid" | "ghiseu";
  autoritate: string;
  verificare: { tip: "titlu"; contine: string } | { tip: "pdf" } | null;
  verificat_la: string | null;
};

export const DESTINATII = destinatiiJson as Record<string, Destinatie>;
export type DestinatieId = string;

export function esteDestinatie(x: unknown): x is DestinatieId {
  return typeof x === "string" && x in DESTINATII;
}

export function destinatie(id: DestinatieId | null | undefined): Destinatie | null {
  return id && esteDestinatie(id) ? DESTINATII[id] : null;
}
