// Contul (doar Google, auth.ts). Logica pură, testabilă.

/** Erorile pe care Auth.js le pune în `?error=` după o conectare eșuată. Cheile sunt textele din lib/i18n.ts. */
export function mesajEroareAuth(cod: string): string {
  switch (cod) {
    case "AccessDenied":
      return "Conectarea cu Google a fost anulată.";
    case "Configuration":
      return "Conectarea nu e configurată corect. Mai încearcă mai târziu.";
    default:
      return "Conectarea cu Google n-a mers. Mai încearcă o dată.";
  }
}

/** Doar căi din aplicație („/abonament”), ca un link din afară să nu ne trimită pe alt site. */
export function caleSigura(cale: unknown, implicit = "/flux"): string {
  if (typeof cale !== "string") return implicit;
  if (!cale.startsWith("/") || cale.startsWith("//") || cale.startsWith("/\\")) return implicit;
  return cale;
}
