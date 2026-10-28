"use client";

import Link from "next/link";
import { ComutatorLimba, useLimba } from "@/components/Limba";

export function Antet() {
  const { t } = useLimba();
  return (
    <header className="border-b border-stone-200 bg-white">
      <nav className="mx-auto flex max-w-2xl items-center gap-5 px-4 py-3 text-sm">
        <Link href="/" className="font-semibold">
          Ce înseamnă pentru mine
        </Link>
        <Link href="/notificare" className="text-stone-600 hover:text-stone-900">
          {t("Azi")}
        </Link>
        <Link href="/flux" className="text-stone-600 hover:text-stone-900">
          {t("Flux")}
        </Link>
        <Link href="/profil" className="text-stone-600 hover:text-stone-900">
          {t("Profil")}
        </Link>
        <ComutatorLimba />
      </nav>
    </header>
  );
}

export function Subsol() {
  const { t, limba } = useLimba();
  return (
    <footer className="mx-auto max-w-2xl px-4 pb-8 text-xs text-stone-500">
      {/* AI Act, art. 50: conținutul generat cu AI e marcat pe fiecare ecran, nu doar unde apare. */}
      {t("Analiză generată cu AI, verifică etichetele. Informare, nu consultanță financiară sau juridică. Profilul rămâne pe dispozitivul tău.")}
      {limba === "en" && <> {t("Textele legilor sunt în română.")}</>}
    </footer>
  );
}
