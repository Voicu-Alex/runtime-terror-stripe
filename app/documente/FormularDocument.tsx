"use client";

import { useEffect, useMemo, useState } from "react";
import type { AnalizaDocument, TipDocument } from "@/lib/analiza-document";
import { MARIME_MAXIMA, TIPURI_FISIER_ACCEPTATE } from "@/lib/analiza-document";
import { adaugaInProfil, CAMPURI_VALORI, incarcaProfil, PROFIL_GOL, salveazaProfil, type CampValoare, type Profil, type Valori } from "@/lib/profil";
import { etichetaTag, FAMILII, TAGURI, type TagId } from "@/lib/taguri";

const NUME_TIP: Record<TipDocument, string> = {
  contract_munca: "contract de muncă",
  factura_utilitati: "factură de utilități",
  fluturas_salariu: "fluturaș de salariu",
  altul: "alt document",
};

/** valori citite din document care nu intră în profil, dar le arătăm */
const ETICHETE_ALTELE: Record<string, string> = {
  furnizor: "furnizor",
  suma_factura: "total factură",
  chirie_lunara: "chiria pe lună",
};

type Stare =
  | { pas: "alegere" }
  | { pas: "analiza" }
  | { pas: "confirmare"; analiza: AnalizaDocument }
  | { pas: "gata"; adaugate: TagId[] }
  | { pas: "eroare"; mesaj: string };

export function FormularDocument() {
  const [stare, setStare] = useState<Stare>({ pas: "alegere" });
  const [profil, setProfil] = useState<Profil>(PROFIL_GOL);

  useEffect(() => setProfil(incarcaProfil()), []);

  async function trimite(fisier: File) {
    if (!TIPURI_FISIER_ACCEPTATE.includes(fisier.type as (typeof TIPURI_FISIER_ACCEPTATE)[number])) {
      setStare({ pas: "eroare", mesaj: "Acceptăm doar PDF, JPG sau PNG." });
      return;
    }
    if (fisier.size > MARIME_MAXIMA) {
      setStare({ pas: "eroare", mesaj: "Fișierul are peste 10 MB." });
      return;
    }
    setStare({ pas: "analiza" });
    const form = new FormData();
    form.append("fisier", fisier);
    try {
      const r = await fetch("/api/analiza-document", { method: "POST", body: form });
      const json = await r.json();
      if (!r.ok) throw new Error(json.eroare ?? `Eroare ${r.status}`);
      setStare({ pas: "confirmare", analiza: json as AnalizaDocument });
    } catch (e) {
      setStare({ pas: "eroare", mesaj: e instanceof Error ? e.message : "Eroare la analiză." });
    }
  }

  function confirma(taguri: TagId[], valori: Valori) {
    const nou = adaugaInProfil(profil, taguri, valori);
    salveazaProfil(nou);
    setProfil(nou);
    setStare({ pas: "gata", adaugate: taguri });
  }

  return (
    <div className="space-y-5">
      {stare.pas === "alegere" || stare.pas === "eroare" ? (
        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-stone-300 bg-white p-8 text-center hover:border-indigo-400">
          <span className="block font-medium">Alege un PDF, JPG sau PNG</span>
          <span className="mt-1 block text-sm text-stone-500">maximum 10 MB</span>
          <input
            type="file"
            accept=".pdf,image/jpeg,image/png"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void trimite(f);
            }}
          />
        </label>
      ) : null}

      {stare.pas === "eroare" ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {stare.mesaj}
        </p>
      ) : null}

      {stare.pas === "analiza" ? (
        <p className="rounded-lg border border-stone-200 bg-white p-4 text-sm" aria-live="polite">
          Claude citește documentul…
        </p>
      ) : null}

      {stare.pas === "confirmare" ? (
        <Confirmare analiza={stare.analiza} onConfirma={confirma} onRenunta={() => setStare({ pas: "alegere" })} />
      ) : null}

      {stare.pas === "gata" ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <p className="font-semibold">Adăugat în profil: {stare.adaugate.map(etichetaTag).join(", ") || "nicio etichetă nouă"}</p>
          <button type="button" className="mt-2 underline" onClick={() => setStare({ pas: "alegere" })}>
            Încarcă alt document
          </button>
        </div>
      ) : null}

      <ProfilCurent profil={profil} />
    </div>
  );
}

