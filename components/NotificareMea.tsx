"use client";

import Link from "next/link";
import { useLimba } from "@/components/Limba";
import { Notificare } from "@/components/Notificare";
import { useProfil } from "@/components/useProfil";
import { CATALOG } from "@/lib/catalog";
import { alegeNotificarea } from "@/lib/plan";
import { aziISO, potriveste } from "@/lib/potrivire";

/** Notificarea pe profilul real, aleasă pe dispozitiv. */
export function NotificareMea() {
  const profil = useProfil();
  const { t } = useLimba();
  if (profil === null) return <p className="mt-4 text-sm text-v3-ink-2">{t("Se încarcă profilul de pe dispozitiv…")}</p>;

  const potriviri = potriveste(profil, CATALOG, aziISO());
  const aleasa = alegeNotificarea(potriviri, profil.valori);
  if (!aleasa) {
    return (
      <p className="mt-4 text-[15px] text-v3-ink-2">
        {profil.taguri.length === 0 ? (
          <>
            {t("Nu avem ce să îți spunem până nu știm cine ești.")}{" "}
            <Link href="/profil" className="font-semibold text-v3-ink underline decoration-v3-line underline-offset-2">
              {t("Completează profilul")}
            </Link>
            .
          </>
        ) : (
          t("Niciun act din catalog nu te privește deocamdată. Te anunțăm când apare unul.")
        )}
      </p>
    );
  }
  return (
    <>
      <p className="mt-1 mb-4 text-sm text-v3-ink-2">
        {potriviri.length} {t("acte te privesc; ăsta e cel cu termenul cel mai aproape sau cu suma cea mai mare.")}
      </p>
      <Notificare p={aleasa} valori={profil.valori} baza="/flux" />
    </>
  );
}
