"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CATALOG } from "@/lib/catalog";
import { CAMPURI_VALORI, incarcaProfil, PROFIL_GOL, salveazaProfil, stergeProfil, type CampValoare, type Profil } from "@/lib/profil";
import { aziISO, potriveste } from "@/lib/potrivire";
import { etichetaTag, FAMILII, tagurileFamiliei, type Familie, type TagId } from "@/lib/taguri";

/**
 * Formularul de profil (alternativa la asistentul conversațional din docs/produs.md).
 * Etichete pe familii, apoi cifrele de care au nevoie formulele. Totul rămâne în localStorage.
 */
export function FormularProfil() {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [salvat, setSalvat] = useState(false);

  useEffect(() => setProfil(incarcaProfil()), []);

  const nrActe = useMemo(() => (profil ? potriveste(profil, CATALOG, aziISO()).length : 0), [profil]);

  if (profil === null) return <p className="text-sm text-v3-ink-2">Se încarcă profilul de pe dispozitiv…</p>;

  function comuta(tag: TagId) {
    const are = profil!.taguri.includes(tag);
    setProfil({ ...profil!, taguri: are ? profil!.taguri.filter((t) => t !== tag) : [...profil!.taguri, tag] });
    setSalvat(false);
  }

  function schimbaValoare(camp: CampValoare, text: string) {
    const valori = { ...profil!.valori };
    const n = Number(text.replace(/\s/g, "").replace(",", "."));
    if (text.trim() === "" || !Number.isFinite(n)) delete valori[camp];
    else valori[camp] = n;
    setProfil({ ...profil!, valori });
    setSalvat(false);
  }

  function salveaza() {
    salveazaProfil(profil!);
    setSalvat(true);
  }

  function sterge() {
    stergeProfil();
    setProfil(PROFIL_GOL);
    setSalvat(false);
  }

  return (
    <div className="space-y-6">
      {(Object.keys(FAMILII) as Familie[]).map((f) => (
        <fieldset key={f} className="m-0 border-0 p-0">
          <legend className="mb-2 text-[13px] font-extrabold tracking-[.08em] text-v3-ink uppercase">{FAMILII[f]}</legend>
          <div className="flex flex-wrap gap-2">
            {tagurileFamiliei(f).map((t) => {
              const ales = profil.taguri.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={ales}
                  onClick={() => comuta(t)}
                  className={`min-h-10 rounded-lg border px-3 text-sm font-semibold ${
                    ales ? "border-v3-ink bg-v3-ink text-white" : "border-v3-line bg-white text-v3-ink"
                  }`}
                >
                  {etichetaTag(t)}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-1 text-[13px] font-extrabold tracking-[.08em] text-v3-ink uppercase">Cifrele tale</legend>
        <p className="mt-0 mb-3 text-[13.5px] text-v3-ink-2">
          Doar ce vrei să ne spui. Fără ele arătăm actul, dar nu și suma; cu ele calculăm lei pe lună.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(CAMPURI_VALORI) as CampValoare[]).map((c) => (
            <label key={c} className="block text-sm">
              <span className="block font-semibold text-v3-ink">{CAMPURI_VALORI[c].eticheta}</span>
              <span className="mt-1 flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  value={profil.valori[c] ?? ""}
                  onChange={(e) => schimbaValoare(c, e.target.value)}
                  className="min-h-11 w-full rounded-[10px] border border-v3-line bg-white px-3 tabular-nums"
                />
                {CAMPURI_VALORI[c].unitate && <span className="text-v3-ink-2">{CAMPURI_VALORI[c].unitate}</span>}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-v3-line bg-[var(--fundal)] px-4 py-3">
        <button type="button" onClick={salveaza} className="min-h-11 rounded-[10px] bg-v3-ink px-[18px] font-bold text-white">
          Salvează profilul
        </button>
        <span className="text-sm text-v3-ink-2">
          {profil.taguri.length} etichete · {nrActe} acte te privesc
        </span>
        {salvat && (
          <Link href="/flux" className="text-sm font-semibold text-v3-pos">
            Salvat. Vezi fluxul tău →
          </Link>
        )}
        <button type="button" onClick={sterge} className="ml-auto min-h-11 text-sm text-v3-ink-2 underline underline-offset-2">
          Șterge profilul
        </button>
      </div>
    </div>
  );
}
