"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLimba } from "@/components/Limba";
import { MeniuProfil } from "@/components/MeniuProfil";
import { SemnBuzunar } from "@/components/Logo";
import { useAbonament } from "@/components/useAbonament";
import type { StareAbonament } from "@/lib/abonament";

// Antetul: logo-ul și numele în stânga, Pro și meniul contului în dreapta, secțiunile dedesubt.
// Profilul, tema și limba sunt în meniul contului (components/MeniuProfil.tsx), nu în bara de secțiuni.
const SECTIUNI = [
  { href: "/aplicatie", text: "Pentru tine" },
  { href: "/legi", text: "Toate legile" },
];

/** „Pentru tine” (/aplicatie) e activ și pe fluxul vechi; restul, după prefix. Pe landing (/) nu e activ nimic. */
function activ(cale: string, href: string): boolean {
  return href === "/aplicatie" ? cale.startsWith("/aplicatie") || cale.startsWith("/flux") : cale.startsWith(href);
}

export function Antet() {
  const { t } = useLimba();
  const cale = usePathname();
  const stare = useAbonament();
  // Pe landing (/) nu apar: pagina are bara ei minimală (components/Acasa.tsx).
  if (cale === "/") return null;
  // Bara de secțiuni e în afara <header>: sticky se oprește la marginea părintelui,
  // iar în <header> s-ar fi oprit imediat sub ea. Ca frate al lui <main>, rămâne sus pe tot scroll-ul.
  return (
    <>
      <header>
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-4 pt-3 pb-2.5 lg:pt-4 lg:pb-3">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 no-underline">
            <SemnBuzunar className="h-8 lg:h-9" />
            <span className="min-w-0">
              <b className="block font-head text-[22px] leading-none font-extrabold tracking-[-.02em] whitespace-nowrap text-v3-logo lg:text-[26px]">
                {t("Buzunar")}
                {stare?.activ && <ChipPro />}
              </b>
              <span className="mt-1 hidden text-[10.5px] font-semibold tracking-[.14em] whitespace-nowrap text-v3-ink-2 uppercase min-[400px]:block">
                {t("Legea, pe banii tăi")}
              </span>
            </span>
          </Link>
          <span className="flex items-center gap-2">
            <ButonPro stare={stare} />
            <MeniuProfil stare={stare} />
          </span>
        </div>
      </header>
      <nav aria-label={t("Secțiuni")} className="nav-sectiuni sticky top-0 z-20 border-t border-b border-v3-line bg-[var(--fundal)]">
        <div className="mx-auto flex max-w-[1080px] gap-6 overflow-x-auto px-4">
          {SECTIUNI.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              aria-current={activ(cale, s.href) ? "page" : undefined}
              className="flex min-h-[46px] shrink-0 items-center whitespace-nowrap text-[13.5px] font-bold tracking-[.06em] text-v3-ink-2 uppercase no-underline hover:text-v3-ink aria-[current=page]:text-v3-ink aria-[current=page]:shadow-[inset_0_-3px_0_var(--color-v3-ink)]"
            >
              {t(s.text)}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}

/** Pro activ: un chip mic „PRO” lipit de numele aplicației (decizia din 29 oct: statutul stă lângă marcă, nu în slotul butonului). */
function ChipPro() {
  const { t } = useLimba();
  return (
    <span className="ml-1.5 inline-block rounded-[4px] bg-v3-pos-soft px-[5px] py-[2px] align-top font-sans text-[10px] leading-[1.2] font-extrabold tracking-[.08em] text-v3-pos">
      PRO
      <span className="sr-only"> · {t("abonament activ")}</span>
    </span>
  );
}

/**
 * „Upgrade la Pro” cât timp n-ai Pro; cu Pro (plătit sau din comutatorul de demo) dispare, iar statutul apare o singură
 * dată, ca ChipPro lângă nume. Că e demo se vede doar în meniul contului. Duce la /abonament.
 */
function ButonPro({ stare }: { stare: StareAbonament | null }) {
  const { t } = useLimba();
  if (stare?.activ) return null;
  return (
    <Link
      href="/abonament"
      className="inline-flex min-h-11 items-center justify-center rounded-full bg-v3-ink px-4 text-[13px] font-bold whitespace-nowrap text-v3-on-ink no-underline hover:bg-v3-ink-strong"
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
  const cale = usePathname();
  if (cale === "/") return null;
  return (
    <footer className="mx-auto max-w-[1080px] border-t border-v3-line px-4 pt-4 pb-24 text-[12.5px] text-v3-ink-2">
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

/**
 * Fundalul landing-ului (components/Acasa.tsx) pe tot site-ul: granulație și două lumini difuze, verde (bani în plus)
 * și roșie (bani în minus), fixe în spatele conținutului. Se vede doar în tema închisă (app/globals.css, .fundal-ld);
 * pe landing (/) nu e nevoie, fiecare ecran îl are pe al lui.
 */
export function FundalLanding() {
  const cale = usePathname();
  if (cale === "/") return null;
  return (
    <div aria-hidden="true" className="fundal-ld">
      <div className="ld-grain" />
      <div className="ld-glow" style={{ width: "44vw", height: "44vw", left: "-10vw", top: "-14vh", background: "#00853A", "--o": 0.2 } as React.CSSProperties} />
      <div className="ld-glow" style={{ width: "26vw", height: "26vw", right: "-6vw", top: "42vh", background: "#E0101E", "--o": 0.16, animationDelay: "-4s" } as React.CSSProperties} />
    </div>
  );
}
