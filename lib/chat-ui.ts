import type { RaspunsChat } from "./chat-asistent";
import { esteTag, type TagId } from "./taguri";
import type { Profil } from "./profil";

export type MesajChat = { rol: "om" | "asistent"; text: string; contextId?: string; raspuns?: RaspunsChat; pending?: boolean; failed?: boolean; decision?: "accepted" | "rejected" };

export function aplicaPropuneri(profil: Profil, propuneri: RaspunsChat["propuneri"]): Profil {
  const scoase = new Set(propuneri.scoate);
  return { ...profil, taguri: [...new Set([...profil.taguri.filter((tag) => !scoase.has(tag)), ...propuneri.adauga])] };
}

export function istoricLimitat(mesaje: MesajChat[]): { rol: "om" | "asistent"; text: string }[] {
  return mesaje.filter((m) => !m.pending && !m.failed).slice(-12).map(({ rol, text }) => ({ rol, text: text.slice(0, 2000) }));
}

export function pregatesteRetry(mesaje: MesajChat[], index: number): { index: number; message: string; contextId?: string; history: ReturnType<typeof istoricLimitat> } | null {
  const selected = mesaje[index];
  if (!selected || selected.rol !== "om" || !selected.failed) return null;
  return { index, message: selected.text, contextId: selected.contextId, history: istoricLimitat(mesaje.slice(0, index)) };
}

export function valideazaRaspunsChat(x: unknown): RaspunsChat | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Partial<RaspunsChat>;
  if (typeof o.text !== "string" || !o.text.trim() || o.text.length > 8000 ||
      !["profil", "lege", "termen", "clarificare"].includes(o.intentie ?? "") ||
      (o.mod !== "demo" && o.mod !== "model") ||
      !Array.isArray(o.surse) || !Array.isArray(o.sugestii) ||
      !o.sugestii.every((s) => typeof s === "string" && s.length <= 200) ||
      !o.propuneri || !Array.isArray(o.propuneri.adauga) || !Array.isArray(o.propuneri.scoate) ||
      ![...o.propuneri.adauga, ...o.propuneri.scoate].every(esteTag) ||
      !o.surse.every((s) => s && typeof s.id === "string" && typeof s.titlu === "string" &&
        typeof s.url === "string" && /^https:\/\//i.test(s.url) &&
        (s.articol === undefined || typeof s.articol === "string") &&
        (s.verificatLa === undefined || typeof s.verificatLa === "string")) ||
      (o.contextId !== undefined && typeof o.contextId !== "string")) return null;
  return o as RaspunsChat;
}

export function arePropuneri(p: { adauga: TagId[]; scoate: TagId[] }): boolean {
  return p.adauga.length + p.scoate.length > 0;
}
