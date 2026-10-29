import { describe, expect, it } from "vitest";
import { CATALOG, gasesteSchimbarea } from "./catalog";
import { GHID } from "./ghid";
import { PROMPT_LEGE, PROMPT_PROFIL, blocDate, mesajeLege } from "./asistent-prompt";
import { TOATE_TAGURILE } from "./taguri";

describe("asistent-prompt", () => {
  const schimbare = gasesteSchimbarea("pilon2_plata")!;
  const ghid = GHID.find((g) => g.id === "pilon2_plata");

  it("blocDate pentru pilon2_plata are actul și articolul, fără TODO", () => {
    const bloc = blocDate({ schimbare, ghid });
    expect(bloc).toContain("Legea 2/2026");
    expect(bloc).toContain("art. 55");
    expect(bloc).not.toContain("TODO");
  });

  it("blocDate nu are TODO pentru nicio schimbare din catalog", () => {
    for (const s of CATALOG) expect(blocDate({ schimbare: s, ghid: GHID.find((g) => g.id === s.id) })).not.toContain("TODO");
  });

  it("PROMPT_LEGE nu cere să spună etichetele și nu are exemple de onboarding", () => {
    expect(PROMPT_LEGE).not.toContain("spune ce etichete ai notat");
    expect(PROMPT_LEGE).not.toContain("Deschiderea");
    expect(PROMPT_LEGE).toContain("Termen depășit");
    expect(PROMPT_LEGE).toContain("blocul DATE");
  });

  it("PROMPT_PROFIL conține toate etichetele din taxonomie", () => {
    for (const t of TOATE_TAGURILE) expect(PROMPT_PROFIL).toContain(t);
    expect(PROMPT_PROFIL).toContain("spune ce etichete ai notat");
    expect(PROMPT_PROFIL).toContain("Omul corectează o etichetă");
  });

  it("mesajeLege începe cu user, fără roluri consecutive, se termină cu întrebarea", () => {
    const m = mesajeLege(
      [
        { rol: "asistent", text: "Salut" },
        { rol: "om", text: "a" },
        { rol: "om", text: "b" },
        { rol: "asistent", text: "c" },
      ],
      "d",
    );
    expect(m.map((x) => x.role)).toEqual(["user", "assistant", "user"]);
    expect(m[0].content).toBe("a\nb");
    expect(m[2].content).toBe("d");
  });
});
