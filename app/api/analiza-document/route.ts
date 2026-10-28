import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { mascheaza } from "@/lib/anonimizare";
import {
  INSTRUCTIUNI_MODEL,
  MARIME_MAXIMA,
  SCHEMA_ANALIZA,
  TIPURI_FISIER_ACCEPTATE,
  curataValori,
  type AnalizaDocument,
} from "@/lib/analiza-document";
import { raspunsDemo } from "@/lib/demo-analiza";
import { esteTag } from "@/lib/taguri";

export const runtime = "nodejs";

/**
 * Primește un document, îl trimite o singură dată la Claude și întoarce etichetele propuse.
 * Pe server nu se scrie nimic: fără log cu conținutul, fără stocare. Cheia stă în .env.local.
 */
export async function POST(req: Request) {
  let fisier: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("fisier");
    if (f instanceof File) fisier = f;
  } catch {
    return NextResponse.json({ eroare: "Cererea trebuie să fie multipart/form-data cu câmpul „fisier”." }, { status: 400 });
  }
  if (!fisier) return NextResponse.json({ eroare: "Lipsește fișierul." }, { status: 400 });

  const tip = fisier.type as (typeof TIPURI_FISIER_ACCEPTATE)[number];
  if (!TIPURI_FISIER_ACCEPTATE.includes(tip)) {
    return NextResponse.json({ eroare: "Acceptăm doar PDF, JPG sau PNG." }, { status: 415 });
  }
  if (fisier.size > MARIME_MAXIMA) {
    return NextResponse.json({ eroare: "Fișierul are peste 10 MB." }, { status: 413 });
  }

  // Mod demo: fără cheie, răspunsuri pregătite pentru documentele din test-docs/.
  if (!process.env.ANTHROPIC_API_KEY) {
    const demo = raspunsDemo(fisier.name);
    if (demo) return NextResponse.json(demo, { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json(
      {
        eroare:
          "Mod demo (fără ANTHROPIC_API_KEY): merg doar documentele din test-docs/ (contract-munca.pdf, factura-gaz.pdf, fluturas-salariu.png). Pentru orice document, pune cheia în .env.local.",
      },
      { status: 503 },
    );
  }

  const data = Buffer.from(await fisier.arrayBuffer()).toString("base64");
  const blocDocument =
    tip === "application/pdf"
      ? ({ type: "document", source: { type: "base64", media_type: "application/pdf", data } } as const)
      : ({ type: "image", source: { type: "base64", media_type: tip, data } } as const);

  const client = new Anthropic();
  try {
    // Pe claude-opus-5-5, tool_choice forțat („tool”/„any”) dă 400. Răspunsul structurat vine prin
    // output_config.format (JSON validat de API după SCHEMA_ANALIZA). Gândirea e mereu pornită pe acest
    // model și se numără în max_tokens, de aici limita mai mare.
    const raspuns = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      system: INSTRUCTIUNI_MODEL,
      output_config: { format: { type: "json_schema", schema: SCHEMA_ANALIZA as unknown as Record<string, unknown> } },
      messages: [
        {
          role: "user",
          content: [blocDocument, { type: "text", text: "Analizează documentul și întoarce rezultatul în formatul cerut." }],
        },
      ],
    });

    if (raspuns.stop_reason === "refusal") {
      return NextResponse.json({ eroare: "Modelul a refuzat să analizeze documentul." }, { status: 422 });
    }
    const text = raspuns.content.find((b) => b.type === "text");
    if (!text || text.type !== "text" || raspuns.stop_reason === "max_tokens") {
      return NextResponse.json({ eroare: "Modelul nu a întors un rezultat structurat." }, { status: 502 });
    }

    let brut: AnalizaDocument;
    try {
      brut = JSON.parse(text.text) as AnalizaDocument;
    } catch {
      return NextResponse.json({ eroare: "Modelul nu a întors JSON valid." }, { status: 502 });
    }
    // Apărare în adâncime: păstrăm doar etichete din taxonomie și mascăm CNP/IBAN din orice text.
    const curat: AnalizaDocument = mascheaza({
      mod: "claude",
      tip_document: brut.tip_document ?? "altul",
      etichete_propuse: (brut.etichete_propuse ?? [])
        .filter((e) => esteTag(e.tag))
        // sub 0,2 modelul spune de fapt că eticheta nu se potrivește (ex. „rural” la o adresă din București)
        .filter((e) => Number(e.incredere) >= 0.2)
        .map((e) => ({ ...e, incredere: Math.min(1, Math.max(0, Number(e.incredere) || 0)) })),
      valori: curataValori(brut.valori as Record<string, unknown>),
      explicatie_scurta: brut.explicatie_scurta ?? "",
    });

    return NextResponse.json(curat, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    // Fără conținutul documentului în log: doar tipul erorii.
    const mesaj = e instanceof Anthropic.APIError ? `Claude API: ${e.status}` : "Eroare la analiză.";
    // Mesajul de eroare al API-ului descrie cererea (parametri, schemă), nu documentul.
    console.error("[analiza-document]", mesaj, e instanceof Anthropic.APIError ? e.message : "");
    return NextResponse.json({ eroare: mesaj }, { status: 502 });
  }
}
