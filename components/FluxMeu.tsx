"use client";

import Link from "next/link";
import { useLimba } from "@/components/Limba";
import { ListaFlux } from "@/components/ListaFlux";
import { useProfil } from "@/components/useProfil";
import type { Sortare } from "@/lib/card";
import { CATALOG } from "@/lib/catalog";
import { etichetaTagL } from "@/lib/i18n";
import { aziISO, potriveste } from "@/lib/potrivire";

/** Fluxul pe profilul real. Profilul stă în localStorage, deci potrivirea rulează aici, pe dispozitiv. */
export function FluxMeu({ sortare }: { sortare: Sortare }) {
  const profil = useProfil();
  const { t, limba } = useLimba();

  if (profil === null) return <p className="mt-4 text-sm text-v3-ink-2">{t("Se încarcă profilul de pe dispozitiv…")}</p>;

  if (profil.taguri.length === 0) {
    return (
      <section className="mt-5 rounded-[10px] border border-v3-line bg-white p-5">
        <h2 className="m-0 text-[17px] font-bold text-v3-ink">{t("Profilul tău e gol")}</h2>
        <p className="mt-1 mb-4 text-[15px] text-v3-ink-2">
          {t("Încarcă un contract, un fluturaș sau o factură și profilul se completează singur. Rămâne pe dispozitivul tău.")}
        </p>
        <Link href="/profil" className="inline-flex min-h-11 items-center rounded-[10px] bg-v3-ink px-[18px] font-bold text-white no-underline">
          {t("Completează profilul")}
        </Link>
        <p className="mt-4 mb-0 text-[13px] text-v3-ink-2">
          {t("Sau vezi un exemplu:")} <Link href="/flux?p=andrei">Andrei, 32</Link> · <Link href="/flux?p=maria">Maria, 45</Link> ·{" "}
          <Link href="/flux?p=ion">Ion, 67</Link> · <Link href="/flux?p=ioana">Ioana, 23</Link> · <Link href="/flux?p=elena">Elena, 24</Link>
        </p>
      </section>
    );
  }

  const potriviri = potriveste(profil, CATALOG, aziISO());
  return (
    <>
      <p className="mt-1 mb-0 text-sm text-v3-ink-2">
        {t("Profilul tău:")} {profil.taguri.map((x) => etichetaTagL(limba, x)).join(", ")} ·{" "}
        <Link href="/profil" className="text-v3-ink underline decoration-v3-line underline-offset-2">
          {t("modifică")}
        </Link>
      </p>
      <ListaFlux
        potriviri={potriviri}
        valori={profil.valori}
        sortare={sortare}
        baza="/flux"
        azi={aziISO()}
        profil={profil}
        pastrare={{ tip: "profil" }}
      />
    </>
  );
}
