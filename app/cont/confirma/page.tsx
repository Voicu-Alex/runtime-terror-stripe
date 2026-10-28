"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLimba } from "@/components/Limba";

/** Linkul din emailul de confirmare. Confirmarea se face cu un POST, după ce pagina s-a deschis. */
export default function PaginaConfirma() {
  const { t } = useLimba();
  const [stare, setStare] = useState<"verific" | "ok" | "eroare">("verific");
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    fetch("/api/cont/confirma", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then(async (r) => {
        const j: { eroare?: string } = await r.json();
        if (r.ok) setStare("ok");
        else {
          setMesaj(j.eroare ?? "");
          setStare("eroare");
        }
      })
      .catch(() => setStare("eroare"));
  }, []);

  return (
    <div className="mx-auto max-w-[460px]">
      {stare === "verific" && <p className="m-0 text-[17px] text-v3-ink-2">{t("Confirmăm emailul…")}</p>}
      {stare === "ok" && (
        <>
          <h1 className="m-0 font-head text-[32px] leading-[1.15] font-extrabold text-v3-ink">{t("Emailul e confirmat.")}</h1>
          <p className="m-0 mt-2 text-[16px] text-v3-ink-2">{t("Acum te poți conecta cu emailul și parola.")}</p>
          <Link href="/cont?dupa=/abonament" className="mt-5 inline-flex min-h-[52px] items-center rounded-[12px] bg-v3-ink px-6 font-bold text-v3-on-ink no-underline">
            {t("Conectează-te")}
          </Link>
        </>
      )}
      {stare === "eroare" && (
        <>
          <h1 className="m-0 font-head text-[28px] font-extrabold text-v3-ink">{t("Nu am putut confirma emailul")}</h1>
          <p className="m-0 mt-2 text-[16px] text-v3-ink-2">{mesaj || t("Încearcă din nou.")}</p>
          <Link href="/cont" className="mt-5 inline-flex min-h-11 items-center rounded-[10px] border border-v3-line px-[18px] font-semibold text-v3-ink no-underline">
            {t("Înapoi la cont")}
          </Link>
        </>
      )}
    </div>
  );
}
