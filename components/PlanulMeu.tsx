"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CardSchimbare from "@/components/CardSchimbare";
import { useLimba } from "@/components/Limba";
import { useAbonament } from "@/components/useAbonament";
import { useProfil } from "@/components/useProfil";
import { bani, cuSemn } from "@/lib/card";
import { CATALOG } from "@/lib/catalog";
import { incarcaFreemium, FREEMIUM_GOL, type StareFreemium } from "@/lib/freemium";
import { persoanaDemo } from "@/lib/persoane-demo";
import { incarcaPlan, salveazaPlan } from "@/lib/plan";
import { aziISO, planulMeu, potriveste } from "@/lib/potrivire";

// „Planul meu” din v6: ce ai bifat că faci și ghidurile deschise. Totul stă pe dispozitiv.
export function PlanulMeu() {
  const { t , limba } = useLimba();
  const profilReal = useProfil();
  const abonament = useAbonament();
  const [bifate, setBifate] = useState<Set<string>>(new Set());
  const [fm, setFm] = useState<StareFreemium>(FREEMIUM_GOL);
  useEffect(() => {
    setBifate(incarcaPlan());
    setFm(incarcaFreemium());
  }, []);

  const exemplu = !profilReal || profilReal.taguri.length === 0;
  const profil = exemplu ? persoanaDemo("andrei").profil : profilReal;
  const azi = exemplu ? "2026-10-28" : aziISO();
  const potriviri = useMemo(() => potriveste(profil, CATALOG, azi), [profil, azi]);
  if (profilReal === null) return <p className="mt-4 text-sm text-v3-ink-2">{t("Se încarcă profilul de pe dispozitiv…")}</p>;

  const pro = !!abonament?.activ;
  const din = potriviri.filter((p) => bifate.has(p.schimbare.id) || fm.deblocate.includes(p.schimbare.id));
  const plan = planulMeu(potriviri, bifate, profil.valori, azi);
  function comuta(id: string) {
    const urm = new Set(bifate);
    if (urm.has(id)) urm.delete(id);
    else urm.add(id);
    setBifate(urm);
    salveazaPlan(urm);
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="m-0 font-head text-[clamp(28px,6vw,38px)] leading-[1.12] font-extrabold tracking-[-.015em] text-v3-ink">{t("Planul meu")}</h1>
      <p className="mt-2 mb-4 text-[16px] text-v3-ink-2">
        {exemplu ? t("Exemplu pe profilul Andrei, 32.") : t("Pe profilul tău.")}{" "}
        {t("Bifează „Adaug în planul meu” pe o lege și apare aici, cu cât păstrezi pe an.")}
      </p>

      <section className="rounded-2xl border border-v3-line bg-v3-card p-5">
        <div className="flex flex-wrap gap-x-10 gap-y-3">
          <div>
            <span className="block text-[13.5px] text-v3-ink-2">{t("Fără să faci nimic")}</span>
            <b className={`font-num text-[32px] font-semibold tabular-nums ${plan.fara_actiuni < 0 ? "text-v3-neg" : "text-v3-ink"}`}>
              {cuSemn(plan.fara_actiuni * 12, limba)} <small className="font-sans text-[14px] text-v3-ink-2">{t("lei/an")}</small>
            </b>
          </div>
          <div>
            <span className="block text-[13.5px] text-v3-ink-2">{t("Cu ce ai bifat")}</span>
            <b className={`font-num text-[32px] font-semibold tabular-nums ${plan.cu_actiuni < 0 ? "text-v3-neg" : "text-v3-pos"}`}>
              {cuSemn(plan.cu_actiuni * 12, limba)} <small className="font-sans text-[14px] text-v3-ink-2">{t("lei/an")}</small>
            </b>
          </div>
          {plan.economii_punctuale > 0 && (
            <div>
              <span className="block text-[13.5px] text-v3-ink-2">{t("O singură dată")}</span>
              <b className="font-num text-[32px] font-semibold text-v3-pos tabular-nums">+{bani(plan.economii_punctuale, limba)}</b>
            </div>
          )}
        </div>
      </section>

      <h2 className="mt-6 mb-0 border-b border-v3-line pb-2 font-head text-[19px] font-extrabold text-v3-ink">
        {t("Ghiduri deschise și acțiuni bifate")}
      </h2>
      {din.length ? (
        <ul className="m-0 list-none p-0">
          {din.map((p) => (
            <CardSchimbare
              key={p.schimbare.id}
              p={p}
              valori={profil.valori}
              bifata={bifate.has(p.schimbare.id)}
              onBifeaza={() => comuta(p.schimbare.id)}
            />
          ))}
        </ul>
      ) : (
        <p className="py-6 text-[15px] text-v3-ink-2">
          {t("Nu ai deschis încă un ghid complet.")}{" "}
          <Link href="/" className="font-semibold text-v3-ink underline underline-offset-2">
            {t("Explorează actele pentru tine")}
          </Link>
          {!pro && (
            <>
              {" · "}
              <Link href="/abonament" className="font-semibold text-v3-ink underline underline-offset-2">
                {t("Upgrade la Pro")}
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
