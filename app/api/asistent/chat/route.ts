import { NextResponse } from "next/server";
import { esteCerereChat, raspundeDemoChat } from "@/lib/chat-asistent";
import { raspundeModelChat } from "@/lib/chat-asistent-model";
import { adresaDin, contorNou, inregistreaza, limiteDinEnv } from "@/lib/limita";
import { proActiv } from "@/lib/pro-server";

export const runtime = "nodejs";
const NO_STORE = { headers: { "Cache-Control": "no-store" } };
const CONTOR = contorNou();

async function citesteCorpLimitat(req: Request): Promise<string> {
  const reader = req.body?.getReader();
  if (!reader) return "";
  let octeti = 0;
  const decoder = new TextDecoder();
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    octeti += value.byteLength;
    if (octeti > 30000) { await reader.cancel(); throw new Error("cerere prea mare"); }
    text += decoder.decode(value, { stream: true });
  }
  return text + decoder.decode();
}

/** Conversație fără persistență pe server; fără cheie sau la eroare, răspuns din catalog. Doar cu Pro activ. */
export async function POST(req: Request) {
  if (!(await proActiv())) return NextResponse.json({ eroare: "doar cu abonament Pro" }, { status: 403, ...NO_STORE });
  let body: unknown;
  try {
    body = JSON.parse(await citesteCorpLimitat(req));
  } catch {
    return NextResponse.json({ eroare: "cerere invalidă" }, { status: 400, ...NO_STORE });
  }
  if (!esteCerereChat(body)) return NextResponse.json({ eroare: "cerere invalidă" }, { status: 400, ...NO_STORE });
  const demo = raspundeDemoChat(body);
  const eligibil = (demo.intentie === "lege" || demo.intentie === "termen") && demo.surse.length > 0;
  const limite = limiteDinEnv({
    LIMITA_DOCUMENTE_PE_ORA: process.env.LIMITA_ASISTENT_PE_ORA ?? "20",
    LIMITA_DOCUMENTE_PE_ZI: process.env.LIMITA_ASISTENT_PE_ZI ?? "150",
  });
  const permis = process.env.ANTHROPIC_API_KEY && eligibil
    && inregistreaza(CONTOR, adresaDin(req.headers), limite, Date.now()).permis;
  // Never log the question, history, profile or provider response.
  const model = permis
    ? await raspundeModelChat(body, demo, req.signal).catch(() => null)
    : null;
  return NextResponse.json(model ?? demo, NO_STORE);
}
