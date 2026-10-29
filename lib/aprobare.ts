/**
 * Aprobarea sau respingerea unei interpretări propuse (tabelul `interpretari`).
 * Contractul e folosit de pagina /admin/acte (acțiuni de server) și de scripts/legi/aproba.mts.
 * Maparea spre Schimbare + IntrareGhid vine din lib/interpretare.ts; aici se scriu data/catalog.json,
 * data/ghid.json și rândurile din Supabase. Fără efecte la import: doar `node:fs/promises` și clientul.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { clientSupabase, explicaEroarea } from "../scripts/legi/db.mjs";
import { valideazaCatalog, type Schimbare } from "./catalog";
import { formulaCompleta } from "./formule-tip";
import { valideazaGhid, type IntrareGhid } from "./ghid";
import { spreGhid, spreSchimbare, type ActBrut, type InterpretareAct } from "./interpretare";

export type OptiuniAprobare = {
  /** indecșii schimbărilor din `rezultat.schimbari` de aprobat; lipsă = toate */
  schimbari?: number[];
  /**
   * cota veche și sursa ei pentru schimbările `schimbare_cota` la care modelul n-a găsit-o în text, pe indicele schimbării.
   * Intră doar în catalog și în nota_revizor; `interpretari.rezultat` rămâne cum a propus-o modelul.
   */
  completari?: Record<number, { cota_veche: number; sursa_veche: string }>;
  /** adresa celui care aprobă, scrisă în nota_revizor */
  revizor: string;
  /** data verificării (ISO); lipsă = azi */
  azi?: string;
};

export type RezultatAprobare = {
  schimbareIds: string[];
  /** fișierele sunt scrise, dar ceva din Supabase n-a mers (de ex. tabelele `schimbari`/`ghid` nu există încă) */
  avertisment?: string;
};

/** Ce atinge aprobarea, injectabil ca să o putem testa fără disc și fără Supabase. */
export type Dependinte = {
  client: ReturnType<typeof clientSupabase>;
  citeste(fisier: "catalog" | "ghid"): Promise<string>;
  scrie(fisier: "catalog" | "ghid", text: string): Promise<void>;
  acum(): Date;
};

const FISIERE = { catalog: "data/catalog.json", ghid: "data/ghid.json" } as const;

/**
 * Adaugă intrări la sfârșitul unei liste JSON din data/ fără să rescrie restul: fișierele sunt formatate pe jumătate
 * de mână (unele liste scurte stau pe un rând), iar o rescriere întreagă ar umple diff-ul. Indentare 2, același
 * sfârșit de linie ca fișierul, linie nouă la final.
 */
export function adaugaIntrari(text: string, noi: unknown[]): string {
  if (!noi.length) return text;
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const sfarsit = text.lastIndexOf("]");
  if (sfarsit < 0 || text.indexOf("[") < 0) throw new Error("Fișierul nu e o listă JSON.");
  const inainte = text.slice(0, sfarsit).trimEnd();
  const intrari = noi.map((x) => JSON.stringify(x, null, 2).replace(/^/gm, "  ").replace(/\n/g, eol)).join(`,${eol}`);
  const separator = inainte.endsWith("[") ? "" : ",";
  return `${inainte}${separator}${eol}${intrari}${eol}]${eol}`;
}

function dependinteReale(): Dependinte {
  const cale = (f: "catalog" | "ghid") => path.join(process.cwd(), FISIERE[f]);
  return {
    client: clientSupabase({ scriere: true }),
    citeste: (f) => readFile(cale(f), "utf8"),
    scrie: (f, text) => writeFile(cale(f), text, "utf8"),
    acum: () => new Date(),
  };
}

const esteTabelaLipsa = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" || /does not exist|schema cache/i.test(e.message ?? ""));

async function incarca(dep: Dependinte, id: number) {
  const { data: interpretare, error } = await dep.client.from("interpretari").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`interpretari: ${explicaEroarea(error)}`);
  if (!interpretare) throw new Error(`Interpretarea ${id} nu există.`);
  const { data: act, error: eroareAct } = await dep.client.from("acte").select("*").eq("id", interpretare.act_id).maybeSingle();
  if (eroareAct) throw new Error(`acte: ${explicaEroarea(eroareAct)}`);
  if (!act) throw new Error(`Actul ${interpretare.act_id} nu există.`);
  return { interpretare, act: act as ActBrut };
}

