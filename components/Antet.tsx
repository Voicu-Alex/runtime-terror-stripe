"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComutatorLimba, useLimba } from "@/components/Limba";
import { ComutatorTema } from "@/components/Tema";
import { useAbonament } from "@/components/useAbonament";

// Antetul „Revistă” din mockup/v3/index.html?v=f (ADR 0001): logo centrat cu slogan, navigare cu majuscule dedesubt.
const SECTIUNI = [
  { href: "/flux", text: "Flux" },
  { href: "/legi", text: "Toate legile" },
  { href: "/profil", text: "Profil" },
];

export function Antet() {
  const { t } = useLimba();
  const cale = usePathname();
  return (
    <header className="border-b border-v3-line">
      <div className="mx-auto grid max-w-[1080px] grid-cols-[auto_1fr_auto] items-center gap-2 sm:grid-cols-[1fr_auto_1fr] sm:gap-2.5 px-4 pt-3.5 pb-2.5 lg:pt-[18px] lg:pb-4">
        {/* stânga: tema, dreapta: limba, ca logo-ul să rămână centrat */}
        <span className="flex justify-start">
          <ComutatorTema />
        </span>
        <Link href="/" className="text-center no-underline">
          <b className="block font-head text-[clamp(15px,4.4vw,22px)] leading-[1.1] font-extrabold tracking-[-.02em] text-balance text-v3-logo min-[400px]:whitespace-nowrap lg:text-[34px]">
            Ce înseamnă pentru mine
          </b>
          <span className="mt-[3px] block text-[10.5px] font-semibold tracking-[.16em] text-v3-ink-2 uppercase lg:text-[11.5px]">
            {t("Legea, pe banii tăi")}
          </span>
        </Link>
        <span className="flex items-center justify-end gap-1.5 sm:gap-2">
          <ButonPro />
          <ComutatorLimba />
        </span>
      </div>
      <nav aria-label={t("Secțiuni")} className="flex justify-center gap-5 border-t border-v3-line sm:gap-11">
        {SECTIUNI.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            aria-current={cale.startsWith(s.href) ? "page" : undefined}
            className="flex min-h-[46px] items-center text-[13.5px] font-bold tracking-[.06em] text-v3-ink uppercase no-underline aria-[current=page]:text-v3-accent aria-[current=page]:shadow-[inset_0_-3px_0_var(--color-v3-accent)]"
          >
            {t(s.text)}
          </Link>
        ))}
      </nav>
    </header>
  );
}

/** „Upgrade la Pro” cât timp n-ai Pro; după plată, o insignă discretă. Duce la /abonament (conectare, apoi plată). */
function ButonPro() {
  const { t } = useLimba();
  const stare = useAbonament();
  if (stare?.activ)
    return (
      <Link href="/abonament" className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-v3-line bg-v3-card px-2.5 text-xs font-bold text-v3-ink no-underline">
        Pro <span className="text-v3-pos">✓</span>
      </Link>
    );
  return (
    <Link
      href="/abonament"
      className="inline-flex min-h-8 items-center rounded-lg bg-v3-ink px-2.5 text-xs font-bold whitespace-nowrap text-v3-on-ink no-underline hover:bg-v3-ink-strong"
    >
      <span className="hidden sm:inline">{t("Upgrade la")}&nbsp;</span>Pro
    </Link>
  );
}

export function Subsol() {
  const { t, limba } = useLimba();
  return (
    <footer className="mx-auto max-w-[1080px] border-t border-v3-line px-4 pt-4 pb-8 text-[12.5px] text-v3-ink-2">
      {/* AI Act, art. 50: conținutul generat cu AI e marcat pe fiecare ecran, nu doar unde apare. */}
      {t("Analiză generată cu AI, verifică etichetele. Informare, nu consultanță financiară sau juridică. Profilul rămâne pe dispozitivul tău.")}
      {limba === "en" && <> {t("Textele legilor sunt în română.")}</>}
      <Link href="/abonament" className="ml-1 font-semibold text-v3-ink-2 underline decoration-v3-line underline-offset-2">
        Pro
      </Link>
    </footer>
  );
}
