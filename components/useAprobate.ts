"use client";

import { useEffect, useMemo, useState } from "react";
import type { Schimbare } from "@/lib/catalog";
import { CHEIE_APROBARI, aprobateCaSchimbari, incarcaAprobari, type Aprobare } from "@/lib/inbox";

/** Aprobările din /admin, ținute la zi și când se aprobă din alt tab (evenimentul „storage”). */
export function useAprobari(): [Aprobare[], (lista: Aprobare[]) => void] {
  const [lista, setLista] = useState<Aprobare[]>([]);
  useEffect(() => {
    setLista(incarcaAprobari());
    const laSchimbare = (e: StorageEvent) => {
      if (e.key === CHEIE_APROBARI) setLista(incarcaAprobari());
    };
    window.addEventListener("storage", laSchimbare);
    return () => window.removeEventListener("storage", laSchimbare);
  }, []);
  return [lista, setLista];
}

/** Actele aprobate, ca acte de catalog, gata de potrivit cu profilul. */
export function useAprobate(): Schimbare[] {
  const [lista] = useAprobari();
  return useMemo(() => aprobateCaSchimbari(lista), [lista]);
}
