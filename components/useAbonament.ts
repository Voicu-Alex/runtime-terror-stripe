"use client";

import { useEffect, useState } from "react";
import { FARA_ABONAMENT, type StareAbonament } from "@/lib/abonament";

// Pro de demo: un comutator în meniul contului care arată aplicația ca și cum ai plătit, fără Stripe.
// Ține doar în browserul tău (localStorage); serverul și Stripe nu știu de el.
const CHEIE_DEMO = "cipm.pro-demo.v1";
const EVENIMENT_DEMO = "cipm-pro-demo";

export function citesteProDemo(): boolean {
  try {
    return window.localStorage.getItem(CHEIE_DEMO) === "1";
  } catch {
    return false;
  }
}

export function seteazaProDemo(pornit: boolean) {
  try {
    if (pornit) window.localStorage.setItem(CHEIE_DEMO, "1");
    else window.localStorage.removeItem(CHEIE_DEMO);
  } catch {
    // storage blocat: comutatorul ține până la reîncărcare
  }
  window.dispatchEvent(new CustomEvent(EVENIMENT_DEMO, { detail: pornit }));
}

/** Starea demo, urmărită pe toată pagina: toate locurile care citesc Pro se schimbă deodată. */
export function useProDemo(): boolean {
  const [pornit, setPornit] = useState(false);
  useEffect(() => {
    setPornit(citesteProDemo());
    const laSchimbare = (e: Event) => setPornit(e instanceof CustomEvent ? !!e.detail : citesteProDemo());
    const dinAltTab = (e: StorageEvent) => e.key === CHEIE_DEMO && setPornit(citesteProDemo());
    window.addEventListener(EVENIMENT_DEMO, laSchimbare);
    window.addEventListener("storage", dinAltTab);
    return () => {
      window.removeEventListener(EVENIMENT_DEMO, laSchimbare);
      window.removeEventListener("storage", dinAltTab);
    };
  }, []);
  return pornit;
}

/**
 * Starea Pro a celui conectat, verificată la Stripe prin server. null = încă se verifică.
 * Neconectat, sau abonament oprit (anulat, plată eșuată): activ = false.
 * Cu Pro de demo pornit: activ = true și demo = true, fără să mai așteptăm serverul.
 */
export function useAbonament(): StareAbonament | null {
  const [stare, setStare] = useState<StareAbonament | null>(null);
  const demo = useProDemo();

  useEffect(() => {
    let anulat = false;
    fetch("/api/abonament/stare")
      .then((r) => r.json())
      .then((s: StareAbonament) => !anulat && setStare({ ...FARA_ABONAMENT, ...s, activ: !!s.activ, conectat: !!s.conectat }))
      .catch(() => !anulat && setStare(FARA_ABONAMENT));
    return () => {
      anulat = true;
    };
  }, []);

  if (demo && !stare?.activ) return { ...(stare ?? FARA_ABONAMENT), activ: true, demo: true };
  return stare;
}
