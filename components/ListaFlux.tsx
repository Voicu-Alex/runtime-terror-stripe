"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CardSchimbare from "@/components/CardSchimbare";
import { useLimba } from "@/components/Limba";
import { useAprobate } from "@/components/useAprobate";
import { ArticolPrincipal, Cifre, Termene, TitluSectiune, evenimente } from "@/components/RevistaFlux";
import { bani, cuSemn, dupaImpact, dupaNoutate, mii, type Sortare } from "@/lib/card";
import { alegeNotificarea, incarcaPlan, salveazaPlan } from "@/lib/plan";
import { CATALOG } from "@/lib/catalog";
import { planulMeu, potriveste, type Potrivire } from "@/lib/potrivire";
import { adaugaInProfil, salveazaProfil, type CampValoare, type Profil, type Valori } from "@/lib/profil";

/**
 * Lista „Toate actele care te privesc”, cu sortarea și „Planul meu”: acțiunile bifate
 * se adună în bara de jos. O folosesc și profilul real, și persoanele demo.
 * Deasupra: articolul principal (alegeNotificarea: termenul cel mai apropiat sau cei mai mulți bani), cifrele și termenele (mockup/v3?v=f).
 */
export function ListaFlux({
  potriviri: potriviriDate,
  valori: valoriDate,
  sortare,
  baza,
  azi,
  profil,
  pastrare,
}: {
  potriviri: Potrivire[];
  valori: Valori;
  sortare: Sortare;
  baza: string;
  azi: string;
  /** cu profilul, un card poate cere o valoare lipsă („spune-ne X”) și lista se recalculează aici */
  profil?: Profil;
  /** unde păstrăm valoarea dată: în profilul real sau pe o cheie separată pentru o persoană demo */
  pastrare?: { tip: "profil" } | { tip: "demo"; cheie: string };
}) {
  const { t, limba } = useLimba();
  const [bifate, setBifate] = useState<Set<string>>(new Set());
  useEffect(() => setBifate(incarcaPlan()), []);

  // Valorile date pe carduri, peste profil. Pentru persoanele demo stau pe cheia lor (nu ating profilul real).
  const [extra, setExtra] = useState<Valori>({});
  const cheieDemo = pastrare?.tip === "demo" ? pastrare.cheie : null;
  useEffect(() => {
    if (!cheieDemo) return;
    try {
      const brut = window.localStorage.getItem(cheieDemo);
      setExtra(brut ? (JSON.parse(brut) as Valori) : {});
    } catch {
      setExtra({});
    }
  }, [cheieDemo]);

  const cuExtra = profil && Object.keys(extra).length > 0;
  const valori: Valori = cuExtra ? { ...valoriDate, ...extra } : valoriDate;
  const potriviri = useMemo(
    () => (cuExtra ? potriveste({ ...profil, valori: { ...profil.valori, ...extra } }, CATALOG, azi) : potriviriDate),
    [cuExtra, profil, extra, azi, potriviriDate],
  );
  // Actele aprobate acum în /admin (alt tab): apar sus, separat, până intră în catalog.
  const aprobate = useAprobate();
  const noi = useMemo(
    () => (profil && aprobate.length ? potriveste({ ...profil, valori: { ...profil.valori, ...extra } }, aprobate, azi) : []),
    [profil, aprobate, extra, azi],
  );

  function seteazaValoare(camp: CampValoare, valoare: number) {
    const urm = { ...extra, [camp]: valoare };
    setExtra(urm);
    try {
      if (pastrare?.tip === "demo") window.localStorage.setItem(pastrare.cheie, JSON.stringify(urm));
      else if (pastrare?.tip === "profil" && profil) salveazaProfil(adaugaInProfil(profil, [], { [camp]: valoare }));
    } catch {
      // storage blocat: valoarea rămâne până la reîncărcare
    }
  }

  function comuta(id: string) {
    const nou = new Set(bifate);
    if (nou.has(id)) nou.delete(id);
    else nou.add(id);
    setBifate(nou);
    salveazaPlan(nou);
  }

  const flux = [...potriviri].sort(sortare === "noi" ? dupaNoutate : dupaImpact);
  const plan = planulMeu(potriviri, bifate, valori, azi);
  const cuEconomie = potriviri.some((p) => p.schimbare.actiuni.some((a) => a.formula_economie));
  const sep = baza.includes("?") ? "&" : "?";
  const optiune = (s: Sortare, text: string) =>
    s === sortare ? (
      <b className="inline-flex min-h-11 items-center text-v3-ink" aria-current="true">
        {text}
      </b>
    ) : (
      <Link href={`${baza}${sep}sort=${s}`} className="inline-flex min-h-11 items-center text-v3-ink-2 underline decoration-v3-line underline-offset-2 hover:text-v3-ink">
        {text}
      </Link>
    );

  const ev = evenimente(potriviri, valori, azi, limba);

  return (
    <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_270px] lg:gap-7">
      <div className="min-w-0">
        {noi.length > 0 && (
          <section aria-label={t("Nou în Monitorul Oficial")} className="mb-6 rounded-2xl border-2 border-v3-pos/40 bg-v3-pos-soft/40 px-4 pt-3">
            <p className="m-0 flex items-center gap-2 text-[12px] font-extrabold tracking-[.1em] text-v3-pos uppercase">
              <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-v3-pos" />
              {t("Nou în Monitorul Oficial")} · {t("verificat de un om azi")}
            </p>
            <ul className="m-0 list-none p-0">
              {noi.map((x) => (
                <CardSchimbare
                  key={x.schimbare.id}
                  p={x}
                  valori={valori}
                  bifata={bifate.has(x.schimbare.id)}
                  onBifeaza={() => comuta(x.schimbare.id)}
                  onValoare={profil && pastrare ? seteazaValoare : undefined}
                />
              ))}
            </ul>
          </section>
        )}
        <ArticolPrincipal p={alegeNotificarea(potriviri, valori)} valori={valori} azi={azi} />
        <Cifre potriviri={potriviri} valori={valori} ev={ev} azi={azi} />
        <div className="lg:hidden">
          <TitluSectiune>{t("Termene · ce urmează")}</TitluSectiune>
          <Termene ev={ev} />
        </div>
        <TitluSectiune>
          {t("Toate actele care te privesc")}
          <small className="text-[13px] font-semibold tracking-normal normal-case">
            {optiune("impact", t("după impact"))} <span className="text-v3-ink-2">·</span> {optiune("noi", t("cele mai noi"))}
          </small>
        </TitluSectiune>
        {flux.length === 0 ? (
          <p className="mt-4 text-[15px] text-v3-ink-2">{t("Niciun act din catalog nu se potrivește cu etichetele tale deocamdată.")}</p>
        ) : (
          <ul className="m-0 list-none p-0">
            {flux.map((x) => (
              <CardSchimbare
                key={x.schimbare.id}
                p={x}
                valori={valori}
                bifata={bifate.has(x.schimbare.id)}
                onBifeaza={() => comuta(x.schimbare.id)}
                onValoare={profil && pastrare ? seteazaValoare : undefined}
              />
            ))}
          </ul>
        )}

        {/* Planul meu: suma actelor cu impact calculabil, fără și cu acțiunile bifate (lib/potrivire.ts planulMeu). */}
        <aside
          aria-label={t("Planul meu")}
          className="bara-plan sticky bottom-0 z-10 -mx-4 mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t-2 border-v3-ink bg-v3-paper px-4 py-3"
        >
          <span className="text-[11.5px] font-extrabold tracking-[.1em] text-v3-accent uppercase">{t("Planul meu")}</span>
          <span className="text-[15px] text-v3-ink">
            {t("Acum:")}{" "}
            <b className={`font-num font-semibold tabular-nums ${plan.fara_actiuni < 0 ? "text-v3-neg" : plan.fara_actiuni > 0 ? "text-v3-pos" : ""}`}>
              {cuSemn(plan.fara_actiuni * 12)} {t("lei/an")}
            </b>
          </span>
          {plan.economii !== 0 || plan.economii_punctuale !== 0 ? (
            <span className="text-[15px] text-v3-ink">
              {t("Cu ce ai bifat:")}{" "}
              <b className={`font-num font-semibold tabular-nums ${plan.cu_actiuni < 0 ? "text-v3-neg" : "text-v3-pos"}`}>
                {cuSemn(plan.cu_actiuni * 12)} {t(plan.unitate)}
              </b>
              {plan.economii !== 0 && <span className="text-v3-ink-2">
                {" "}
                · {t("păstrezi")} {mii(plan.economii * 12)} {t(plan.unitate)}
              </span>}
              {plan.economii_punctuale !== 0 && <span className="text-v3-ink-2"> · +{bani(plan.economii_punctuale)} {t("lei o dată")}</span>}
            </span>
          ) : (
            <span className="text-[13.5px] text-v3-ink-2">
              {cuEconomie ? t("Adaugă o acțiune în plan pentru a vedea economia.") : t("Sumele din acțiuni se adună aici.")}
            </span>
          )}
          <span role="status" className="sr-only">{t("Planul meu")}: {cuSemn(plan.cu_actiuni * 12)} {t(plan.unitate)}{plan.economii_punctuale !== 0 && ` · +${bani(plan.economii_punctuale)} ${t("lei o dată")}`}</span>
        </aside>
      </div>
      <aside aria-label={t("Termene")} className="hidden border-l border-v3-line pl-5 lg:block">
        <p className="m-0 mb-2.5 text-[11.5px] font-extrabold tracking-[.12em] text-v3-accd uppercase">{t("Termene · ce urmează")}</p>
        <p className="m-0 mb-1 text-[13px] text-v3-ink-2">{t("Calculate față de azi, din datele din lege.")}</p>
        <Termene ev={ev} />
      </aside>
    </div>
  );
}
