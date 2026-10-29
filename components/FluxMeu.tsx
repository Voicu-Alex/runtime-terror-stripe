"use client";

import Link from "next/link";
import { useLimba } from "@/components/Limba";
import { ListaFlux } from "@/components/ListaFlux";
import { useAbonament } from "@/components/useAbonament";
import { useProfil } from "@/components/useProfil";
import type { Sortare } from "@/lib/card";
import { CATALOG } from "@/lib/catalog";
import { etichetaTagL } from "@/lib/i18n";
import { PRET_BANI } from "@/lib/abonament";
import { aziISO, potriveste } from "@/lib/potrivire";

/**
 * Fluxul pe profilul real. Profilul stă în localStorage, deci potrivirea rulează aici, pe dispozitiv.
 * Fără Pro (verificat la Stripe), fluxul se vede estompat, cu „Upgrade la Pro” deasupra; până la răspuns, tot estompat.
 */
export function FluxMeu({ sortare }: { sortare: Sortare }) {
  const profil = useProfil();
  const stare = useAbonament();
  const { t, limba } = useLimba();

  if (profil === null) return <p className="mt-4 text-sm text-v3-ink-2">{t("Se încarcă profilul de pe dispozitiv…")}</p>;

  if (profil.taguri.length === 0) {
    return (
      <section className="mt-5 rounded-[10px] border border-v3-line bg-v3-card p-5">
        <h2 className="m-0 text-[17px] font-bold text-v3-ink">{t("Profilul tău e gol")}</h2>
        <p className="mt-1 mb-4 text-[15px] text-v3-ink-2">
          {t("Completează profilul manual sau încarcă un document pentru analiză cu AI.")}
        </p>
        <Link href="/profil" className="inline-flex min-h-11 items-center rounded-[10px] bg-v3-ink px-[18px] font-bold text-v3-on-ink no-underline">
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
  const blocat = !stare?.activ;
  return (
    <>
      <p className="mt-1 mb-0 text-sm text-v3-ink-2">
        {t("Profilul tău:")} {profil.taguri.map((x) => etichetaTagL(limba, x)).join(", ")} ·{" "}
        <Link href="/profil" className="text-v3-ink underline decoration-v3-line underline-offset-2">
          {t("modifică")}
        </Link>
      </p>
      <div className="relative">
        {/* inert: conținutul estompat nu se poate citi cu tastatura sau cititorul de ecran, doar vedea ca formă */}
        <div inert={blocat} aria-hidden={blocat} className={blocat ? "pointer-events-none max-h-[1400px] overflow-hidden blur-[6px] select-none" : ""}>
          <ListaFlux
            potriviri={potriviri}
            valori={profil.valori}
            sortare={sortare}
            baza="/flux"
            azi={aziISO()}
            profil={profil}
            pastrare={{ tip: "profil" }}
          />
        </div>
        {blocat && stare !== null && <Peste nr={potriviri.length} conectat={stare.conectat} />}
      </div>
    </>
  );
}

/** Panoul de deasupra fluxului estompat: rămâne vizibil cât derulezi. */
function Peste({ nr, conectat }: { nr: number; conectat: boolean }) {
  const { t } = useLimba();
  return (
    <div className="absolute inset-0 flex justify-center bg-linear-to-b from-transparent via-[var(--fundal)]/40 to-[var(--fundal)] px-2 pt-16">
      <section
        aria-labelledby="pro-titlu"
        className="sticky top-[70px] h-fit w-full max-w-[460px] rounded-2xl border border-v3-line bg-v3-card p-6 text-center shadow-[0_24px_60px_-24px_rgba(17,24,39,.45)]"
      >
        <span className="inline-flex size-11 items-center justify-center rounded-full bg-v3-accent-soft text-v3-ink">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2" strokeLinecap="round">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <h2 id="pro-titlu" className="m-0 mt-3 font-head text-[24px] leading-[1.2] font-extrabold text-v3-ink">
          {nr} {t("legi te privesc. Vezi cât te costă fiecare.")}
        </h2>
        <p className="m-0 mt-2 text-[15px] text-v3-ink-2">
          {t("Cu Pro vezi suma pe profilul tău, termenele, ce poți face și Planul meu.")}
        </p>
        <Link
          href="/abonament"
          className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[12px] bg-v3-ink px-6 text-[16px] font-bold text-v3-on-ink no-underline hover:bg-v3-ink-strong"
        >
          {t("Upgrade la Pro")} · {PRET_BANI / 100} {t("lei/lună")}
        </Link>
        <p className="m-0 mt-3 text-[13px] text-v3-ink-2">
          {conectat ? t("Anulezi oricând.") : t("Te conectezi cu Google, apoi plătești prin Stripe. Anulezi oricând.")}
        </p>
      </section>
    </div>
  );
}
