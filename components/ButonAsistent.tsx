"use client";

import { useAsistent } from "@/components/AsistentProvider";
import { useLimba } from "@/components/Limba";

/** Conversația completează formularul existent, fără să înlocuiască pagina de profil. */
export function ButonAsistent() {
  const { openChat } = useAsistent();
  const { t } = useLimba();
  return <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-v3-line bg-v3-card p-4">
    <div>
      <h2 className="m-0 font-head text-[18px] font-bold text-v3-ink">{t("Asistentul tău")}</h2>
      <p className="mt-1 mb-0 text-[15px] text-v3-ink-2">{t("Întreabă despre legi sau spune-mi ce situație ai.")}</p>
    </div>
    <button type="button" onClick={() => openChat(undefined, "personal")} className="min-h-11 rounded-lg bg-v3-ink px-4 text-sm font-bold text-v3-on-ink hover:bg-v3-ink-strong">
      {t("Deschide conversația")}
    </button>
  </section>;
}
