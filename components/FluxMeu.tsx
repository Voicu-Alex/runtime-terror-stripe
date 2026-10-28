"use client";

import Link from "next/link";
import { ListaFlux } from "@/components/ListaFlux";
import type { Sortare } from "@/lib/card";
import { useProfil } from "@/components/useProfil";
import { CATALOG } from "@/lib/catalog";
import { aziISO, potriveste } from "@/lib/potrivire";
import { etichetaTag } from "@/lib/taguri";

/** Fluxul pe profilul real. Profilul stă în localStorage, deci potrivirea rulează aici, pe dispozitiv. */
export function FluxMeu({ sortare }: { sortare: Sortare }) {
  const profil = useProfil();

  if (profil === null) return <p className="mt-4 text-sm text-v3-ink-2">Se încarcă profilul de pe dispozitiv…</p>;

  if (profil.taguri.length === 0) {
    return (
      <section className="mt-5 rounded-[10px] border border-v3-line bg-white p-5">
        <h2 className="m-0 text-[17px] font-bold text-v3-ink">Profilul tău e gol</h2>
        <p className="mt-1 mb-4 text-[15px] text-v3-ink-2">
          Spune-ne în două minute cum câștigi și ce deții, sau încarcă un document și lasă-l pe Claude să propună etichetele.
          Profilul rămâne pe dispozitivul tău.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/profil" className="inline-flex min-h-11 items-center rounded-[10px] bg-v3-ink px-[18px] font-bold text-white no-underline">
            Completează profilul
          </Link>
          <Link href="/documente" className="inline-flex min-h-11 items-center rounded-[10px] border border-v3-line bg-white px-4 text-sm font-semibold text-v3-ink no-underline">
            Încarcă un document
          </Link>
        </div>
        <p className="mt-4 mb-0 text-[13px] text-v3-ink-2">
          Sau vezi un exemplu: <Link href="/flux?p=andrei">Andrei, 32</Link> · <Link href="/flux?p=maria">Maria, 45</Link> ·{" "}
          <Link href="/flux?p=ion">Ion, 67</Link>
        </p>
      </section>
    );
  }

  const potriviri = potriveste(profil, CATALOG, aziISO());
  return (
    <>
      <p className="mt-1 mb-0 text-sm text-v3-ink-2">
        Profilul tău: {profil.taguri.map(etichetaTag).join(", ")} · {potriviri.length} acte care te privesc ·{" "}
        <Link href="/profil" className="text-v3-ink underline decoration-v3-line underline-offset-2">
          modifică
        </Link>
      </p>
      <ListaFlux potriviri={potriviri} valori={profil.valori} sortare={sortare} baza="/flux" />
    </>
  );
}
