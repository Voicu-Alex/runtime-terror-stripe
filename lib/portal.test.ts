import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { articolDupaNumar, esteLipsa, parseazaPaginaAct, URL_ACT } from "./portal";

const citeste = (id: string) => readFileSync(join(__dirname, "fixtures", "portal", `${id}.html`), "utf8");
const act = (id: string) => {
  const a = parseazaPaginaAct(citeste(id), id);
  if (!a) throw new Error(`fixtura ${id} nu s-a parsat`);
  return a;
};

describe("portal: LEGE 204/2026 (315641)", () => {
  const a = act("315641");
  it("antetul", () => {
    expect(a.tip_act).toBe("LEGE");
    expect(a.numar).toBe("204");
    expect(a.an).toBe(2026);
    expect(a.data_act).toBe("2026-10-22");
    expect(a.titlu.startsWith("LEGE nr. 204 din 22 octombrie 2026 privind aprobarea Ordonanței Guvernului nr. 22/2025")).toBe(true);
    expect(a.emitent).toBe("PARLAMENTUL ROMÂNIEI");
    expect(a.mo_ref).toBe("MO 886 / 22 oct 2026");
    expect(a.publicat_la).toBe("2026-10-22");
    expect(a.data_vigoare).toBeNull();
    expect(a.url).toBe(URL_ACT(315641));
  });
  it("forma simplă, text curat", () => {
    expect(a.consolidat).toBe(false);
    expect(a.anotari).toEqual([]);
    expect(a.lungime).toBe(a.text.length);
    expect(a.lungime).toBeGreaterThan(1500);
    expect(a.text).not.toMatch(/EMITENT|Forma printabilă|<|&nbsp;/);
  });
  it("articole cu cifre romane", () => {
    expect(a.articole.map((x) => x.nr)).toEqual(["art. I", "art. II"]);
    expect(articolDupaNumar(a, "art. I")).toContain("Se aprobă Ordonanța Guvernului nr. 22 din 28 august 2025");
    expect(articolDupaNumar(a, "II")).toContain("Articolul 342 din Legea nr. 227/2015");
  });
});

describe("portal: HOTĂRÂRE 603/2026 (313295)", () => {
  const a = act("313295");
  it("antetul", () => {
    expect(a.tip_act).toBe("HOTĂRÂRE");
    expect(a.numar).toBe("603");
    expect(a.an).toBe(2026);
    expect(a.data_act).toBe("2026-08-07");
    expect(a.titlu.startsWith("HOTĂRÂRE nr. 603 din 7 august 2026 privind adoptarea unor măsuri de siguranță")).toBe(true);
    expect(a.emitent).toBe("GUVERNUL ROMÂNIEI");
    expect(a.mo_ref).toBe("MO 658 / 7 aug 2026");
    expect(a.publicat_la).toBe("2026-08-07");
    expect(a.consolidat).toBe(false);
  });
  it("articolele", () => {
    expect(a.lungime).toBeGreaterThan(2500);
    expect(a.articole.map((x) => x.nr)).toEqual(["art. 1", "art. 2"]);
    expect(articolDupaNumar(a, "art. 1")).toContain("Transelectrica");
    expect(articolDupaNumar(a, "Art. 1")).toBe(articolDupaNumar(a, "1"));
  });
});

describe("portal: ORDIN 917/2026 (313223)", () => {
  const a = act("313223");
  it("antetul", () => {
    expect(a.tip_act).toBe("ORDIN");
    expect(a.numar).toBe("917");
    expect(a.an).toBe(2026);
    expect(a.data_act).toBe("2026-07-28");
    expect(a.titlu.startsWith("ORDIN nr. 917 din 28 iulie 2026 pentru modificarea anexei nr. 1")).toBe(true);
    expect(a.emitent).toBe("AGENȚIA NAȚIONALĂ DE ADMINISTRARE FISCALĂ");
    // data actului (28 iul) diferă de data publicării (5 aug)
    expect(a.mo_ref).toBe("MO 646 / 5 aug 2026");
    expect(a.publicat_la).toBe("2026-08-05");
    expect(a.consolidat).toBe(false);
  });
  it("articolele și anexa", () => {
    expect(a.lungime).toBeGreaterThan(2000);
    expect(a.articole.map((x) => x.nr)).toEqual(["art. I", "art. II", "art. III", "art. IV"]);
    expect(articolDupaNumar(a, "art. I")).toContain("Anexa nr. 1 la Ordinul președintelui");
    expect(a.text).toContain("ANEXĂ");
  });
});

