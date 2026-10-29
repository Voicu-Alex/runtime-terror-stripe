import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { MESAJ_NEINTELES, esteCerere, type CerereLege, type CerereProfil, type Extrasa, type RaspunsLege, type RaspunsProfil } from "@/lib/asistent";
import { PROMPT_PROFIL, mesajeLege, sistemLege } from "@/lib/asistent-prompt";
import { gasesteSchimbarea } from "@/lib/catalog";
import { demoLege, demoProfil, type DateCard } from "@/lib/demo-asistent";
import { GHID } from "@/lib/ghid";
import { aziISO, potriveste } from "@/lib/potrivire";
import { proActiv } from "@/lib/pro-server";
import { normalizeaza } from "@/lib/profil";
import { TOATE_TAGURILE, esteTag } from "@/lib/taguri";

export const runtime = "nodejs";

const SCHEMA_PROFIL = {
  type: "object",
  properties: {
    etichete: {
      type: "array",
      items: {
        type: "object",
        properties: { tag: { type: "string", enum: [...TOATE_TAGURILE] }, din: { type: "string" } },
        required: ["tag", "din"],
        additionalProperties: false,
      },
    },
    mesaj: { type: "string" },
  },
  required: ["etichete", "mesaj"],
  additionalProperties: false,
} as const;

const NO_STORE = { headers: { "Cache-Control": "no-store" } };

/**
 * Asistentul: `profil` scoate etichete din textul omului, `lege` răspunde despre un card.
 * Fără stocare și fără log cu conținutul. Fără ANTHROPIC_API_KEY (sau dacă apelul eșuează) răspunde modul demo.
 * Modul `profil` cere Pro activ (lib/pro-server.ts).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ eroare: "cerere invalidă" }, { status: 400 });
  }
  if (!esteCerere(body)) return NextResponse.json({ eroare: "cerere invalidă" }, { status: 400 });

  if (body.mod === "profil") {
    // Conversația de profil e pentru abonații Pro (ADR 0002); formularul și documentul rămân libere.
    if (!(await proActiv())) return NextResponse.json({ eroare: "doar cu abonament Pro" }, { status: 403, ...NO_STORE });
    const raspuns = process.env.ANTHROPIC_API_KEY ? await profilCuModel(body).catch(logEroare) : null;
    return NextResponse.json(raspuns ?? demoProfil(body), NO_STORE);
  }

  const schimbare = gasesteSchimbarea(body.id);
  if (!schimbare) return NextResponse.json({ eroare: "act necunoscut" }, { status: 404 });
  const date: DateCard = {
    schimbare,
    ghid: GHID.find((g) => g.id === body.id),
    potrivire: potriveste(normalizeaza(body.profil), [schimbare], aziISO())[0],
  };
  const raspuns = process.env.ANTHROPIC_API_KEY ? await legeCuModel(body, date).catch(logEroare) : null;
  return NextResponse.json(raspuns ?? demoLege(body, date), NO_STORE);
}

/** Doar tipul erorii, niciodată conținutul cererii. */
function logEroare(e: unknown): null {
  console.error("[asistent]", e instanceof Anthropic.APIError ? `Claude API: ${e.status}` : "eroare la apel");
  return null;
}

async function profilCuModel(c: CerereProfil): Promise<RaspunsProfil | null> {
  const client = new Anthropic();
  const r = await client.messages.create({
    model: "claude-haiku-5-5",
    max_tokens: 1000,
    system: PROMPT_PROFIL,
    output_config: { format: { type: "json_schema", schema: SCHEMA_PROFIL as unknown as Record<string, unknown> } },
    messages: [
      {
        role: "user",
        content: `Pasul ${c.pas}. Etichete deja notate: ${c.taguri.join(", ") || "niciuna"}. Textul omului: ${c.text.slice(0, 1000)}`,
      },
    ],
  });
  const bloc = r.content.find((b) => b.type === "text");
  if (r.stop_reason === "refusal" || r.stop_reason === "max_tokens" || !bloc || bloc.type !== "text") return null;

  let brut: { etichete?: { tag?: unknown; din?: unknown }[]; mesaj?: unknown };
  try {
    brut = JSON.parse(bloc.text);
  } catch {
    return null;
  }
  const vazute = new Set<string>(c.taguri);
  const etichete: Extrasa[] = [];
  for (const e of Array.isArray(brut.etichete) ? brut.etichete : []) {
    if (!esteTag(e?.tag) || vazute.has(e.tag)) continue;
    vazute.add(e.tag);
    const din = typeof e.din === "string" ? e.din.trim().slice(0, 40) : "";
    etichete.push(din ? { tag: e.tag, din } : { tag: e.tag });
  }
  const mesaj = typeof brut.mesaj === "string" ? brut.mesaj.trim() : "";
  return { etichete, mesaj: mesaj || MESAJ_NEINTELES };
}

async function legeCuModel(c: CerereLege, date: DateCard): Promise<RaspunsLege | null> {
  const client = new Anthropic();
  // Sonnet 5.5 gândește implicit și gândirea intră în max_tokens: cu 600 răspunsul venea gol (stop max_tokens)
  // și ruta cădea mereu pe șablon. Efort mic: răspunsul e de 2–3 propoziții, din blocul DATE.
  const r = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 4000,
    output_config: { effort: "low" },
    system: sistemLege(date),
    messages: mesajeLege(c.istoric, c.intrebare),
  });
  if (r.stop_reason === "refusal" || r.stop_reason === "max_tokens") return null;
  const text = r.content
    .flatMap((b) => (b.type === "text" ? [b.text] : []))
    .join("")
    .trim();
  if (!text) return null;
  // `sursa` o pune serverul din catalog, nu modelul.
  const s = date.schimbare;
  const eUrl = s.sursa_url && s.sursa_url !== "TODO";
  return {
    text,
    sursa: { act: s.act, articol: s.articol && s.articol !== "TODO" ? s.articol : undefined, url: eUrl ? s.sursa_url : undefined },
  };
}
