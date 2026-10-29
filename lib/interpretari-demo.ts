import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { RandInterpretare, RezultatInterpretare } from "@/lib/supabase-server";

/**
 * Rânduri de demonstrație pentru /admin/acte?demo=1, făcute din rezultatele din eval/rezultate/haiku-api/legi
 * și primele 3 rânduri din eval/legi/<același nume>.txt (titlu, link, data intrării în vigoare).
 * Verificările sunt inventate pentru demo: toate trec, în afară de una la primul act cu mai multe schimbări.
 * Actele fără schimbări (atinge_banii: false) nu au ce aproba și sunt sărite.
 */
export function interpretariDemo(): RandInterpretare[] {
  const dirRez = join(process.cwd(), "eval", "rezultate", "haiku-api", "legi");
  const dirTxt = join(process.cwd(), "eval", "legi");
  const randuri: RandInterpretare[] = [];
  let picat = false;
  let id = 1;
  for (const f of readdirSync(dirRez).filter((x) => x.endsWith(".json")).sort()) {
    const rezultat = JSON.parse(readFileSync(join(dirRez, f), "utf8")) as RezultatInterpretare;
    if (!rezultat.schimbari.length) continue;
    let linii: string[] = [];
    try {
      linii = readFileSync(join(dirTxt, f.replace(/\.json$/, ".txt")), "utf8").split(/\r?\n/).slice(0, 3);
    } catch {
      /* fără text, rămân valorile goale */
    }
    const picate = !picat && rezultat.schimbari.length > 1 ? [{ cod: "citat_in_text", mesaj: "Citatul nu apare identic în textul actului.", schimbare: 0 }] : [];
    if (picate.length) picat = true;
    randuri.push({
      id: id++,
      model: "claude-haiku-5-5",
      driver: "api",
      creat_la: "2026-10-28T10:00:00Z",
      rezultat,
      verificari: {
        trecute: [
          { cod: "taguri_din_lista", mesaj: "Toate etichetele sunt din lista fixă." },
          { cod: "formula_valida", mesaj: "Formulele sunt cunoscute sau lipsesc." },
          { cod: "actiune_per_schimbare", mesaj: "Fiecare schimbare activă are cel puțin o acțiune." },
          ...(picate.length ? [] : [{ cod: "citat_in_text", mesaj: "Citatele apar identic în textul actului." }]),
        ],
        picate,
        ok: picate.length === 0,
      },
      act: {
        titlu: (linii[0] ?? rezultat.act).split(" EMITENT ")[0].trim(),
        mo_ref: rezultat.mo,
        url: linii[1]?.trim() || "https://legislatie.just.ro/",
        publicat_la: rezultat.publicat_la,
        tip_act: null,
        numar: null,
        an: null,
        lungime: null,
      },
    });
  }
  randuri.push(randCotaLipsa(id));
  return randuri;
}

/** Rând inventat (act fictiv, cifre fictive): o schimbare de cotă la care vechea cotă nu e în text, ca să apară câmpurile de completare. */
function randCotaLipsa(id: number): RandInterpretare {
  const rezultat: RezultatInterpretare = {
    act: "Lege fictivă nr. 0/2026 (demo)",
    mo: "MO 0 / 1 ian 2026 (fictiv)",
    publicat_la: "2026-10-28",
    atinge_banii: true,
    schimbari: [
      {
        rezumat: "Impozitul pe dividende crește la 12% (act fictiv, demo)",
        rezumat_en: "Dividend tax rises to 12% (fictitious act, demo)",
        taguri: ["srl_dividende"],
        in_vigoare_de_la: "2027-01-01",
        pana_la: null,
        status: "adoptat",
        directie: "cost",
        formula: null,
        formula_tip: {
          tip: "schimbare_cota",
          parametri: { camp: "dividende_anuale", cota_veche: null, cota_noua: 12, perioada: "an", sursa_veche: null },
        },
        articol: "art. 1 (fictiv)",
        citat: "cota de impozit pe dividende este de 12%",
        niveluri: { zero: "Plătești mai mult pe dividende.", curios: "Cota nouă e 12%; cea veche nu e în text.", expert: "Cota veche trebuie completată din actul în vigoare." },
        actiuni: [],
        incredere: "medie",
        nota: "Rând fictiv pentru demo.",
      },
    ],
  };
  return {
    id,
    model: "claude-haiku-5-5",
    driver: "api",
    creat_la: "2026-10-28T11:00:00Z",
    rezultat,
    verificari: { trecute: [{ cod: "formula_valida", mesaj: "Formulele sunt cunoscute sau lipsesc." }], picate: [], ok: true },
    act: { titlu: "Lege fictivă (demo)", mo_ref: rezultat.mo, url: "https://legislatie.just.ro/", publicat_la: rezultat.publicat_la, tip_act: null, numar: null, an: null, lungime: null },
  };
}
