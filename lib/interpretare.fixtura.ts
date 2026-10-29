/**
 * Fixtura testelor: rezultatul modelului pentru HG 146/2026 (eval/rezultate/haiku-api, format v2) adus la
 * forma v3 cu câmpurile noi completate de mână, și actul brut cu antetul din eval/legi. Folosită doar în teste.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { ActBrut, InterpretareAct } from "./interpretare";

const RAD = path.join(import.meta.dirname, "..");
const interpV2 = JSON.parse(readFileSync(path.join(RAD, "eval/rezultate/haiku-api/legi/hg-146-2026-salariu-minim.json"), "utf8")) as InterpretareAct;

export const interp: InterpretareAct = {
  ...interpV2,
  schimbari: interpV2.schimbari.map((s) => ({
    ...s,
    rezumat_en: "Gross minimum wage rises to 4,325 lei from 1 July 2026",
    conditii: [],
    termen_actiune: null,
  })),
};

export const act: ActBrut = {
  id: "portal:308231",
  sursa: "portal",
  sursa_id: "308231",
  url: "https://legislatie.just.ro/Public/DetaliiDocument/308231",
  mo_ref: "MO 196 / 13 mar 2026",
  publicat_la: "2026-03-13",
  titlu: "HOTĂRÂRE nr. 146 din 12 martie 2026 pentru stabilirea salariului de bază minim brut pe țară garantat în plată",
  text: readFileSync(path.join(RAD, "eval/legi/hg-146-2026-salariu-minim.txt"), "utf8"),
};
