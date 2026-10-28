import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { mascheaza } from "@/lib/anonimizare";
import {
  INSTRUCTIUNI_MODEL,
  MARIME_MAXIMA,
  SCHEMA_ANALIZA,
  TIPURI_FISIER_ACCEPTATE,
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
    const raspuns = await client.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 1024,
      system: INSTRUCTIUNI_MODEL,
      tools: [
        {
          name: "propune_etichete",
          description: "Întoarce tipul documentului, etichetele propuse din lista fixă și valorile citite.",
          input_schema: SCHEMA_ANALIZA as unknown as Anthropic.Tool["input_schema"],
        },
      ],
      tool_choice: { type: "tool", name: "propune_etichete" },
      messages: [
        {
          role: "user",
          content: [
            blocDocument,
            { type: "text", text: "Analizează documentul și cheamă tool-ul propune_etichete." },
          ],
        },
      ],
    });

    const tool = raspuns.content.find((b) => b.type === "tool_use");
    if (!tool || tool.type !== "tool_use") {
      return NextResponse.json({ eroare: "Modelul nu a întors un rezultat structurat." }, { status: 502 });
    }

    const brut = tool.input as AnalizaDocument;
    // Apărare în adâncime: păstrăm doar etichete din taxonomie și mascăm CNP/IBAN din orice text.
    const curat: AnalizaDocument = mascheaza({
      mod: "claude",
      tip_document: brut.tip_document ?? "altul",
      etichete_propuse: (brut.etichete_propuse ?? []).filter((e) => esteTag(e.tag)),
      valori: brut.valori ?? {},
      explicatie_scurta: brut.explicatie_scurta ?? "",
    });

    return NextResponse.json(curat, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    // Fără conținutul documentului în log: doar tipul erorii.
    const mesaj = e instanceof Anthropic.APIError ? `Claude API: ${e.status}` : "Eroare la analiză.";
    console.error("[analiza-document]", mesaj);
    return NextResponse.json({ eroare: mesaj }, { status: 502 });
  }
}
