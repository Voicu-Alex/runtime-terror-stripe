"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComutatorLimba, useLimba } from "@/components/Limba";

// Antetul „Revistă” din mockup/v3/index.html?v=f (ADR 0001): logo centrat cu slogan, navigare cu majuscule dedesubt.
const SECTIUNI = [
  { href: "/notificare", text: "Azi" },
  { href: "/flux", text: "Flux" },
  { href: "/legi", text: "Toate legile" },
  { href: "/profil", text: "Profil" },
];

export function Antet() {
  const { t } = useLimba();
  const cale = usePathname();
  return (
    <header className="border-b border-v3-line">
      <div className="mx-auto grid max-w-[1080px] grid-cols-[1fr_auto_1fr] items-center gap-2.5 px-4 pt-3.5 pb-2.5 lg:pt-[18px] lg:pb-4">
        <span />
        <Link href="/" className="text-center no-underline">
          <b className="block font-head text-[clamp(17px,4.9vw,22px)] leading-[1.1] font-extrabold tracking-[-.02em] whitespace-nowrap text-v3-logo lg:text-[34px]">
            Ce înseamnă pentru mine
          </b>
          <span className="mt-[3px] block text-[10.5px] font-semibold tracking-[.16em] text-v3-ink-2 uppercase lg:text-[11.5px]">
            {t("Legea, pe banii tăi")}
          </span>
        </Link>
        <span className="flex justify-end">
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

export function Subsol() {
  const { t, limba } = useLimba();
  return (
    <footer className="mx-auto max-w-[1080px] border-t border-v3-line px-4 pt-4 pb-8 text-[12.5px] text-v3-ink-2">
      {/* AI Act, art. 50: conținutul generat cu AI e marcat pe fiecare ecran, nu doar unde apare. */}
      {t("Analiză generată cu AI, verifică etichetele. Informare, nu consultanță financiară sau juridică. Profilul rămâne pe dispozitivul tău.")}
      {limba === "en" && <> {t("Textele legilor sunt în română.")}</>}
    </footer>
  );
}
