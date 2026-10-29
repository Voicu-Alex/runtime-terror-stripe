import { describe, expect, it } from "vitest";
import { aplicaPropuneri, istoricLimitat, pregatesteRetry, valideazaRaspunsChat } from "./chat-ui";

describe("chat client boundary", () => {
  it("keeps numeric values and applies a proposal to the latest profile", () => {
    const latest = { taguri: ["angajat", "parinte"] as ("angajat" | "parinte" | "pfa")[], valori: { salariu_brut: 5000 } };
    expect(aplicaPropuneri(latest, { adauga: ["pfa"], scoate: ["angajat"] })).toEqual({
      taguri: ["parinte", "pfa"], valori: { salariu_brut: 5000 },
    });
  });

  it("sends at most twelve completed turns before the new message", () => {
    const messages = Array.from({ length: 20 }, (_, i) => ({ rol: i % 2 ? "asistent" as const : "om" as const, text: `turn ${i}` }));
    expect(istoricLimitat(messages)).toHaveLength(12);
    expect(istoricLimitat(messages)[0].text).toBe("turn 8");
  });

  it("rejects malformed response including unsafe citation URL and unknown tags", () => {
    const valid = { text: "Explicație", intentie: "lege", surse: [], propuneri: { adauga: [], scoate: [] }, sugestii: [], mod: "demo" };
    expect(valideazaRaspunsChat(valid)).toEqual(valid);
    expect(valideazaRaspunsChat({ ...valid, surse: [{ id: "x", titlu: "x", url: "javascript:alert(1)" }] })).toBeNull();
    expect(valideazaRaspunsChat({ ...valid, propuneri: { adauga: ["inventat"], scoate: [] } })).toBeNull();
  });

  it("retries the selected failed bubble using only its earlier completed history", () => {
    const messages = [
      { rol: "om" as const, text: "First", failed: true, contextId: "law-a" },
      { rol: "om" as const, text: "Second" },
      { rol: "asistent" as const, text: "Answer to second" },
      { rol: "om" as const, text: "Third", failed: true, contextId: "law-b" },
    ];
    expect(pregatesteRetry(messages, 0)).toEqual({ index: 0, message: "First", contextId: "law-a", history: [] });
    expect(pregatesteRetry(messages, 3)).toEqual({ index: 3, message: "Third", contextId: "law-b", history: [
      { rol: "om", text: "Second" }, { rol: "asistent", text: "Answer to second" },
    ] });
    expect(pregatesteRetry(messages, 1)).toBeNull();
  });
});
