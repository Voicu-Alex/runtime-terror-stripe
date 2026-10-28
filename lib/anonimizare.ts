/**
 * Mascarea datelor personale din text: CNP și IBAN românesc.
 * Se aplică pe tot ce iese din model înainte să ajungă în browser (apărare în adâncime:
 * modelului i se cere oricum să nu le întoarcă). Pe PDF și poze nu putem masca înainte
 * de trimitere fără OCR local, de aceea UI-ul îi cere omului să le ascundă el.
 */

const CNP = /\b[1-9]\d{12}\b/g;
const IBAN = /\bRO\d{2}[A-Z]{4}[A-Z0-9]{16}\b/gi;

export function mascheazaText(text: string): string {
  return text.replace(IBAN, "[IBAN]").replace(CNP, "[CNP]");
}

/** Maschează recursiv toate string-urile dintr-o valoare JSON. */
export function mascheaza<T>(x: T): T {
  if (typeof x === "string") return mascheazaText(x) as T;
  if (Array.isArray(x)) return x.map(mascheaza) as T;
  if (x && typeof x === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(x)) out[k] = mascheaza(v);
    return out as T;
  }
  return x;
}
