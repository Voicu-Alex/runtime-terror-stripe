"use client";

import { useEffect, useState } from "react";
import { FARA_ABONAMENT, type StareAbonament } from "@/lib/abonament";

/**
 * Starea Pro a celui conectat, verificată la Stripe prin server. null = încă se verifică.
 * Neconectat, sau abonament oprit (anulat, plată eșuată): activ = false.
 */
export function useAbonament(): StareAbonament | null {
  const [stare, setStare] = useState<StareAbonament | null>(null);

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

  return stare;
}
