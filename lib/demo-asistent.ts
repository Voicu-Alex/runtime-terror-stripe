/**
 * Modul demo al asistentului: fără cheie API, ruta răspunde de aici. Nimic inventat:
 * etichetele vin din cuvinte-cheie, răspunsurile despre o lege vin din datele catalogului.
 */
import type { TagId } from "./taguri";
import type { Schimbare } from "./catalog";
import type { IntrareGhid } from "./ghid";
import type { Potrivire } from "./potrivire";
import type { CerereLege, CerereProfil, RaspunsLege, RaspunsProfil } from "./asistent";

export type DateCard = { schimbare: Schimbare; ghid?: IntrareGhid; potrivire?: Potrivire };

/** Cuvânt → etichetă. Regex cu limite de cuvânt, pe text normalizat (minuscule, cu diacritice). */
export const CUVINTE: readonly { regex: RegExp; tag: TagId }[] = [];

/** Extragere determinist: cuvintele găsite → etichete, cu cuvântul în `din`. Fără sume în `mesaj`. */
export function demoProfil(c: CerereProfil): RaspunsProfil {
  void c;
  throw new Error("TODO");
}

/**
 * Răspuns pentru un card din datele lui: niveluri.curios (sau zero), apoi actul și articolul.
 * Pentru `pilon2_plata` (Legea 2/2026): răspunsuri scrise pe tipuri de întrebare
 * („de ce mă privește”, „ce înseamnă eșalonat”, „dacă nu fac nimic”), tot din niveluri/ghid.
 */
export function demoLege(c: CerereLege, date: DateCard): RaspunsLege {
  void c;
  void date;
  throw new Error("TODO");
}
