// Limita de folosire pentru rutele care plătesc un apel la Claude (cheia unui coleg, pe un link public).
// Ține socoteala în memoria procesului: pe Vercel fiecare instanță are contorul ei și îl pierde la repornire,
// deci e o frână pentru demo, nu o garanție. O limită exactă ar cere un contor comun (de exemplu în Supabase).

export type Limite = {
  /** câte cereri poate face o adresă într-o fereastră */
  peAdresa: number;
  /** fereastra pentru limita pe adresă, în ms */
  fereastraMs: number;
  /** câte cereri pe zi (UTC), pentru toți la un loc */
  peZi: number;
};

export type Verdict = { permis: true } | { permis: false; motiv: "adresa" | "zi"; reincearcaInSec: number };

type Stare = { zi: string; total: number; adrese: Map<string, number[]> };

export function limiteDinEnv(env: Record<string, string | undefined>): Limite {
  const numar = (v: string | undefined, implicit: number) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : implicit;
  };
  return {
    peAdresa: numar(env.LIMITA_DOCUMENTE_PE_ORA, 5),
    fereastraMs: 60 * 60 * 1000,
    peZi: numar(env.LIMITA_DOCUMENTE_PE_ZI, 150),
  };
}

/** Un contor nou. Rutele țin unul la nivel de modul; testele își fac câte unul. */
export function contorNou(): Stare {
  return { zi: "", total: 0, adrese: new Map() };
}

/** Verifică și, dacă e permis, numără cererea. `acum` vine din afară, ca să se poată testa. */
export function inregistreaza(stare: Stare, adresa: string, limite: Limite, acum: number): Verdict {
  const zi = new Date(acum).toISOString().slice(0, 10);
  if (stare.zi !== zi) {
    stare.zi = zi;
    stare.total = 0;
    stare.adrese.clear();
  }
  if (stare.total >= limite.peZi) {
    const maine = Date.parse(`${zi}T00:00:00Z`) + 86_400_000;
    return { permis: false, motiv: "zi", reincearcaInSec: Math.ceil((maine - acum) / 1000) };
  }
  const recente = (stare.adrese.get(adresa) ?? []).filter((t) => acum - t < limite.fereastraMs);
  if (recente.length >= limite.peAdresa) {
    return { permis: false, motiv: "adresa", reincearcaInSec: Math.ceil((recente[0] + limite.fereastraMs - acum) / 1000) };
  }
  recente.push(acum);
  stare.adrese.set(adresa, recente);
  stare.total += 1;
  return { permis: true };
}

/** Adresa clientului din antetele puse de Vercel (sau de orice proxy); „necunoscut” dacă lipsesc. */
export function adresaDin(antete: Headers): string {
  return antete.get("x-forwarded-for")?.split(",")[0]?.trim() || antete.get("x-real-ip") || "necunoscut";
}
