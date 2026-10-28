"use client";

import { useEffect, useState } from "react";
import { useLimba } from "@/components/Limba";

type Tema = "light" | "dark";

const CHEIE = "cipm.tema.v1";

/**
 * Rulează în <head>, înainte de prima afișare: pune tema pe <html data-theme>, ca pagina să nu clipească
 * în tema greșită. Ce a ales omul (localStorage) câștigă; altfel, tema sistemului.
 */
export const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("${CHEIE}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;

function alesa(): Tema | null {
  try {
    const t = window.localStorage.getItem(CHEIE);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

/** Comutatorul de temă din antet. Tema se schimbă instant, fără animație. */
export function ComutatorTema() {
  const { t } = useLimba();
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    setTema(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    // Cât timp omul n-a ales, urmăm tema sistemului și când se schimbă (de exemplu seara).
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const laSchimbare = (e: MediaQueryListEvent) => {
      if (alesa()) return;
      const t: Tema = e.matches ? "dark" : "light";
      document.documentElement.dataset.theme = t;
      setTema(t);
    };
    mq.addEventListener("change", laSchimbare);
    return () => mq.removeEventListener("change", laSchimbare);
  }, []);

  function comuta() {
    const urmatoarea: Tema = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    try {
      window.localStorage.setItem(CHEIE, urmatoarea);
    } catch {
      // storage blocat: tema rămâne doar pentru sesiunea asta
    }
    document.documentElement.dataset.theme = urmatoarea;
    setTema(urmatoarea);
  }

  const inchisa = tema === "dark";
  return (
    <button
      type="button"
      onClick={comuta}
      aria-pressed={inchisa}
      aria-label={t("Temă închisă")}
      title={inchisa ? t("Treci la tema deschisă") : t("Treci la tema închisă")}
      className="inline-flex size-8 items-center justify-center rounded-lg border border-v3-line bg-v3-card text-v3-ink hover:border-v3-accent"
    >
      {/* Iconița arată tema în care treci: lună în tema deschisă, soare în cea închisă. Până la hidratare, nimic. */}
      {tema && (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px] fill-none stroke-current stroke-[1.8]" strokeLinecap="round" strokeLinejoin="round">
          {inchisa ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
            </>
          ) : (
            <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
          )}
        </svg>
      )}
    </button>
  );
}
