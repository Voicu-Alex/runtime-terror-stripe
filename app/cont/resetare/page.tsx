"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useLimba } from "@/components/Limba";
import { PAROLA_MINIM } from "@/lib/parola-reguli";

/** Linkul din emailul „Schimbă-ți parola”: omul alege o parolă nouă. */
export default function PaginaResetare() {
  const { t } = useLimba();
  const [parola, setParola] = useState("");
  const [lucreaza, setLucreaza] = useState(false);
  const [gata, setGata] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);

  async function trimite(ev: FormEvent) {
    ev.preventDefault();
    setLucreaza(true);
    setEroare(null);
    const token = new URLSearchParams(window.location.search).get("token");
    try {
      const r = await fetch("/api/cont/resetare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, parola }),
      });
      const j: { eroare?: string } = await r.json();
      if (!r.ok) throw new Error(j.eroare ?? "Eroare necunoscută.");
      setGata(true);
    } catch (e) {
      setEroare(e instanceof Error ? e.message : String(e));
    } finally {
      setLucreaza(false);
    }
  }

  return (
    <div className="mx-auto max-w-[460px]">
      <h1 className="m-0 font-head text-[32px] leading-[1.15] font-extrabold text-v3-ink">{gata ? t("Parola e schimbată.") : t("Alege o parolă nouă")}</h1>
      {gata ? (
        <Link href="/cont" className="mt-5 inline-flex min-h-[52px] items-center rounded-[12px] bg-v3-ink px-6 font-bold text-v3-on-ink no-underline">
          {t("Conectează-te")}
        </Link>
      ) : (
        <form onSubmit={trimite} className="mt-5 space-y-3">
          <label className="block">
            <span className="mb-1 block text-[13.5px] font-semibold text-v3-ink">{t("Parola nouă")}</span>
            <input
              type="password"
              required
              minLength={PAROLA_MINIM}
              autoComplete="new-password"
              value={parola}
              onChange={(e) => setParola(e.target.value)}
              className="min-h-12 w-full rounded-[10px] border border-v3-line bg-v3-card px-3.5 text-[16px] text-v3-ink"
            />
            <span className="mt-1 block text-[12.5px] text-v3-ink-2">{t("Cel puțin 8 caractere.")}</span>
          </label>
          <button
            type="submit"
            disabled={lucreaza}
            className="inline-flex min-h-[52px] w-full items-center justify-center rounded-[12px] bg-v3-ink px-6 font-bold text-v3-on-ink disabled:opacity-60"
          >
            {lucreaza ? t("Așteaptă…") : t("Salvează parola")}
          </button>
          {eroare && (
            <p role="alert" className="m-0 rounded-lg border border-v3-urg bg-v3-urg-soft p-3 text-sm text-v3-urg">
              {eroare}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