function Confirmare({
  analiza,
  onConfirma,
  onRenunta,
}: {
  analiza: AnalizaDocument;
  onConfirma: (taguri: TagId[], valori: Valori) => void;
  onRenunta: () => void;
}) {
  // Bifate implicit doar etichetele cu încredere peste 0,5; restul le bifează omul.
  const [bifate, setBifate] = useState<Set<TagId>>(() => new Set(analiza.etichete_propuse.filter((e) => e.incredere >= 0.5).map((e) => e.tag)));
  const [valori, setValori] = useState<Valori>(() => {
    const v: Valori = {};
    for (const k of Object.keys(CAMPURI_VALORI) as CampValoare[]) {
      const x = analiza.valori[k];
      if (typeof x === "number") v[k] = x;
    }
    return v;
  });

  const altele = useMemo(
    () => Object.entries(analiza.valori).filter(([k]) => !(k in CAMPURI_VALORI)) as [string, string | number][],
    [analiza.valori],
  );

  function comuta(tag: TagId) {
    setBifate((s) => {
      const n = new Set(s);
      if (n.has(tag)) n.delete(tag);
      else n.add(tag);
      return n;
    });
  }

  return (
    <section className="space-y-4 rounded-xl border border-stone-200 bg-white p-4" aria-labelledby="titlu-confirmare">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="titlu-confirmare" className="font-semibold">
            Am citit: {NUME_TIP[analiza.tip_document] ?? "document"}
          </h2>
          <p className="mt-1 text-sm text-stone-600">{analiza.explicatie_scurta}</p>
        </div>
        <span className="flex shrink-0 flex-col items-end gap-1 text-xs">
          <span className="rounded-full border border-stone-300 px-2 py-0.5 text-stone-600">Analiză generată cu AI, verifică etichetele</span>
          {analiza.mod === "demo" ? (
            <span className="rounded-full border border-amber-400 bg-amber-50 px-2 py-0.5 text-amber-800" title="Răspuns pregătit, fără apel la model. Pune ANTHROPIC_API_KEY în .env.local pentru analiză reală.">
              Mod demo
            </span>
          ) : null}
        </span>
      </div>

      <div>
        <h3 className="text-sm font-medium">Etichete propuse</h3>
        {analiza.etichete_propuse.length === 0 ? (
          <p className="mt-1 text-sm text-stone-500">Nicio etichetă sigură în acest document.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {analiza.etichete_propuse.map((e) => {
              const on = bifate.has(e.tag);
              return (
                <li key={e.tag}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => comuta(e.tag)}
                    title={e.motiv}
                    className={`rounded-full border px-3 py-1.5 text-sm ${
                      on ? "border-indigo-600 bg-indigo-600 text-white" : "border-stone-300 bg-white text-stone-700"
                    }`}
                  >
                    {etichetaTag(e.tag)}
                    <span className="ml-1 text-xs opacity-70">
                      {FAMILII[TAGURI[e.tag].familie]} · {Math.round(e.incredere * 100)}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {Object.keys(valori).length > 0 || altele.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium">Valori citite</h3>
          <dl className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(Object.keys(valori) as CampValoare[]).map((k) => (
              <div key={k} className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm">
                <dt className="text-stone-600">{CAMPURI_VALORI[k].eticheta}</dt>
                <dd className="flex items-center gap-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    aria-label={CAMPURI_VALORI[k].eticheta}
                    value={valori[k] ?? ""}
                    onChange={(ev) => {
                      const n = ev.target.valueAsNumber;
                      setValori((v) => ({ ...v, [k]: Number.isFinite(n) ? n : undefined }));
                    }}
                    className="w-28 rounded border border-stone-300 px-2 py-1 text-right"
                  />
                  <span className="text-stone-500">{CAMPURI_VALORI[k].unitate}</span>
                </dd>
              </div>
            ))}
            {altele.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm">
                <dt className="text-stone-600">{ETICHETE_ALTELE[k] ?? k}</dt>
                <dd>{typeof v === "number" ? `${v} lei` : v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-1 text-xs text-stone-500">Furnizorul și totalul facturii nu intră în profil; le folosim mai târziu pentru acțiunile one-click.</p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onConfirma([...bifate], valori)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Adaugă în profil ({bifate.size})
        </button>
        <button type="button" onClick={onRenunta} className="rounded-lg border border-stone-300 px-4 py-2 text-sm">
          Renunță
        </button>
      </div>
    </section>
  );
}

function ProfilCurent({ profil }: { profil: Profil }) {
  if (profil.taguri.length === 0 && Object.keys(profil.valori).length === 0) return null;
  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 text-sm">
      <h2 className="font-semibold">Profilul tău (doar pe acest dispozitiv)</h2>
      <ul className="mt-2 flex flex-wrap gap-2">
        {profil.taguri.map((t) => (
          <li key={t} className="rounded-full bg-stone-100 px-3 py-1">
            {etichetaTag(t)}
          </li>
        ))}
      </ul>
      {Object.keys(profil.valori).length > 0 ? (
        <p className="mt-2 text-stone-600">
          {(Object.entries(profil.valori) as [CampValoare, number][])
            .map(([k, v]) => `${CAMPURI_VALORI[k].eticheta}: ${v} ${CAMPURI_VALORI[k].unitate}`.trim())
            .join(" · ")}
        </p>
      ) : null}
    </section>
  );
}
