"use client";

import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { useLimba } from "@/components/Limba";
import { PAROLA_MINIM } from "@/lib/parola-reguli";

// Conectarea (docs/adr/0003-conturi-email.md): cu Google sau cu un cont al aplicației (email și parolă).
// Contul cu email se folosește doar după ce emailul e confirmat din linkul primit.

type Mod = "conectare" | "creare" | "uitat";

export function IconitaGoogle() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

const CAMP = "min-h-12 w-full rounded-[10px] border border-v3-line bg-v3-card px-3.5 text-[16px] text-v3-ink placeholder:text-v3-ink-2";
const BUTON = "inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-[12px] px-6 text-[16px] font-bold disabled:opacity-60";

/** `dupa`: unde se întoarce omul după conectare (de exemplu /abonament, ca să treacă la plată). */
export function Conectare({ dupa = "/flux" }: { dupa?: string }) {
  const { t } = useLimba();
  const [mod, setMod] = useState<Mod>("conectare");
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [lucreaza, setLucreaza] = useState(false);
  const [eroare, setEroare] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState<string | null>(null);

  function schimba(m: Mod) {
    setMod(m);
    setEroare(null);
    setMesaj(null);
  }

  async function trimite(ev: FormEvent) {
    ev.preventDefault();
    setLucreaza(true);
    setEroare(null);
    setMesaj(null);
    try {
      if (mod === "conectare") {
        const r = await signIn("parola", { email, parola, redirect: false });
        if (r?.error) {
          setEroare(
            r.code === "neconfirmat"
              ? t("Emailul nu e confirmat încă. Deschide linkul din emailul de confirmare.")
              : t("Emailul sau parola nu sunt corecte."),
          );
        } else window.location.assign(dupa);
      } else {
        const cale = mod === "creare" ? "/api/cont/inregistrare" : "/api/cont/resetare-cerere";
        const r = await fetch(cale, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(mod === "creare" ? { email, parola } : { email }),
        });
        const j: { eroare?: string } = await r.json();
        if (!r.ok) throw new Error(j.eroare ?? "Eroare necunoscută.");
        setMesaj(
          mod === "creare"
            ? t("Ți-am trimis un email de confirmare. Deschide linkul din el, apoi conectează-te.")
            : t("Dacă există un cont cu emailul ăsta, ți-am trimis un link ca să-ți alegi o parolă nouă."),
        );
      }
    } catch (e) {
      setEroare(e instanceof Error ? e.message : String(e));
    } finally {
      setLucreaza(false);
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <button
        type="button"
        onClick={() => signIn("google", { redirectTo: dupa })}
        className={`${BUTON} border border-v3-line bg-v3-card text-v3-ink hover:border-v3-accent`}
      >
        <IconitaGoogle />
        {t("Continuă cu Google")}
      </button>

      <p className="my-4 flex items-center gap-3 text-[13px] font-semibold text-v3-ink-2 before:h-px before:flex-1 before:bg-v3-line after:h-px after:flex-1 after:bg-v3-line">
        {t("sau cu email")}
      </p>

      <form onSubmit={trimite} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-[13.5px] font-semibold text-v3-ink">{t("Email")}</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={CAMP} />
        </label>
        {mod !== "uitat" && (
          <label className="block">
            <span className="mb-1 block text-[13.5px] font-semibold text-v3-ink">{t("Parolă")}</span>
            <input
              type="password"
              required
              minLength={mod === "creare" ? PAROLA_MINIM : undefined}
              autoComplete={mod === "creare" ? "new-password" : "current-password"}
              value={parola}
              onChange={(e) => setParola(e.target.value)}
              className={CAMP}
            />
            {mod === "creare" && <span className="mt-1 block text-[12.5px] text-v3-ink-2">{t("Cel puțin 8 caractere.")}</span>}
          </label>
        )}
        <button type="submit" disabled={lucreaza} className={`${BUTON} bg-v3-ink text-v3-on-ink hover:bg-v3-ink-strong`}>
          {lucreaza
            ? t("Așteaptă…")
            : mod === "conectare"
              ? t("Conectează-te")
              : mod === "creare"
                ? t("Creează contul")
                : t("Trimite linkul")}
        </button>
      </form>

      {eroare && (
        <p role="alert" className="m-0 mt-3 rounded-lg border border-v3-urg bg-v3-urg-soft p-3 text-sm text-v3-urg">
          {eroare}
        </p>
      )}
      {mesaj && (
        <p role="status" className="m-0 mt-3 rounded-lg border border-v3-pos/30 bg-v3-pos-soft p-3 text-sm text-v3-ink">
          {mesaj}
        </p>
      )}

      <p className="m-0 mt-4 flex flex-wrap justify-between gap-2 text-[14px]">
        {mod === "conectare" ? (
          <>
            <button type="button" onClick={() => schimba("creare")} className="font-semibold text-v3-ink underline decoration-v3-line underline-offset-2">
              {t("Nu ai cont? Creează unul")}
            </button>
            <button type="button" onClick={() => schimba("uitat")} className="text-v3-ink-2 underline decoration-v3-line underline-offset-2">
              {t("Ai uitat parola?")}
            </button>
          </>
        ) : (
          <button type="button" onClick={() => schimba("conectare")} className="font-semibold text-v3-ink underline decoration-v3-line underline-offset-2">
            {t("Ai deja cont? Conectează-te")}
          </button>
        )}
      </p>
    </div>
  );
}