describe("portal: LEGE 76/2002 consolidată (33919)", () => {
  const a = act("33919");
  it("antetul: data actului, nu a consolidării", () => {
    expect(a.tip_act).toBe("LEGE");
    expect(a.numar).toBe("76");
    expect(a.an).toBe(2002);
    expect(a.data_act).toBe("2002-01-16");
    expect(a.titlu.startsWith("LEGE nr. 76 din 16 ianuarie 2002 privind sistemul asigurărilor pentru șomaj")).toBe(true);
    expect(a.emitent).toBe("PARLAMENTUL");
    expect(a.mo_ref).toBe("MO 103 / 6 feb 2002");
    expect(a.publicat_la).toBe("2002-02-06");
    expect(a.data_vigoare).toBeNull();
    expect(a.consolidat).toBe(true);
  });
  it("adnotările sunt scoase din text și păstrate în anotari", () => {
    expect(a.anotari.length).toBeGreaterThan(300);
    expect(
      a.anotari.some((x) => x.includes("(la 09-03-2026") && x.includes("ORDONANȚA DE URGENȚĂ nr. 11 din 5 martie 2026")),
    ).toBe(true);
    expect(a.text).not.toContain("09-03-2026");
    expect(a.text).not.toMatch(/\(la \d{2}-\d{2}-\d{4}/);
    expect(a.text).not.toContain("Notă");
    expect(a.text).not.toContain("Forma printabilă");
  });
  it("articolele, inclusiv cele cu exponent", () => {
    expect(a.lungime).toBeGreaterThan(150000);
    expect(a.articole.length).toBe(170);
    expect(a.articole[0].nr).toBe("art. 1");
    expect(a.articole.at(-1)?.nr).toBe("art. 130");
    expect(a.articole.map((x) => x.nr)).toContain("art. 22^1");
    // articolul citat într-o notă („Articolul IV din HOTĂRÂRE nr. 570/2026”) nu e articol al actului
    expect(a.articole.map((x) => x.nr)).not.toContain("art. IV");
    for (const x of a.articole) {
      expect(x.inceput).toBeGreaterThanOrEqual(0);
      expect(x.sfarsit).toBeGreaterThan(x.inceput);
      expect(x.sfarsit).toBeLessThanOrEqual(a.text.length);
    }
    expect(articolDupaNumar(a, "art. 1")).toContain("dreptul de a-și alege liber profesia");
  });
  it("art. 76^5 este prima de stabilitate", () => {
    const t = articolDupaNumar(a, "art. 76^5");
    expect(t).not.toBeNull();
    expect(t).toContain("primă de stabilitate");
    expect(t).toContain("1.000 lei lunar");
    expect(articolDupaNumar(a, "76^5")).toBe(t);
  });
});

describe("portal: pagină inexistentă", () => {
  const html = citeste("999999999");
  it("esteLipsa și parseazaPaginaAct", () => {
    expect(esteLipsa(html, 500)).toBe(true);
    expect(esteLipsa(html)).toBe(true);
    expect(parseazaPaginaAct(html, "999999999")).toBeNull();
  });
  it("o pagină reală nu e lipsă", () => {
    expect(esteLipsa(citeste("315641"), 200)).toBe(false);
  });
  it("status de eroare sau corp gol", () => {
    expect(esteLipsa("<html></html>", 404)).toBe(true);
    expect(esteLipsa("", 200)).toBe(true);
  });
});

describe("portal: HTML sintetic", () => {
  const html = `<html><head><title>x</title><script>var a = "<span class='S_ART'>";</script></head><body>
  <div id="div_Formaconsolidata" class="content_forma_act">
  <span class="S_DEN">ORDONANŢĂ DE URGENŢĂ nr. 5 din 3 martie 2025</span>
  <span class="S_HDR">privind <A href="x">şcoala</A> &amp; ţara</span>
  <table class="S_EMT"><tr><td><span class="S_EMT_BDY"><li>GUVERNUL ROMÂNIEI</li></span></td></tr></table>
  <span class="S_PUB"><span class="S_PUB_BDY">MONITORUL OFICIAL nr. 12 din 5 mai 2025</span></span>
  <span class="S_ART"><span class="TAG_COLLAPSED"> + </span><span class="S_ART_TTL">Articolul 7^1</span><span class="S_ART_DEN">Plata</span>
  <span class="S_ART_BDY"><span class="S_PAR">Se acord&#259; 100&nbsp;lei&#x20;lunar.</span>
  <span class="S_PAR">
     (la 01-04-2025, Art. 7^1 a fost modificat de <A href="y">LEGEA nr. 1</A>)
  </span><span class="S_ALN"><span class="S_ALN_TTL">(2)</span> <span class="S_ALN_BDY">Alt text.</span><span class="S_ALN_SHORT"> ... </span></span></span></span>
  <span class="S_ART"><span class="S_ART_TTL">Articolul 8</span><span class="S_ART_BDY"><span class="S_PAR">Final.</span>
  <span class="S_NTA"><span class="S_NTA_TTL">Notă</span><span class="S_NTA_PAR">Conform altui act:</span>
  <span class="S_ART"><span class="S_ART_TTL">Articolul 99</span><span class="S_ART_BDY"><span class="S_PAR">citat</span></span></span></span></span></span>
  </div><div id="div_Formerepublicate"></div><span class="S_PAR">în afara actului</span></body></html>`;
  const a = parseazaPaginaAct(html, "1")!;
  it("metadate, diacritice cu virgulă, entități", () => {
    expect(a.tip_act).toBe("ORDONANȚĂ DE URGENȚĂ");
    expect(a.numar).toBe("5");
    expect(a.data_act).toBe("2025-03-03");
    expect(a.titlu).toBe("ORDONANȚĂ DE URGENȚĂ nr. 5 din 3 martie 2025 privind școala & țara");
    expect(a.emitent).toBe("GUVERNUL ROMÂNIEI");
    expect(a.mo_ref).toBe("MO 12 / 5 mai 2025");
    expect(a.publicat_la).toBe("2025-05-05");
  });
  it("text, adnotări, note, articole", () => {
    expect(a.text).toBe("Articolul 7^1 Plata Se acordă 100 lei lunar. (2) Alt text.\nArticolul 8 Final.");
    expect(a.consolidat).toBe(true);
    expect(a.anotari).toHaveLength(2);
    expect(a.anotari[0]).toContain("(la 01-04-2025, Art. 7^1 a fost modificat de LEGEA nr. 1)");
    expect(a.anotari[1]).toContain("Articolul 99 citat");
    expect(a.articole.map((x) => x.nr)).toEqual(["art. 7^1", "art. 8"]);
    expect(articolDupaNumar(a, "Art. 8")).toBe("Articolul 8 Final.");
    expect(articolDupaNumar(a, "art. 9")).toBeNull();
    expect(a.text).not.toContain("în afara actului");
  });
});
