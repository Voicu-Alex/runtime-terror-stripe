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
  return randuri;
}
