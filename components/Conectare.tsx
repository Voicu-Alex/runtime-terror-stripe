"use client";

import Link from "next/link";
import { signIn, signOut } from "next-auth/react";
import { useLimba } from "@/components/Limba";

function IconitaGoogle() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// Contul: intrarea și contul nou sunt același pas cu Google (prima conectare îți face contul).
type Props = { email: string | null; inapoi: string; eroare: string | null };

const card = "rounded-3xl border border-v3-line bg-v3-card px-5 py-8 sm:px-8";
const titlu = "m-0 font-head text-[clamp(26px,6vw,34px)] leading-[1.12] font-extrabold tracking-[-.015em] text-v3-ink";

export function Conectare({ email, inapoi, eroare }: Props) {
  const { t } = useLimba();

  if (email)
    return (
      <section className={card}>
        <h1 className={titlu}>{t("Ești în cont")}</h1>
        <p className="m-0 mt-3 text-[16px] text-v3-ink-soft">
          {t("Conectat ca")} <b className="text-v3-ink">{email}</b>
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/flux" className="inline-flex min-h-11 items-center rounded-[10px] bg-v3-ink px-[18px] font-bold text-v3-on-ink no-underline">
            {t("Fluxul meu")}
          </Link>
          <Link href="/abonament" className="inline-flex min-h-11 items-center rounded-[10px] border border-v3-line bg-v3-card px-[18px] font-semibold text-v3-ink no-underline">
            {t("Abonament")}
          </Link>
          <button type="button" onClick={() => signOut({ redirectTo: "/conectare" })} className="min-h-11 rounded-[10px] px-3 font-semibold text-v3-ink underline decoration-v3-line underline-offset-2">
            {t("Ieși din cont")}
          </button>
        </div>
      </section>
    );

  return (
    <section className={card}>
      <h1 className={titlu}>{t("Intră în cont")}</h1>
      <p className="m-0 mt-2 text-[15.5px] text-v3-ink-2">
        {t("Prima conectare cu Google îți face contul. Contul ține abonamentul și deblocările tale pe orice telefon.")}
      </p>
      {eroare && (
        <p role="alert" className="m-0 mt-4 rounded-lg border border-v3-urg bg-v3-urg-soft p-3 text-sm text-v3-urg">
          {t(eroare)}
        </p>
      )}
      <button
        type="button"
        onClick={() => signIn("google", { redirectTo: inapoi })}
        className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-[12px] border border-v3-line bg-v3-card px-6 text-[16px] font-bold text-v3-ink"
      >
        <IconitaGoogle />
        {t("Continuă cu Google")}
      </button>
    </section>
  );
}