/** Aprobarea propriu-zisă, cu dependințele date. `aprobaInterpretare` o apelează cu cele reale. */
export async function aprobaCu(dep: Dependinte, id: number, { schimbari, revizor, azi, completari }: OptiuniAprobare): Promise<RezultatAprobare> {
  const { interpretare, act } = await incarca(dep, id);
  if (interpretare.stare !== "propus") throw new Error(`Interpretarea ${id} e deja „${interpretare.stare}”.`);
  const rezultat = interpretare.rezultat as InterpretareAct;
  const alese = schimbari ?? rezultat.schimbari.map((_, i) => i);
  if (!alese.length) throw new Error("Nu e nicio schimbare de aprobat.");
  for (const i of alese) if (!Number.isInteger(i) || i < 0 || i >= rezultat.schimbari.length) throw new Error(`Schimbarea ${i} nu există în interpretarea ${id}.`);
  if (new Set(alese).size !== alese.length) throw new Error("Aceeași schimbare e aleasă de două ori.");

  // completările se aplică pe o copie: rezultatul stocat nu se rescrie
  const completate = structuredClone(rezultat);
  const note: string[] = [];
  for (const i of alese) {
    const f = completate.schimbari[i].formula_tip;
    const c = completari?.[i];
    if (c && f?.tip === "schimbare_cota" && f.parametri.cota_veche == null) {
      const sursa = c.sursa_veche?.trim();
      if (!Number.isFinite(c.cota_veche) || !sursa) throw new Error(`Schimbarea ${i}: cota veche și sursa trebuie completate amândouă.`);
      f.parametri.cota_veche = c.cota_veche;
      f.parametri.sursa_veche = sursa;
      note.push(`${i}: ${c.cota_veche}% (${sursa})`);
    }
    if (f && !formulaCompleta(f)) throw new Error(`Schimbarea ${i}: cota veche lipsește; completează cota veche și sursa înainte de aprobare.`);
  }

  const dataVerificarii = azi ?? dep.acum().toISOString().slice(0, 10);
  const textCatalog = await dep.citeste("catalog");
  const textGhid = await dep.citeste("ghid");
  const catalog = valideazaCatalog(JSON.parse(textCatalog));
  const ghid = valideazaGhid(JSON.parse(textGhid), catalog);

  const ids = new Set(catalog.map((s) => s.id));
  const noi: Schimbare[] = [];
  const noiGhid: IntrareGhid[] = [];
  for (const i of alese) {
    const s = spreSchimbare(completate, i, act, { verificat_la: dataVerificarii, existente: ids });
    ids.add(s.id);
    noi.push(s);
    noiGhid.push(spreGhid(s, completate, i));
  }
  const catalogNou = valideazaCatalog([...catalog, ...noi]);
  const ghidNou = valideazaGhid([...ghid, ...noiGhid], catalogNou);

  // fișierele sunt sursa de adevăr; baza se aliniază după ele
  await dep.scrie("catalog", adaugaIntrari(textCatalog, noi));
  await dep.scrie("ghid", adaugaIntrari(textGhid, noiGhid));

  let avertisment: string | undefined;
  const randuri = (tot: { id: string }[], nou: { id: string }[]) => nou.map((x) => ({ id: x.id, ordine: tot.findIndex((y) => y.id === x.id), date: x }));
  for (const [tabel, tot, nou] of [
    ["schimbari", catalogNou, noi],
    ["ghid", ghidNou, noiGhid],
  ] as const) {
    const { error } = await dep.client.from(tabel).upsert(randuri(tot, nou), { onConflict: "id" });
    if (error) {
      if (!esteTabelaLipsa(error)) throw new Error(`${tabel}: ${explicaEroarea(error)}`);
      avertisment = `Fișierele data/catalog.json și data/ghid.json sunt scrise, dar tabelul „${tabel}” nu există încă în Supabase; rândurile se adaugă după migrare.`;
      break;
    }
  }

  const schimbareIds = noi.map((s) => s.id);
  const acum = dep.acum().toISOString();
  const { error: e1 } = await dep.client
    .from("interpretari")
    .update({ stare: "aprobat", schimbare_ids: schimbareIds, nota_revizor: note.length ? `${revizor}; cota veche completată: ${note.join("; ")}` : revizor, decis_la: acum })
    .eq("id", id);
  if (e1) throw new Error(`interpretari: ${explicaEroarea(e1)}`);
  const { error: e2 } = await dep.client.from("acte").update({ stare_procesare: "aprobat" }).eq("id", act.id);
  if (e2) throw new Error(`acte: ${explicaEroarea(e2)}`);

  return avertisment ? { schimbareIds, avertisment } : { schimbareIds };
}

export async function respingeCu(dep: Dependinte, id: number, { nota, revizor }: { nota: string; revizor: string }): Promise<void> {
  const { interpretare, act } = await incarca(dep, id);
  if (interpretare.stare !== "propus") throw new Error(`Interpretarea ${id} e deja „${interpretare.stare}”.`);
  const { error: e1 } = await dep.client
    .from("interpretari")
    .update({ stare: "respins", nota_revizor: nota ? `${nota} (${revizor})` : revizor, decis_la: dep.acum().toISOString() })
    .eq("id", id);
  if (e1) throw new Error(`interpretari: ${explicaEroarea(e1)}`);
  const { error: e2 } = await dep.client.from("acte").update({ stare_procesare: "respins" }).eq("id", act.id);
  if (e2) throw new Error(`acte: ${explicaEroarea(e2)}`);
}

export async function aprobaInterpretare(id: number, optiuni: OptiuniAprobare): Promise<RezultatAprobare> {
  return aprobaCu(dependinteReale(), id, optiuni);
}

export async function respingeInterpretare(id: number, optiuni: { nota: string; revizor: string }): Promise<void> {
  return respingeCu(dependinteReale(), id, optiuni);
}
