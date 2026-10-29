"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { ComutatorLimba, useLimba } from "@/components/Limba";
import { ComutatorTema } from "@/components/Tema";
import type { StareAbonament } from "@/lib/abonament";
import { seteazaProDemo } from "@/components/useAbonament";

// Meniul din dreapta sus: contul, profilul (etichete, documente, planul), asistentul de pe /profil și setările (temă, limbă).
// Un panou simplu care se deschide sub buton; Escape, clic în afară sau schimbarea paginii îl închid.

const rand =
  "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-[14.5px] font-semibold text-v3-ink no-underline hover:bg-v3-accent-soft";
const titluGrup = "m-0 px-3 pt-3 pb-1 text-[11px] font-bold tracking-[.12em] text-v3-ink-2 uppercase";

function Iconita({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px] flex-none fill-none stroke-current stroke-[1.8] text-v3-ink-2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONITE = {
  etichete: "M3 12V4h8l9 9-8 8-9-9Zm4.5-4.5h.01",
  document: "M14 3H6v18h12V7l-4-4Zm0 0v4h4M12 11v6m-3-3h6",
  plan: "M5 12l4 4L19 6",
  asistent: "M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-3 2v-5.5A7.5 7.5 0 0 1 11.5 4h1A7.5 7.5 0 0 1 20 11.5Z",
  pro: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z",
  iesire: "M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10",
};

export function MeniuProfil({ stare }: { stare: StareAbonament | null }) {
  const { t } = useLimba();
  const cale = usePathname();
  const [deschis, setDeschis] = useState(false);
  const radacina = useRef<HTMLDivElement>(null);
  const buton = useRef<HTMLButtonElement>(null);
  const panou = useRef<HTMLDivElement>(null);
  const id = useId();
  const conectat = !!stare?.conectat;
  const initiala = stare?.email?.[0]?.toUpperCase();

  useEffect(() => setDeschis(false), [cale]);
  useEffect(() => {
    if (!deschis) return;
    panou.current?.querySelector<HTMLElement>("a, button")?.focus();
    const clic = (e: PointerEvent) => {
      if (!radacina.current?.contains(e.target as Node)) setDeschis(false);
    };
    const tasta = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDeschis(false);
        buton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", clic);
    document.addEventListener("keydown", tasta);
    return () => {
      document.removeEventListener("pointerdown", clic);
      document.removeEventListener("keydown", tasta);
    };
  }, [deschis]);

  const inchide = () => setDeschis(false);
  // Linkurile cu # spre /profil. Pe /profil le schimbăm noi adresa (browserul dă „hashchange”, pe care îl ascultă
  // Asistent.tsx ca să deschidă formularul); din altă pagină, Next.js navighează și /profil citește ancora la încărcare.
  const spreAncora = (ancora: string) => (e: React.MouseEvent) => {
    inchide();
    if (cale === "/profil") {
      e.preventDefault();
      // aceeași ancoră de două ori nu dă „hashchange”, așa că îl trimitem noi
      if (window.location.hash === `#${ancora}`) window.dispatchEvent(new HashChangeEvent("hashchange"));
      else window.location.hash = ancora;
    }
  };

  return (
    <div ref={radacina} className="relative">
      <button
        ref={buton}
        type="button"
        aria-expanded={deschis}
        aria-controls={id}
        aria-label={t("Meniul contului")}
        title={conectat && stare?.email ? stare.email : undefined}
        onClick={() => setDeschis((d) => !d)}
        className={`relative inline-flex size-11 items-center justify-center rounded-full border bg-v3-card text-v3-ink hover:border-v3-ink aria-expanded:border-v3-ink ${
          // Profilul nu mai e în bara de secțiuni: pe paginile lui, butonul arată că ești acolo
          cale.startsWith("/profil") || cale.startsWith("/conectare") ? "border-v3-ink ring-2 ring-v3-ink" : "border-v3-line"
        }`}
      >
        {conectat && initiala ? (
          <span className="font-head text-[16px] font-extrabold">{initiala}</span>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8.5" r="3.5" />
            <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
          </svg>
        )}
        {conectat && <span aria-hidden="true" className="absolute right-0.5 bottom-0.5 size-2.5 rounded-full border-2 border-v3-card bg-v3-pos" />}
      </button>

      {deschis && (
        <div
          ref={panou}
          id={id}
          className="absolute top-[calc(100%+8px)] right-0 z-40 max-h-[calc(100dvh-80px)] w-[min(calc(100vw-32px),320px)] overflow-y-auto rounded-[14px] border border-v3-line bg-v3-card p-1.5 shadow-[0_16px_40px_rgb(0_0_0/0.16)]"
        >
          {/* Contul */}
          <div className="border-b border-v3-line px-3 pt-2.5 pb-3">
            {conectat ? (
              <>
                <p className="m-0 text-[12.5px] text-v3-ink-2">{t("Conectat ca")}</p>
                <p className="m-0 truncate text-[14.5px] font-bold text-v3-ink">{stare?.email}</p>
              </>
            ) : (
              <>
                <p className="m-0 text-[14.5px] font-bold text-v3-ink">{t("Nu ești în cont")}</p>
                <Link href="/conectare" onClick={inchide} className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-[10px] bg-v3-ink px-4 text-[14px] font-bold text-v3-on-ink no-underline hover:bg-v3-ink-strong">
                  {t("Intră în cont")}
                </Link>
              </>
            )}
          </div>

          <p className={titluGrup}>{t("Profilul meu")}</p>
          <Link href="/profil#etichete" onClick={spreAncora("etichete")} className={rand}>
            <Iconita d={ICONITE.etichete} />
            {t("Etichetele mele")}
          </Link>
          <Link href="/profil#document" onClick={spreAncora("document")} className={rand}>
            <Iconita d={ICONITE.document} />
            {t("Adaugă un document")}
          </Link>
          <Link href="/profil#planul-meu" onClick={inchide} className={rand}>
            <Iconita d={ICONITE.plan} />
            {t("Planul meu")}
          </Link>
          <Link href="/profil#asistent" onClick={spreAncora("asistent")} className={rand}>
            <Iconita d={ICONITE.asistent} />
            {t("Vorbește cu asistentul")}
          </Link>

          <p className={`${titluGrup} mt-1 border-t border-v3-line pt-3`}>{t("Setări")}</p>
          <div className="flex min-h-12 items-center justify-between gap-3 px-3">
            <span className="text-[14.5px] font-semibold text-v3-ink">{t("Temă închisă")}</span>
            <ComutatorTema />
          </div>
          <div className="flex min-h-12 items-center justify-between gap-3 px-3">
            <span className="text-[14.5px] font-semibold text-v3-ink">{t("Limba")}</span>
            <ComutatorLimba />
          </div>
          {/* Demo: arată aplicația cu Pro, fără plată. Ascuns când ai Pro plătit. */}
          {!(stare?.activ && !stare.demo) && (
            <div className="flex min-h-12 items-center justify-between gap-3 px-3">
              <span className="text-[14.5px] font-semibold text-v3-ink">
                {t("Pro (demo)")}
                <small className="block text-[12px] font-normal text-v3-ink-2">{t("fără plată, doar pe acest dispozitiv")}</small>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={!!stare?.demo}
                aria-label={t("Pro (demo)")}
                onClick={() => seteazaProDemo(!stare?.demo)}
                className="relative inline-flex h-7 w-12 flex-none items-center rounded-full border border-v3-line bg-v3-accent-soft p-0.5 aria-checked:border-v3-pos aria-checked:bg-v3-pos"
              >
                <span aria-hidden="true" className={`size-6 rounded-full bg-v3-card shadow transition-transform ${stare?.demo ? "translate-x-5" : ""}`} />
              </button>
            </div>
          )}

          <div className="mt-1 border-t border-v3-line pt-1.5">
            <Link href="/abonament" onClick={inchide} className={rand}>
              <Iconita d={ICONITE.pro} />
              {stare?.activ ? (
                <>
                  {t("Pro activ")} <span className="text-v3-pos">✓</span>
                  {stare.demo && <span className="text-[12px] font-normal text-v3-ink-2">· {t("demo")}</span>}
                </>
              ) : (
                t("Upgrade la Pro")
              )}
            </Link>
            {conectat && (
              <button type="button" onClick={() => signOut({ redirectTo: "/" })} className={rand}>
                <Iconita d={ICONITE.iesire} />
                {t("Ieși din cont")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
