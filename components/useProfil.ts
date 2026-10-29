"use client";

import { useEffect, useSyncExternalStore } from "react";
import { abonareProfil, incarcaProfil, profilCurent, type Profil } from "@/lib/profil";

/** Profilul de pe dispozitiv; null până se citește localStorage (la prima randare pe client). */
export function useProfil(): Profil | null {
  const profil = useSyncExternalStore(abonareProfil, profilCurent, () => null);
  useEffect(() => { incarcaProfil(); }, []);
  return profil;
}
