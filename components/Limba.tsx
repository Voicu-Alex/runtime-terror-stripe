"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { esteLimba, incarcaLimba, salveazaLimba, traduce, type Limba } from "@/lib/i18n";

type Ctx = { limba: Limba; t: (text: string) => string; setLimba: (l: Limba) => void };

const LimbaContext = createContext<Ctx>({ limba: "ro", t: (x) => x, setLimba: () => {} });

/** Limba interfeței: ?lang=en o impune (pentru demo), altfel ce a ales omul (localStorage), altfel română. */
export function LimbaProvider({ children }: { children: ReactNode }) {
  const [limba, setLimbaStare] = useState<Limba>("ro");

  // window.location, nu useSearchParams: acela ar cere un Suspense peste toată pagina la prerender.
  useEffect(() => {
    const dinUrl = new URLSearchParams(window.location.search).get("lang");
    if (esteLimba(dinUrl)) {
      setLimbaStare(dinUrl);
      salveazaLimba(dinUrl);
    } else setLimbaStare(incarcaLimba());
  }, []);

  useEffect(() => {
    document.documentElement.lang = limba;
  }, [limba]);

  function setLimba(l: Limba) {
    setLimbaStare(l);
    salveazaLimba(l);
  }

  return <LimbaContext.Provider value={{ limba, t: (x) => traduce(limba, x), setLimba }}>{children}</LimbaContext.Provider>;
}

export function useLimba(): Ctx {
  return useContext(LimbaContext);
}

/** Comutatorul RO | EN din antet. */
export function ComutatorLimba() {
  const { limba, setLimba } = useLimba();
  return (
    <span className="ml-auto inline-flex rounded-lg border border-stone-300 text-xs font-semibold" role="group" aria-label="Limba / Language">
      {(["ro", "en"] as Limba[]).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={limba === l}
          onClick={() => setLimba(l)}
          className={`min-h-8 px-2.5 uppercase ${limba === l ? "bg-stone-900 text-white" : "text-stone-600"}`}
        >
          {l}
        </button>
      ))}
    </span>
  );
}

/** Un text tradus, pentru paginile randate pe server. */
export function T({ k }: { k: string }) {
  const { t } = useLimba();
  return <>{t(k)}</>;
}
