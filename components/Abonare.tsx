"use client";

import Link from "next/link";
import { useState } from "react";
import { useLimba } from "@/components/Limba";
import { useAbonament } from "@/components/useAbonament";
import { PRET_BANI } from "@/lib/abonament";
import { dataScurta } from "@/lib/card";

// Pagina de abonare (docs/adr/0002-abonament-stripe.md). Plata o face Stripe Checkout; noi nu vedem cardul.

const CE_PRIMESTI = [
  "Cât te costă sau îți aduce fiecare lege, în lei pe lună, pe profilul tău",
  "Cât păstrezi pe an dacă faci ce permite legea",
  "Planul meu: bifezi ce faci și vezi totalul",
];

export function Abonare() {
  const { t, limba } = useLimba();
  const { stare, sub } = useAbonament();
  const [lucreaza, setLucreaza] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);

  async function mergiLa(cale: string, corp?: object) {
    setLucreaza(true);
    setEroare(null);
    try {
      const r = await fetch(cale, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corp ?? {}) });
      const j: { url?: string; eroare?: string } = await r.json();
      if (j.url) window.location.assign(j.url);
      else throw new Error(j.eroare ?? "Eroare necunoscută.");
    } catch (e) {
      setEroare(e instanceof Error ? e.message : String(e));
      setLucreaza(false);
    }
  }

  const pret = PRET_BANI / 100;

  return (
    <section className="rounded-3xl border border-v3-tintb bg-linear-135 from-v3-tint1 via-v3-tint2 via-45% to-v3-card px-5 py-8 sm:px-9">
      <p className="m-0 mb-2 text-xs font-extrabold tracking-[.12em] text-v3-accent uppercase">{t("Abonament")}</p>
      <h1 className="m-0 font-head text-[clamp(28px,6.6vw,40px)] leading-[1.12] font-extrabold tracking-[-.015em] text-v3-ink">
        {t("Vezi cât te costă fiecare lege")}
      </h1>
      <p className="m-0 mt-4 flex items-baseline gap-2">
        <span className="font-head text-[48px] leading-none font-extrabold tracking-[-.02em] text-v3-ink">{pret}</span>
        <span className="text-[17px] font-semibold text-v3-ink-2">{t("lei/lună")}</span>
      </p>
      <ul className="m-0 mt-5 list-none space-y-2.5 p-0">
        {CE_PRIMESTI.map((x) => (
          <li key={x} className="flex gap-2.5 text-[16px] leading-[1.45] text-v3-ink-soft">
            <span aria-hidden="true" className="mt-0.5 inline-flex size-5 flex-none items-center justify-center rounded-full bg-v3-pos-soft text-[12px] text-v3-pos">
              ✓
            </span>
            {t(x)}
          </li>
        ))}
      </ul>
      <p className="m-0 mt-4 text-[14px] text-v3-ink-2">
        {t("Fără abonament vezi în continuare toate actele care te privesc, termenele și pagina „Toate legile”.")}
      </p>

      <div className="mt-6">
        {stare === null ? (
          <p className="m-0 text-[15px] text-v3-ink-2">{t("Se verifică abonamentul…")}</p>
        ) : stare.activ ? (
          <div className="rounded-2xl border border-v3-pos/30 bg-v3-pos-soft p-4">
            <p className="m-0 text-[16px] font-bold text-v3-pos">{t("Abonamentul e activ.")}</p>
            {stare.panaLa && (
              <p className="m-0 mt-1 text-[14.5px] text-v3-ink">
                {stare.seOpreste ? t("Se oprește pe") : t("Se reînnoiește pe")} {dataScurta(stare.panaLa, limba)}.
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/flux" className="inline-flex min-h-11 items-center rounded-[10px] bg-v3-ink px-[18px] font-bold text-v3-on-ink no-underline">
                {t("Fluxul meu")}
              </Link>
              <button
                type="button"
                disabled={lucreaza}
                onClick={() => mergiLa("/api/abonament/portal", { sub })}
                className="min-h-11 rounded-[10px] border border-v3-line bg-v3-card px-[18px] font-semibold text-v3-ink disabled:opacity-60"
              >
                {t("Gestionează sau anulează")}
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={lucreaza}
              onClick={() => mergiLa("/api/abonament/checkout")}
              className="inline-flex min-h-[52px] items-center rounded-[12px] bg-v3-ink px-6 text-[16px] font-bold text-v3-on-ink hover:bg-v3-ink-strong disabled:opacity-60"
            >
              {lucreaza ? t("Te ducem la plată…") : `${t("Abonează-te")} · ${pret} ${t("lei/lună")}`}
            </button>
            <p className="m-0 mt-3 text-[13.5px] text-v3-ink-2">
              {t("Plata se face pe pagina Stripe; noi nu vedem datele cardului. Anulezi oricând, abonamentul rămâne activ până la finalul lunii plătite.")}
            </p>
          </>
        )}
        {eroare && (
          <p role="alert" className="m-0 mt-3 rounded-lg border border-v3-urg bg-v3-urg-soft p-3 text-sm text-v3-urg">
            {eroare}
          </p>
        )}
      </div>
    </section>
  );
}
