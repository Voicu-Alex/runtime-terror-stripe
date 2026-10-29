import { describe, expect, it } from "vitest";
import { triajReguli } from "./triaj-reguli";

const t = (tip_act: string, titlu: string, emitent: string | null = null) => triajReguli({ tip_act, titlu, emitent });

describe("triajReguli", () => {
  it("legea care modifică Codul fiscal (Legea 239/2025) e candidat", () => {
    const r = t("LEGE", "Lege nr. 239/2025 pentru modificarea și completarea Legii nr. 227/2015 privind Codul fiscal", "Parlamentul");
    expect(r.candidat).toBe(true);
    expect(r.motive.length).toBeGreaterThan(0);
  });
  it("OUG 11/2026 despre ocuparea forței de muncă e candidat", () => {
    expect(t("ORDONANȚĂ DE URGENȚĂ", "OUG nr. 11/2026 privind ocuparea forței de muncă", "Guvernul").candidat).toBe(true);
  });
  it("HG 146/2026 salariul minim e candidat", () => {
    expect(t("HOTĂRÂRE", "Hotărâre nr. 146/2026 pentru stabilirea salariului de bază minim brut pe țară", "Guvernul").candidat).toBe(true);
  });
  it("tipul se potrivește fără diacritice și cu majuscule diferite", () => {
    expect(t("Ordonanta de urgenta", "x").candidat).toBe(true);
    expect(t("ORDONANTA", "x").candidat).toBe(true);
    expect(t("hotarare", "x").candidat).toBe(true);
  });
  it("ORDIN ANAF e candidat după emitent, chiar fără cuvinte cheie", () => {
    const r = t("ORDIN", "Ordin pentru aprobarea modelului unui formular", "Agenția Națională de Administrare Fiscală");
    expect(r.candidat).toBe(true);
    expect(r.motive.join(" ")).toContain("ANAF");
  });
  it("ORDIN al Ministerului Finanțelor e candidat", () => {
    expect(t("ORDIN", "Ordin privind o procedură", "MINISTERUL FINANȚELOR").candidat).toBe(true);
  });
  it("ORDIN al Ministerului Culturii fără cuvinte cheie nu e candidat", () => {
    const r = t("ORDIN", "Ordin pentru aprobarea componenței comisiei de avizare a monumentelor", "Ministerul Culturii");
    expect(r.candidat).toBe(false);
    expect(r.motive.length).toBe(1);
  });
  it("ORDIN al Ministerului Culturii cu cuvânt cheie în titlu e candidat", () => {
    const r = t("ORDIN", "Ordin privind acordarea de burse și ajutoare", "Ministerul Culturii");
    expect(r.candidat).toBe(true);
    expect(r.motive.join(" ")).toContain("bursă");
  });
  it("NORMĂ ASF e candidat; DECIZIE fără relevanță nu", () => {
    expect(t("NORMĂ", "Normă privind raportarea", "Autoritatea de Supraveghere Financiară").candidat).toBe(true);
    expect(t("DECIZIE", "Decizie privind numirea unui prefect", "Prim-ministrul").candidat).toBe(false);
  });
  it("cuvintele cheie se potrivesc pe rădăcină, fără diacritice", () => {
    expect(t("PROCEDURĂ", "Procedură pentru deducerea cheltuielilor", "Altcineva").candidat).toBe(true);
    expect(t("ORDIN", "Ordin privind tarifele la gaze naturale", "Altcineva").candidat).toBe(true);
    expect(t("ORDIN", "Ordin privind rovinieta", "Altcineva").candidat).toBe(true);
    expect(t("ORDIN", "Ordin privind concediul de odihnă", "Altcineva").candidat).toBe(true);
  });
  it("LISTĂ nu e candidat", () => {
    const r = t("LISTĂ", "Lista monumentelor istorice", "Ministerul Culturii");
    expect(r.candidat).toBe(false);
    expect(r.motive.length).toBeGreaterThan(0);
  });
  it("DECRET nu e candidat", () => {
    expect(t("DECRET", "Decret privind conferirea unei decorații", "Președintele României").candidat).toBe(false);
  });
  it("CIRCULARĂ nu e candidat, nici când are cuvânt cheie", () => {
    expect(t("CIRCULARĂ", "Circulară privind impozitul", "BNR").candidat).toBe(false);
  });
  it("Decizia CCR nu e candidat, chiar dacă titlul pomenește Codul fiscal", () => {
    const r = t("DECIZIE", "Decizia nr. 12/2026 referitoare la excepția de neconstituționalitate a dispozițiilor Codului fiscal", "CURTEA CONSTITUȚIONALĂ");
    expect(r.candidat).toBe(false);
  });
  it("emitent nul nu strică nimic", () => {
    expect(t("ORDIN", "Ordin privind o taxă", null).candidat).toBe(true);
    expect(t("ORDIN", "Ordin organizatoric", null).candidat).toBe(false);
  });
});
