import { describe, expect, it } from "vitest";
import { chatOwner } from "./chat-owner";

describe("assistant ownership in the current UI", () => {
  const empty = { taguri: [], valori: {} };
  it("uses the implicit Andrei example on the empty application page, but the personal profile on Profile", () => {
    expect(chatOwner("/aplicatie", null, empty)).toBe("demo:andrei");
    expect(chatOwner("/", null, empty)).toBe("personal");
    expect(chatOwner("/profil", null, empty)).toBe("personal");
    expect(chatOwner("/profil", "maria", empty)).toBe("demo:maria");
    expect(chatOwner("/aplicatie", null, { taguri: ["angajat"], valori: {} })).toBe("personal");
  });
  it("isolates explicit demo routes and ignores non-demo or inherited property names", () => {
    expect(chatOwner("/aplicatie", "maria", empty)).toBe("demo:maria");
    expect(chatOwner("/flux", "ion", empty)).toBe("demo:ion");
    expect(chatOwner("/flux", "constructor", empty)).toBe("personal");
    expect(chatOwner("/legi", "maria", empty)).toBe("personal");
  });
});
