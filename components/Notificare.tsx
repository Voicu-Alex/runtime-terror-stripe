"use client";

import Link from "next/link";
import { useLimba } from "@/components/Limba";
import { cuSemn, cuTracking, vedere, zile } from "@/lib/card";
import { etichetaTagL } from "@/lib/i18n";
import type { Potrivire } from "@/lib/potrivire";
import type { Valori } from "@/lib/profil";

/**
 * Notificarea: cele 5 elemente din docs/produs.md, în ordinea asta și fără altceva:
 * 1. ce s-a schimbat · 2. cât te costă sau câștigi (lei/lună) · 3. ce poți face · 4. până când · 5. articolul din lege.
 */
export function Notificare({ p, valori, baza }: { p: Potrivire; valori: Valori; baza: string }) {
  const { t, limba } = useLimba();
  const s = p.schimbare;
  const v = vedere(p, valori, limba);
  const a = s.actiuni.find((x) => x.termen) ?? s.actiuni[0];
  const culoare = v.suma === null || v.suma === 0 ? "text-v3-ink" : v.suma < 0 ? "text-v3-neg" : "text-v3-pos";

  return (
    <article className="rounded-2xl border border-v3-line bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,.06)]">
      <p className="m-0 text-[11.5px] font-extrabold tracking-[.1em] text-v3-accent uppercase">{v.kicker}</p>

      {/* 1. ce s-a schimbat */}
      <h2 className="mt-1 mb-3 font-head text-[22px] leading-[1.25] font-extrabold tracking-[-.015em] text-v3-ink">{v.titlu}</h2>
      <p className="m-0 mb-4 text-[15px] text-v3-ink" lang="ro">
        {s.niveluri.zero}
      </p>

      {/* 2. cât */}
      <p className={`m-0 font-sans text-[40px] leading-none font-extrabold tracking-[-.03em] tabular-nums ${culoare}`}>
        {v.suma === null ? "—" : cuSemn(v.suma)}
        <small className="ml-2 text-[15px] font-semibold tracking-normal text-v3-ink-2">
          {v.suma === null ? t("de calculat") : v.suma === 0 ? t("lei/lună acum") : t("lei/lună")}
        </small>
      </p>
      {v.cere && (
        <p className="mt-1 mb-0 text-[13.5px] font-semibold text-v3-ink">
          {t("Ca să calculăm suma:")} {t(v.cere)}.
        </p>
      )}
      {s.estimare && v.suma !== null && v.suma !== 0 && (
        <p className="mt-1 mb-0 text-[13px] text-v3-ink-2">{t("Calculul nostru pe profilul tău, nu o cifră scrisă în lege.")}</p>
      )}

      {/* 3. ce poți face · 4. până când */}
      {a && (
        <div className={`mt-4 rounded-[10px] p-3 ${v.termen?.urgent ? "bg-v3-urg-soft shadow-[inset_3px_0_0_var(--color-v3-urg)]" : "bg-v3-act"}`}>
          <p className="m-0 text-[13px] font-bold tracking-[.02em] text-v3-ink-2">{t("Ce poți face")}</p>
          <p className="mt-0.5 mb-1 font-semibold" lang="ro">
            {a.text}
          </p>
          {v.termen && !v.termen.depasit && (
            <p className={`m-0 text-[15px] font-bold ${v.termen.urgent ? "text-v3-urg" : "text-v3-ink"}`}>
              {t("Până la")} {v.termen.text} · {t("mai ai")} {zile(v.termen.zile, limba)}
            </p>
          )}
          {v.termen?.depasit && (
            <p className="m-0 text-[15px] font-bold text-v3-past">
              {t("Termen depășit:")} {v.termen.text}
            </p>
          )}
          {a.one_click && !v.termen?.depasit && (
            <a
              href={cuTracking(a.one_click, s.id)}
              target="_blank"
              rel="noopener"
              className="mt-2 inline-flex min-h-[46px] items-center gap-2 rounded-[10px] bg-v3-ink px-[18px] font-bold text-white no-underline"
            >
              {t("Compară oferte")} <span aria-hidden="true">↗︎</span>
              <span className="sr-only">{t("(se deschide într-un tab nou)")}</span>
            </a>
          )}
        </div>
      )}

      {/* 5. articolul */}
      <p className="mt-4 mb-1 text-[13.5px] text-v3-ink-2">
        <b className="text-v3-ink">{s.act}</b> · {s.mo_ref} · <span lang="ro">{s.articol}</span>
      </p>
      <a href={s.sursa_url} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center font-semibold text-v3-accent">
        {t(s.sursa_url.includes("legislatie.just.ro") ? "Textul legii pe Portal Legislativ" : "Textul actului")} ↗︎
      </a>

      <p className="mt-3 mb-0 flex flex-wrap items-center gap-1.5 text-[12.5px] text-v3-ink-2">
        {t("Te privește ca:")}
        {p.taguri_comune.map((x) => (
          <span key={x} className="rounded-lg border border-v3-line bg-white px-[9px] py-0.5 text-[13px] font-semibold text-v3-ink">
            {etichetaTagL(limba, x)}
          </span>
        ))}
      </p>
      <p className="mt-3 mb-0 text-[13.5px]">
        <Link href={`${baza}#c-${s.id}`} className="font-semibold text-v3-ink underline decoration-v3-line underline-offset-2">
          {t("Vezi în fluxul tău →")}
        </Link>
      </p>
    </article>
  );
}
