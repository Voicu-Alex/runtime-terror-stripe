"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Conectare } from "@/components/Conectare";
import { useLimba } from "@/components/Limba";
import { useAbonament } from "@/components/useAbonament";
import { PRET_BANI } from "@/lib/abonament";
import { dataScurta } from "@/lib/card";

// Pagina Pro (docs/adr/0002-abonament-stripe.md): întâi conectarea (Google sau email, docs/adr/0003-conturi-email.md),
// apoi plata prin Stripe Checkout. Noi nu vedem cardul; abonamentul e al emailului contului.

const CE_PRIMESTI = [
  "Cât te costă sau îți aduce fiecare lege, în lei pe lună, pe profilul tău",
  "Cât păstrezi pe an dacă faci ce permite legea",
  "Planul meu: bifezi ce faci și vezi totalul",
  "Abonamentul te urmează pe orice telefon, cu contul tău",
];

export function Abonare() {
  const { t, limba } = useLimba();
  const stare = useAbonament();
  const [lucreaza, setLucreaza] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);

  async function mergiLa(cale: string) {
    setLucreaza(true);
    setEroare(null);
    try {
      const r = await fetch(cale, { method: "POST" });
      const j: { url?: string; eroare?: string } = await r.json();
      if (j.url) window.location.assign(j.url);
      else throw new Error(j.eroare ?? "Eroare necunoscută.");
    } catch (e) {
      setEroare(e instanceof Error ? e.message : String(e));
      setLucreaza(false);
    }
  }

  const pret = PRET_BANI / 100;
  const buton = "inline-flex min-h-[52px] items-center gap-2.5 rounded-[12px] px-6 text-[16px] font-bold disabled:opacity-60";

  return (
    <section className="rounded-3xl border border-v3-tintb bg-linear-135 from-v3-tint1 via-v3-tint2 via-45% to-v3-card px-5 py-8 sm:px-9">
      <p className="m-0 mb-2 inline-flex items-center gap-2 text-xs font-extrabold tracking-[.12em] text-v3-accent uppercase">
        <span className="rounded-md bg-v3-ink px-1.5 py-0.5 tracking-[.08em] text-v3-on-ink">Pro</span>
        {t("Ce înseamnă pentru mine")}
      </p>
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

      <div className="mt-7">
        {stare === null ? (
          <p className="m-0 text-[15px] text-v3-ink-2">{t("Se verifică contul…")}</p>
        ) : !stare.conectat ? (
          // Pasul 1: conectarea. Abonamentul se leagă de emailul contului, deci nu se poate plăti fără el.
          <>
            <p className="m-0 mb-3 text-[14px] font-bold tracking-[.02em] text-v3-ink-2">{t("Pasul 1 din 2: conectează-te")}</p>
            <Conectare dupa="/abonament" />
            <p className="m-0 mt-4 text-[13.5px] text-v3-ink-2">
              {t("Folosim doar emailul, ca abonamentul să te urmeze pe orice telefon. Profilul rămâne pe dispozitivul tău.")}
            </p>
          </>
        ) : stare.activ ? (
          <div className="rounded-2xl border border-v3-pos/30 bg-v3-pos-soft p-4">
            <p className="m-0 text-[16px] font-bold text-v3-pos">{t("Ai Pro.")}</p>
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
                onClick={() => mergiLa("/api/abonament/portal")}
                className="min-h-11 rounded-[10px] border border-v3-line bg-v3-card px-[18px] font-semibold text-v3-ink disabled:opacity-60"
              >
                {t("Gestionează sau anulează")}
              </button>
            </div>
          </div>
        ) : (
          // Pasul 2: plata.
          <>
            <p className="m-0 mb-3 text-[14px] font-bold tracking-[.02em] text-v3-ink-2">{t("Pasul 2 din 2: plata")}</p>
            <button
              type="button"
              disabled={lucreaza}
              onClick={() => mergiLa("/api/abonament/checkout")}
              className={`${buton} bg-v3-ink text-v3-on-ink hover:bg-v3-ink-strong`}
            >
              {lucreaza ? t("Te ducem la plată…") : `${t("Upgrade la Pro")} · ${pret} ${t("lei/lună")}`}
            </button>
            <p className="m-0 mt-3 text-[13.5px] text-v3-ink-2">
              {t("Plata se face pe pagina Stripe; noi nu vedem datele cardului. Anulezi oricând, Pro rămâne activ până la finalul lunii plătite.")}
            </p>
          </>
        )}
        {eroare && (
          <p role="alert" className="m-0 mt-3 rounded-lg border border-v3-urg bg-v3-urg-soft p-3 text-sm text-v3-urg">
            {eroare}
          </p>
        )}
        {stare?.conectat && (
          <p className="m-0 mt-5 text-[13px] text-v3-ink-2">
            {t("Conectat ca")} <b className="text-v3-ink">{stare.email}</b> ·{" "}
            <button type="button" onClick={() => signOut({ redirectTo: "/abonament" })} className="font-semibold text-v3-ink underline decoration-v3-line underline-offset-2">
              {t("Deconectează-te")}
            </button>
          </p>
        )}
      </div>
    </section>
  );
}
