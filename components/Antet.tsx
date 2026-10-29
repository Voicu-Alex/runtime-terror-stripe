"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComutatorLimba, useLimba } from "@/components/Limba";
import { ComutatorTema } from "@/components/Tema";
import { useAbonament } from "@/components/useAbonament";
import type { StareAbonament } from "@/lib/abonament";

// Antetul „Revistă” din mockup/v3/index.html?v=f (ADR 0001): logo centrat cu slogan, navigare cu majuscule dedesubt.
// Trei secțiuni: Pentru tine (macheta v6), Toate legile (noutățile și ghidul) și Profil (cu Planul meu).
const SECTIUNI = [
  { href: "/", text: "Pentru tine" },
  { href: "/legi", text: "Toate legile" },
  { href: "/profil", text: "Profil" },
];

/** „/” e activ doar pe pagina principală și pe fluxul vechi; restul, după prefix. */
function activ(cale: string, href: string): boolean {
  return href === "/" ? cale === "/" || cale.startsWith("/flux") : cale.startsWith(href);
}

export function Antet() {
  const { t } = useLimba();
  const cale = usePathname();
  // Bara de secțiuni e în afara <header>: sticky se oprește la marginea părintelui,
  // iar în <header> s-ar fi oprit imediat sub ea. Ca frate al lui <main>, rămâne sus pe tot scroll-ul.
  return (
    <>
      <header>
        <div className="mx-auto grid max-w-[1080px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-4 pt-3.5 pb-2.5 sm:gap-2.5 lg:grid-cols-[1fr_auto_1fr] lg:pt-[18px] lg:pb-4">
          {/* stânga: tema, dreapta: Pro și limba, ca logo-ul să rămână centrat */}
          <span className="flex justify-start">
            <ComutatorTema />
          </span>
          <Link href="/" className="min-w-0 text-center no-underline">
            <b className="block font-head text-[clamp(15px,4.4vw,22px)] leading-[1.1] font-extrabold tracking-[-.02em] text-balance text-v3-logo lg:whitespace-nowrap lg:text-[34px]">
              {t("Buzunar")}
            </b>
            <span className="mt-[3px] hidden text-[10.5px] font-semibold tracking-[.16em] text-v3-ink-2 uppercase min-[480px]:block lg:text-[11.5px]">
              {t("Legea, pe banii tăi")}
            </span>
          </Link>
          <span className="flex items-center justify-end gap-1.5 sm:gap-2">
            <ButoaneCont />
            <ComutatorLimba />
          </span>
        </div>
      </header>
      <nav
        aria-label={t("Secțiuni")}
        className="sticky top-0 z-20 flex gap-5 overflow-x-auto border-t border-b border-v3-line bg-[var(--fundal)] px-4 sm:justify-center sm:gap-9"
      >
        {SECTIUNI.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            aria-current={activ(cale, s.href) ? "page" : undefined}
            className="flex min-h-[46px] shrink-0 items-center whitespace-nowrap text-[13.5px] font-bold tracking-[.06em] text-v3-ink uppercase no-underline aria-[current=page]:text-v3-accent aria-[current=page]:shadow-[inset_0_-3px_0_var(--color-v3-accent)]"
          >
            {t(s.text)}
          </Link>
        ))}
      </nav>
    </>
  );
}

const butonSecundar =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg border border-v3-line bg-v3-card px-2.5 text-xs font-bold whitespace-nowrap text-v3-ink no-underline hover:border-v3-ink";

/** Contul și Pro, cu o singură citire a stării (useAbonament spune și dacă ești conectat). */
function ButoaneCont() {
  const stare = useAbonament();
  return (
    <>
      <ButonCont stare={stare} />
      <ButonPro stare={stare} />
    </>
  );
}

/** „Intră” cât nu ești conectat; „Cont” după. Ambele duc la /conectare (Google; acolo e și „Ieși din cont”). */
function ButonCont({ stare }: { stare: StareAbonament | null }) {
  const { t } = useLimba();
  const conectat = !!stare?.conectat;
  return (
    <Link href="/conectare" className={butonSecundar} aria-label={conectat ? t("Contul meu") : t("Intră în cont")} title={conectat && stare?.email ? stare.email : undefined}>
      {conectat ? (
        <>
          <span aria-hidden="true" className="size-2 rounded-full bg-v3-pos" />
          {t("Cont")}
        </>
      ) : (
        t("Intră")
      )}
    </Link>
  );
}

/** „Upgrade la Pro” cât timp n-ai Pro; după plată, o insignă discretă. Duce la /abonament (conectare, apoi plată). */
function ButonPro({ stare }: { stare: StareAbonament | null }) {
  const { t } = useLimba();
  if (stare?.activ)
    return (
      <Link href="/abonament" className={butonSecundar}>
        Pro <span className="text-v3-pos">✓</span>
      </Link>
    );
  return (
    <Link
      href="/abonament"
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-v3-ink px-2.5 text-xs font-bold whitespace-nowrap text-v3-on-ink no-underline hover:bg-v3-ink-strong"
    >
      <span className="hidden sm:inline">{t("Upgrade la")}&nbsp;</span>Pro
    </Link>
  );
}

export function SariLaContinut() {
  const { t } = useLimba();
  return <a href="#continut" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-v3-ink focus:px-4 focus:py-3 focus:text-v3-on-ink">{t("Sari la conținut")}</a>;
}

export function Subsol() {
  const { t, limba } = useLimba();
  return (
    <footer className="mx-auto max-w-[1080px] border-t border-v3-line px-4 pt-4 pb-8 text-[12.5px] text-v3-ink-2">
      {/* AI Act, art. 50: conținutul generat cu AI e marcat pe fiecare ecran, nu doar unde apare. */}
      {t("Analiză generată cu AI, verifică etichetele. Informare, nu consultanță financiară sau juridică.")}
      {limba === "en" && <> {t("Traducerea în engleză e neoficială; textul verificat e cel în română.")}</>}
      <Link href="/surse" className="ml-1 font-semibold text-v3-ink-2 underline decoration-v3-line underline-offset-2">
        {t("Surse și limitări")}
      </Link>{" "}
      ·{" "}
      <Link href="/abonament" className="font-semibold text-v3-ink-2 underline decoration-v3-line underline-offset-2">
        Pro
      </Link>
    </footer>
  );
}
