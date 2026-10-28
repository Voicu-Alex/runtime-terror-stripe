"use client";

import { useEffect, useState } from "react";
import { incarcaAbonament, type StareAbonament } from "@/lib/abonament";

/**
 * Abonamentul de pe dispozitiv, verificat la Stripe prin server. null = încă se verifică.
 * Fără ID salvat, sau dacă Stripe spune că nu e activ (anulat, plată eșuată): activ = false.
 */
export function useAbonament(): { stare: StareAbonament | null; sub: string | null } {
  const [stare, setStare] = useState<StareAbonament | null>(null);
  const [sub, setSub] = useState<string | null>(null);

  useEffect(() => {
    const id = incarcaAbonament();
    setSub(id);
    if (!id) {
      setStare({ activ: false, status: null, panaLa: null, seOpreste: false });
      return;
    }
    let anulat = false;
    fetch(`/api/abonament/stare?sub=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((s: StareAbonament) => !anulat && setStare({ activ: !!s.activ, status: s.status ?? null, panaLa: s.panaLa ?? null, seOpreste: !!s.seOpreste }))
      .catch(() => !anulat && setStare({ activ: false, status: null, panaLa: null, seOpreste: false }));
    return () => {
      anulat = true;
    };
  }, []);

  return { stare, sub };
}
