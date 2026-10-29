/**
 * Triajul cu model al actelor candidate: promptul, formatul loturilor, validarea răspunsului, costul.
 * Funcții pure, fără I/O și fără SDK; apelul la API și scrierea în bază sunt în scripts/legi/triaj.mts.
 * Verdictul modelului e o propunere; poarta rămâne omul din /admin/acte.
 */

export type ActPentruTriajModel = {
  id: string;
  titlu: string;
  tip_act: string;
  emitent: string | null;
  mo_ref: string | null;
  text: string;
  triaj?: { reguli?: { motive?: string[] } } | null;
};

export type VerdictModel = { atinge_banii: boolean; motiv: string };

export const INSTRUCTIUNI_TRIAJ = `# Instrucțiuni: triajul actelor normative

Ești modulul de triaj al aplicației „Ce înseamnă pentru mine”. Primești un lot de acte normative române (lege, ordonanță, hotărâre, ordin), fiecare cu titlul, tipul, emitentul, referința din Monitorul Oficial, motivele pentru care regulile simple l-au trimis la tine și începutul textului. Pentru fiecare act decizi un singur lucru: schimbă banii, obligațiile sau drepturile unei persoane fizice ori ale unei PFA sau SRL mici? Un om verifică verdictul tău înainte să ajungă ceva în aplicație.

## Reguli

1. **atinge_banii: true** dacă actul schimbă ce primește, ce plătește sau ce are de făcut o persoană fizică ori o PFA/SRL mic: impozite și contribuții, pensii, alocații, salarii și indemnizații, tarife și prețuri, TVA și accize, vouchere, subvenții, plafonări de prețuri, termene și formulare pentru contribuabili.
2. **atinge_banii: false** pentru numiri și revocări, proiecte de investiții, organizarea și funcționarea instituțiilor, angajări în sectorul public, transferuri de bunuri ale statului, despăgubiri pentru câțiva proprietari numiți, autorizări și acreditări ale unor unități.
3. **Text tăiat.** Când textul se termină cu „[…text tăiat…]” și titlul sugerează bani (impozit, pensie, alocație, salariu, tarif, TVA, accize, voucher, subvenție, plafonare de preț), alege \`true\`: actul e de citit integral.
4. **Nimic inventat.** Te bazezi doar pe titlu și pe textul primit. Nu presupui ce spune un alt act la care se trimite.
5. **Nu e sfat financiar.** Motivul descrie ce face actul, fără recomandări, fără „garantat”, fără „cel mai bun”.

## Ce întorci

Doar un obiect JSON, fără alt text, cu cheia fiecărui act din lot (id-ul exact de după „##”) și toate id-urile prezente:

\`\`\`json
{ "<id>": { "atinge_banii": true, "motiv": "o propoziție în română simplă" } }
\`\`\``;

/** Formatul loturilor scrise de `triaj.mts --export` și trimise modelului. */
export function construiesteLot(acte: ActPentruTriajModel[], caractere = 4000): string {
  return acte
    .map((r) => {
      const text = String(r.text);
      return `## ${r.id}\n\n**${String(r.titlu).replace(/\s+/g, " ").trim()}**\nTip: ${r.tip_act} · Emitent: ${r.emitent ?? "?"} · ${r.mo_ref ?? ""}\nMotivele regulilor: ${(r.triaj?.reguli?.motive ?? []).join("; ")}\n\n${text.slice(0, caractere)}${text.length > caractere ? "\n[…text tăiat…]" : ""}\n`;
    })
    .join("\n---\n\n");
}

export type RezultatVerdicte = { verdicte: Record<string, VerdictModel>; lipsa: string[]; invalide: string[] };

/** Scoate JSON-ul dintr-un răspuns brut (bloc ```json sau text în jurul acoladelor) și îl validează. */
export function parseazaVerdicte(raspuns: string, ids: string[]): RezultatVerdicte {
  const dinBloc = raspuns.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1];
  const candidate = [dinBloc, raspuns.slice(raspuns.indexOf("{"), raspuns.lastIndexOf("}") + 1)].filter((c): c is string => !!c);
  let obiect: Record<string, unknown> | null = null;
  for (const c of candidate) {
    try {
      const v = JSON.parse(c);
      if (v && typeof v === "object" && !Array.isArray(v)) {
        obiect = v;
        break;
      }
    } catch {
      /* încearcă următoarea variantă */
    }
  }
  if (!obiect) return { verdicte: {}, lipsa: [...ids], invalide: [] };

  const verdicte: Record<string, VerdictModel> = {};
  const invalide: string[] = [];
  const cunoscute = new Set(ids);
  for (const [id, v] of Object.entries(obiect)) {
    const o = v as { atinge_banii?: unknown; motiv?: unknown } | null;
    const bun = cunoscute.has(id) && o && typeof o.atinge_banii === "boolean" && typeof o.motiv === "string" && o.motiv.trim() !== "";
    if (bun) verdicte[id] = { atinge_banii: o.atinge_banii as boolean, motiv: (o.motiv as string).trim() };
    else invalide.push(id);
  }
  const lipsa = ids.filter((id) => !(id in verdicte) && !invalide.includes(id));
  return { verdicte, lipsa, invalide };
}

export type UtilizareApi = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

/** Prețuri de listă, $ pe milion de tokeni (aceleași ca în eval/interpreteaza-api.mjs). */
const PRET: Record<string, { in: number; out: number; cache_w: number; cache_r: number }> = {
  "claude-haiku-5-5": { in: 0.1, out: 0.5, cache_w: 0.125, cache_r: 0.01 },
  "claude-sonnet-5-5": { in: 2, out: 10, cache_w: 2.5, cache_r: 0.2 },
};

export function costTriajUsd(usage: UtilizareApi, model: string): number {
  const p = PRET[model];
  if (!p) throw new Error(`Model fără preț cunoscut: ${model}`);
  return ((usage.input_tokens ?? 0) * p.in + (usage.cache_creation_input_tokens ?? 0) * p.cache_w + (usage.cache_read_input_tokens ?? 0) * p.cache_r + (usage.output_tokens ?? 0) * p.out) / 1e6;
}

/** Noul `triaj` și noua stare, ca la `triaj.mts --aplica`. `azi` e data ISO (aaaa-ll-zz). */
export function verdictInTriaj(triaj: Record<string, unknown> | null | undefined, verdict: VerdictModel, model: string, azi: string) {
  return {
    triaj: { ...(triaj ?? {}), model: { atinge_banii: verdict.atinge_banii, motiv: verdict.motiv, model, la: azi } },
    stare_procesare: verdict.atinge_banii ? ("triat_da" as const) : ("triat_nu" as const),
  };
}
