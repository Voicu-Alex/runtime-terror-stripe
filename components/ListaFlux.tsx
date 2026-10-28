"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CardSchimbare from "@/components/CardSchimbare";
import { useLimba } from "@/components/Limba";
import { ArticolPrincipal, Cifre, Termene, TitluSectiune, evenimente } from "@/components/RevistaFlux";
import { cuSemn, dupaImpact, dupaNoutate, mii, type Sortare } from "@/lib/card";
import { alegeNotificarea, incarcaPlan, salveazaPlan } from "@/lib/plan";
import { planulMeu, type Potrivire } from "@/lib/potrivire";
import type { Valori } from "@/lib/profil";

/**
 * Lista „Toate actele care te privesc”, cu sortarea și „Planul meu”: acțiunile bifate
 * se adună în bara de jos. O folosesc și profilul real, și persoanele demo.
 * Deasupra: articolul principal (același act ca notificarea), cifrele și termenele (mockup/v3?v=f).
 */
export function ListaFlux({
  potriviri,
  valori,
  sortare,
  baza,
  azi,
}: {
  potriviri: Potrivire[];
  valori: Valori;
  sortare: Sortare;
  baza: string;
  azi: string;
}) {
  const { t, limba } = useLimba();
  const [bifate, setBifate] = useState<Set<string>>(new Set());
  useEffect(() => setBifate(incarcaPlan()), []);

  function comuta(id: string) {
    const nou = new Set(bifate);
    if (nou.has(id)) nou.delete(id);
    else nou.add(id);
    setBifate(nou);
    salveazaPlan(nou);
  }

  const flux = [...potriviri].sort(sortare === "noi" ? dupaNoutate : dupaImpact);
  const plan = planulMeu(potriviri, bifate, valori);
  const cuEconomie = potriviri.some((p) => p.schimbare.actiuni.some((a) => a.formula_economie));
  const sep = baza.includes("?") ? "&" : "?";
  const optiune = (s: Sortare, text: string) =>
    s === sortare ? (
      <b className="text-v3-ink" aria-current="true">
        {text}
      </b>
    ) : (
      <Link href={`${baza}${sep}sort=${s}`} className="text-v3-ink-2 underline decoration-v3-line underline-offset-2 hover:text-v3-ink">
        {text}
      </Link>
    );

  const ev = evenimente(potriviri, valori, azi, limba);

  return (
    <div className="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_270px] lg:gap-7">
      <div className="min-w-0">
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
              <CardSchimbare key={x.schimbare.id} p={x} valori={valori} bifata={bifate.has(x.schimbare.id)} onBifeaza={() => comuta(x.schimbare.id)} />
            ))}
          </ul>
        )}

        {/* Planul meu: suma actelor cu impact calculabil, fără și cu acțiunile bifate (lib/potrivire.ts planulMeu). */}
        <aside
          aria-label={t("Planul meu")}
          className="sticky bottom-0 -mx-4 mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t-2 border-v3-ink bg-[var(--fundal)] px-4 py-3"
        >
          <span className="text-[11.5px] font-extrabold tracking-[.1em] text-v3-accent uppercase">{t("Planul meu")}</span>
          <span className="text-[15px] text-v3-ink">
            {t("Acum:")}{" "}
            <b className={`tabular-nums ${plan.fara_actiuni < 0 ? "text-v3-neg" : plan.fara_actiuni > 0 ? "text-v3-pos" : ""}`}>
              {cuSemn(plan.fara_actiuni)} {t("lei/lună")}
            </b>
          </span>
          {plan.economii !== 0 ? (
            <span className="text-[15px] text-v3-ink">
              {t("Cu ce ai bifat:")}{" "}
              <b className={`tabular-nums ${plan.cu_actiuni < 0 ? "text-v3-neg" : "text-v3-pos"}`}>
                {cuSemn(plan.cu_actiuni)} {t("lei/lună")}
              </b>
              <span className="text-v3-ink-2">
                {" "}
                · {t("păstrezi")} {mii(plan.economii * 12)} {t("lei/an")}
              </span>
            </span>
          ) : (
            <span className="text-[13.5px] text-v3-ink-2">
              {cuEconomie ? t("Bifează „O fac” la actele cu economie și vezi cât păstrezi.") : t("Sumele din acțiuni se adună aici.")}
            </span>
          )}
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
