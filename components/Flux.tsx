"use client";

import { useEffect, useMemo, useState } from "react";
import CardSchimbare from "@/components/CardSchimbare";
import { CATALOG } from "@/lib/catalog";
import { dupaImpact } from "@/lib/card";
import { PERSOANE_DEMO, type PersoanaDemo } from "@/lib/persoane-demo";
import { potriveste } from "@/lib/potrivire";
import type { CampValoare, Valori } from "@/lib/profil";

// Data demo-ului: fluxul se vede ca pe 28 oct 2026.
const AZI_DEMO = "2026-10-28";

/**
 * Fluxul unei persoane demo. Valorile pe care omul le dă pe un card („spune-ne salariul brut”)
 * se adaugă peste profilul demo, se recalculează toate cardurile și se păstrează doar în acest browser
 * (localStorage, pe cheie separată pentru fiecare persoană demo, ca să nu atingă profilul real din lib/profil.ts).
 */
export default function Flux({ id }: { id: PersoanaDemo }) {
  const persoana = PERSOANE_DEMO[id];
  const cheie = `cipm.demo.${id}.valori`;
  const [extra, setExtra] = useState<Valori>({});

  useEffect(() => {
    try {
      const brut = window.localStorage.getItem(cheie);
      setExtra(brut ? (JSON.parse(brut) as Valori) : {});
    } catch {
      setExtra({});
    }
  }, [cheie]);

  const valori: Valori = useMemo(() => ({ ...persoana.profil.valori, ...extra }), [persoana, extra]);
  const flux = useMemo(
    () => potriveste({ taguri: persoana.profil.taguri, valori }, CATALOG, AZI_DEMO).sort(dupaImpact),
    [persoana, valori],
  );

  function seteaza(camp: CampValoare, valoare: number) {
    const urm = { ...extra, [camp]: valoare };
    setExtra(urm);
    try {
      window.localStorage.setItem(cheie, JSON.stringify(urm));
    } catch {
      // storage blocat: valoarea rămâne doar până la reîncărcare
    }
  }

  function sterge() {
    setExtra({});
    try {
      window.localStorage.removeItem(cheie);
    } catch {}
  }

  return (
    <div>
      <h1 className="m-0 font-head text-2xl font-extrabold tracking-[-.015em] text-v3-ink">Fluxul meu</h1>
      <p className="mt-1 mb-0 text-sm text-v3-ink-2">
        Profil demo: <b className="text-v3-ink">{persoana.nume}</b> · {flux.length} acte care te privesc
        {Object.keys(extra).length > 0 && (
          <>
            {" · "}
            <button type="button" onClick={sterge} className="font-semibold text-v3-accent underline">
              șterge valorile introduse
            </button>
          </>
        )}
      </p>
      <h2 className="mt-5 mb-0 border-b-2 border-v3-ink pb-2 text-[13px] font-extrabold tracking-[.08em] text-v3-ink uppercase">
        Toate actele care te privesc <small className="text-[13px] font-semibold tracking-normal text-v3-ink-2 normal-case">după impact</small>
      </h2>
      <ul className="m-0 list-none p-0">
        {flux.map((x) => (
          <CardSchimbare key={x.schimbare.id} p={x} valori={valori} onValoare={seteaza} />
        ))}
      </ul>
    </div>
  );
}
