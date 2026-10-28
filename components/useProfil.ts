"use client";

import { useEffect, useState } from "react";
import { incarcaProfil, type Profil } from "@/lib/profil";

/** Profilul de pe dispozitiv; null până se citește localStorage (la prima randare pe client). */
export function useProfil(): Profil | null {
  const [profil, setProfil] = useState<Profil | null>(null);
  useEffect(() => setProfil(incarcaProfil()), []);
  return profil;
}
