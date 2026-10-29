/**
 * Părțile pure ale rulării zilnice (scripts/legi/zilnic.mts): intervalul de id-uri, argumentele fiecărui pas,
 * clasificarea codurilor de ieșire și tabelul de diferențe pe stări. Fără procese, fără rețea, fără bază de date.
 */

export const PASI = ["descopera", "triaj", "interpreteaza"] as const;
export type Pas = (typeof PASI)[number];

export interface OptiuniZilnic {
  pasIds: number;
  maxCereri: number;
  maxTriaj: number;
  maxInterpretari: number;
  bugetUsd: number;
  dryRun: boolean;
}

export const IMPLICITE: OptiuniZilnic = { pasIds: 400, maxCereri: 400, maxTriaj: 100, maxInterpretari: 20, bugetUsd: 2, dryRun: false };

export type Interval = { deLa: number | null; panaLa: number };

/**
 * Intervalul de id-uri al rulării.
 * - Cu bază de date și cursor: pana_la = cursor + pasIds; `deLa` rămâne null, pentru că `--reia` pornește de la cursor + 1.
 * - Fără cursor sau cu `--dry-run`: `deLa` e obligatoriu și intervalul are exact pasIds id-uri (deLa .. deLa + pasIds - 1).
 */
export function calculeazaInterval(o: { cursor: number | null; pasIds: number; deLa?: number | null; dryRun: boolean }): Interval {
  if (!Number.isInteger(o.pasIds) || o.pasIds < 1) throw new Error("--pas-ids trebuie să fie un număr întreg pozitiv.");
  if (o.dryRun || o.cursor === null) {
    if (o.deLa === undefined || o.deLa === null) {
      throw new Error(o.dryRun ? "--dry-run cere --de-la <id>." : "Nu există cursor pentru „portal”: dă --de-la <id>.");
    }
    return { deLa: o.deLa, panaLa: o.deLa + o.pasIds - 1 };
  }
  return { deLa: null, panaLa: o.cursor + o.pasIds };
}

/** Argumentele (fără `node --env-file ... --import tsx <script>`) pentru un pas. */
export function argumentePas(pas: Pas, o: OptiuniZilnic, interval: Interval): string[] {
  const dry = o.dryRun ? ["--dry-run"] : [];
  switch (pas) {
    case "descopera": {
      const interval_ =
        o.dryRun || interval.deLa !== null
          ? ["--de-la", String(interval.deLa), "--pana-la", String(interval.panaLa)]
          : ["--reia", "--pana-la", String(interval.panaLa)];
      return [...interval_, "--max", String(o.maxCereri), ...dry];
    }
    case "triaj":
      return ["--api", "--max", String(o.maxTriaj), ...dry];
    case "interpreteaza":
      return ["--stare", "triat_da", "--max", String(o.maxInterpretari), "--buget-usd", String(o.bugetUsd), ...dry];
  }
}

export type Rezultat = "ok" | "oprit_portal" | "buget" | "eroare";

/** 0 ok; 2 înseamnă „Portalul ne-a oprit” la descoperire și „bugetul a oprit rularea” la interpretare; orice altceva e eroare. */
export function claseazaIesire(pas: Pas, cod: number | null): Rezultat {
  if (cod === 0) return "ok";
  if (cod === 2 && pas === "descopera") return "oprit_portal";
  if (cod === 2 && pas === "interpreteaza") return "buget";
  return "eroare";
}

/** Rularea se oprește la portal blocat și la eroare; bugetul consumat nu e eroare. */
export const opresteRularea = (r: Rezultat) => r === "oprit_portal" || r === "eroare";

export function numaraStari(randuri: { stare_procesare: string }[]): Record<string, number> {
  const m: Record<string, number> = {};
  for (const r of randuri) m[r.stare_procesare] = (m[r.stare_procesare] ?? 0) + 1;
  return m;
}

export interface RandDelta {
  stare: string;
  inainte: number;
  dupa: number;
  delta: number;
}

/** Un rând pe stare, pentru stările care apar în cel puțin una dintre cele două numărători, ordonate alfabetic. */
export function tabelDelta(inainte: Record<string, number>, dupa: Record<string, number>): RandDelta[] {
  const stari = [...new Set([...Object.keys(inainte), ...Object.keys(dupa)])].sort();
  return stari.map((stare) => {
    const i = inainte[stare] ?? 0;
    const d = dupa[stare] ?? 0;
    return { stare, inainte: i, dupa: d, delta: d - i };
  });
}

export function formateazaDelta(randuri: RandDelta[]): string {
  if (!randuri.length) return "(niciun act în tabel)";
  const lat = Math.max(5, ...randuri.map((r) => r.stare.length));
  const cap = `${"stare".padEnd(lat)}  ${"înainte".padStart(7)}  ${"după".padStart(7)}  ${"diferență".padStart(9)}`;
  const linii = randuri.map((r) => {
    const semn = r.delta > 0 ? `+${r.delta}` : String(r.delta);
    return `${r.stare.padEnd(lat)}  ${String(r.inainte).padStart(7)}  ${String(r.dupa).padStart(7)}  ${semn.padStart(9)}`;
  });
  return [cap, ...linii].join("\n");
}
