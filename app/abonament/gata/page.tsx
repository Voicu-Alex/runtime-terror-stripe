"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLimba } from "@/components/Limba";
import type { StareAbonament } from "@/lib/abonament";

/**
 * Întoarcerea din Stripe Checkout. Nu dă acces pe baza faptului că omul a ajuns aici: serverul întreabă
 * Stripe de abonamentul emailului conectat. Câteva încercări, pentru plățile confirmate cu întârziere.
 */
export default function PaginaGata() {
  const { t } = useLimba();
  const [stare, setStare] = useState<"verific" | "activ" | "neconfirmat">("verific");

  useEffect(() => {
    let incercari = 0;
    let oprit = false;
    const verifica = () =>
      fetch("/api/abonament/stare")
        .then((r) => r.json())
        .then((s: StareAbonament) => {
          if (oprit) return;
          if (s.activ) setStare("activ");
          else if (++incercari < 5) window.setTimeout(verifica, 2000);
          else setStare("neconfirmat");
        })
        .catch(() => !oprit && setStare("neconfirmat"));
    verifica();
    return () => {
      oprit = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <section className="rounded-3xl border border-v3-line bg-v3-card px-5 py-8 sm:px-9">
        {stare === "verific" && <p className="m-0 text-[17px] text-v3-ink-2">{t("Verificăm plata la Stripe…")}</p>}
        {stare === "activ" && (
          <>
            <p className="m-0 mb-2 text-xs font-extrabold tracking-[.12em] text-v3-pos uppercase">{t("Plata a reușit")}</p>
            <h1 className="m-0 font-head text-[clamp(28px,6.6vw,38px)] leading-[1.12] font-extrabold text-v3-ink">{t("Gata: ai Pro.")}</h1>
            <p className="m-0 mt-3 text-[17px] text-v3-ink-soft">{t("Fluxul tău arată acum cât te costă fiecare lege și Planul meu.")}</p>
            <Link href="/flux" className="mt-5 inline-flex min-h-[52px] items-center rounded-[12px] bg-v3-ink px-6 font-bold text-v3-on-ink no-underline">
              {t("Fluxul meu")}
            </Link>
          </>
        )}
        {stare === "neconfirmat" && (
          <>
            <h1 className="m-0 font-head text-[28px] font-extrabold text-v3-ink">{t("Nu am putut confirma plata")}</h1>
            <p className="m-0 mt-3 text-[16px] text-v3-ink-2">
              {t("Dacă ai plătit, confirmarea poate dura câteva minute. Reîncarcă pagina; dacă tot nu merge, încearcă din nou de pe pagina Pro.")}
            </p>
            <Link href="/abonament" className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-v3-line px-[18px] font-semibold text-v3-ink no-underline">
              {t("Înapoi la Pro")}
            </Link>
          </>
        )}
      </section>
    </div>
  );
}
