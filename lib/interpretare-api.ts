import type { InterpretareAct } from "./interpretare";

/** Prețuri de listă, $ pe milion de tokeni (skill claude-api, 2026-10-06). */
export const PRETURI: Record<string, { in: number; out: number; cache_w: number; cache_r: number }> = {
  "claude-sonnet-5-5": { in: 2, out: 10, cache_w: 2.5, cache_r: 0.2 },
  "claude-haiku-5-5": { in: 0.1, out: 0.5, cache_w: 0.125, cache_r: 0.01 },
  "claude-opus-5-5": { in: 4, out: 20, cache_w: 5, cache_r: 0.2 },
};

export type UsageApi = {
  input_tokens?: number | null;
  output_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

/** Costul în USD al unui răspuns. Model necunoscut: eroare, ca să nu raportăm un cost inventat. */
export function costUsd(usage: UsageApi, model: string): number {
  const p = PRETURI[model];
  if (!p) throw new Error(`model fără preț cunoscut: ${model} (adaugă-l în PRETURI)`);
  return (
    ((usage.input_tokens ?? 0) * p.in +
      (usage.cache_creation_input_tokens ?? 0) * p.cache_w +
      (usage.cache_read_input_tokens ?? 0) * p.cache_r +
      (usage.output_tokens ?? 0) * p.out) /
    1e6
  );
}

export const FISIER_INSTRUCTIUNI = "eval/interpretare/instructiuni.md";
export const FISIERE_SISTEM = ["lib/taguri.ts", "lib/formule.ts", "lib/formule-tip.ts", "lib/profil.ts", "data/destinatii.json"];

/**
 * Promptul de sistem: instrucțiunile (cu {{AZI}} înlocuit) plus fișierele la care trimit, în aceeași ordine și cu
 * același aspect ca eval/interpreteaza-api.mjs, ca memoria cache a prompturilor să rămână valabilă.
 * `citeste` primește o cale relativă la rădăcina repo-ului.
 */
export async function construiesteSistem(azi: string, citeste: (cale: string) => Promise<string>): Promise<string> {
  const fisier = async (f: string) => `### ${f}\n\n\`\`\`\n${await citeste(f)}\n\`\`\``;
  const parti = [(await citeste(FISIER_INSTRUCTIUNI)).replaceAll("{{AZI}}", azi), "## Fișierele la care trimit instrucțiunile"];
  for (const f of FISIERE_SISTEM) parti.push(await fisier(f));
  return parti.join("\n\n");
}

/** Obiectul JSON din răspunsul modelului: într-un bloc ```json sau de la prima `{` la ultima `}`. Null dacă nu se parsează. */
export function extrageJson(brut: string): unknown | null {
  const candidati: string[] = [];
  const fence = brut.match(/```(?:json)?\s*([\s\S]*?)```/)?.[1];
  if (fence !== undefined) candidati.push(fence);
  const a = brut.indexOf("{");
  const b = brut.lastIndexOf("}");
  if (a !== -1 && b > a) candidati.push(brut.slice(a, b + 1));
  for (const c of candidati) {
    try {
      return JSON.parse(c);
    } catch {
      /* încearcă următorul */
    }
  }
  return null;
}

type MesajFinal = {
  content: { type: string; text?: string }[];
  stop_reason?: string | null;
  stop_details?: { category?: string | null } | null;
  usage: UsageApi;
};

/** Cât din SDK folosim, ca să putem injecta un client fals în teste. */
export type ClientMesaje = {
  messages: { stream(params: any): { finalMessage(): Promise<MesajFinal> } };
};

export type RezultatApi =
  | { ok: true; interpretare: InterpretareAct; usage: UsageApi; secunde: number; usd: number }
  | { ok: false; motiv: "refuz" | "json_invalid" | "eroare"; detalii: string; brut?: string; usage?: UsageApi; usd?: number };

const PAUZA_REINCERCARE_MS = 20_000;

export function esteTranzitorie(e: unknown): boolean {
  const status = (e as { status?: number } | null)?.status;
  if (typeof status === "number") return status === 429 || status >= 500;
  return /overloaded|rate.?limit/i.test(e instanceof Error ? e.message : String(e));
}

/** Rulează `fn`; la o eroare tranzitorie (429/5xx/overloaded) așteaptă 20 s și mai încearcă o dată. */
export async function cuReincercare<T>(
  fn: () => Promise<T>,
  { asteapta = (ms: number) => new Promise<void>((r) => setTimeout(r, ms)), laReincercare }: { asteapta?: (ms: number) => Promise<void>; laReincercare?: (e: unknown) => void } = {},
): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (!esteTranzitorie(e)) throw e;
    laReincercare?.(e);
    await asteapta(PAUZA_REINCERCARE_MS);
    return await fn();
  }
}

/**
 * Un act prin API: streaming (actele lungi dau răspunsuri lungi, gândirea intră în max_tokens), o singură reîncercare
 * după 20 s la 429/5xx/overloaded. Răspunsul e doar o propunere; poarta rămâne verificaInterpretare.
 */
export async function interpreteazaText(
  client: ClientMesaje,
  { model, sistem, text }: { model: string; sistem: string; text: string },
  { asteapta = (ms: number) => new Promise<void>((r) => setTimeout(r, ms)) }: { asteapta?: (ms: number) => Promise<void> } = {},
): Promise<RezultatApi> {
  const params = {
    model,
    max_tokens: 32000,
    system: [{ type: "text", text: sistem, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: `${text}\n\nInterpretează actul de mai sus după instrucțiuni și întoarce doar obiectul JSON.` }],
  };
  const t0 = Date.now();
  let r: MesajFinal;
  try {
    r = await cuReincercare(() => client.messages.stream(params).finalMessage(), { asteapta });
  } catch (e) {
    const status = (e as { status?: number } | null)?.status;
    return { ok: false, motiv: "eroare", detalii: `${status ? `${status} ` : ""}${e instanceof Error ? e.message : String(e)}` };
  }
  const secunde = (Date.now() - t0) / 1000;
  const usage = r.usage;
  const usd = costUsd(usage, model);
  if (r.stop_reason === "refusal") {
    return { ok: false, motiv: "refuz", detalii: `refuz (${r.stop_details?.category ?? "?"})`, usage, usd };
  }
  const brut = r.content.filter((b) => b.type === "text").map((b) => b.text ?? "").join("");
  const obj = extrageJson(brut);
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return { ok: false, motiv: "json_invalid", detalii: `JSON invalid (stop_reason ${r.stop_reason ?? "?"})`, brut, usage, usd };
  }
  return { ok: true, interpretare: obj as InterpretareAct, usage, secunde, usd };
}
