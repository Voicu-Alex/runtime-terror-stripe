/**
 * Clientul politicos pentru legislatie.just.ro: o cerere pe rând, pauză fixă între cereri, reîncercare cu
 * așteptare la erori, plafon de cereri pe rulare. E singurul loc din repo care vorbește cu Portalul la volum.
 */

export const USER_AGENT_PORTAL = "ce-inseamna-pentru-mine/0.1 (hackathon; github.com/Voicu-Alex/runtime-terror-stripe)";

export type RaspunsPortal = { status: number; text: string };

export type OptiuniClientPortal = {
  fetch?: typeof fetch;
  /** Pauza fixă dintre două cereri, în ms. */
  pauzaMs?: number;
  /** Plafonul de cereri HTTP pe rulare (reîncercările se numără). */
  max?: number;
  /** Așteptările înaintea reîncercărilor, în ms. După ultima, dacă tot eșuează, rularea se oprește. */
  asteptariReincercare?: number[];
  userAgent?: string;
  /** Implicit setTimeout, deci merge cu fake timers. */
  somn?: (ms: number) => Promise<void>;
};

/** S-a atins plafonul `--max`: oprire curată. */
export class PlafonAtins extends Error {
  constructor(public readonly max: number) {
    super(`Plafonul de ${max} cereri a fost atins.`);
    this.name = "PlafonAtins";
  }
}

/** Portalul a refuzat sau n-a răspuns și după toate reîncercările: oprire curată. */
export class PortalIndisponibil extends Error {
  constructor(public readonly url: string, public readonly motiv: string) {
    super(`Portalul nu răspunde la ${url}: ${motiv}`);
    this.name = "PortalIndisponibil";
  }
}

const somnImplicit = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Erori care merită reîncercate: 403, 429, 5xx. */
const esteEroareDeReincercat = (status: number) => status === 403 || status === 429 || status >= 500;

export class ClientPortal {
  cereri = 0;
  status200 = 0;
  status404 = 0;
  statusAlte = 0;
  erori: string[] = [];

  private readonly fetchFn: typeof fetch;
  private readonly pauzaMs: number;
  private readonly max: number;
  private readonly asteptari: number[];
  private readonly userAgent: string;
  private readonly somn: (ms: number) => Promise<void>;
  private amCerutDeja = false;

  constructor(o: OptiuniClientPortal = {}) {
    this.fetchFn = o.fetch ?? ((...a) => fetch(...a));
    this.pauzaMs = o.pauzaMs ?? 2000;
    this.max = o.max ?? 1500;
    this.asteptari = o.asteptariReincercare ?? [30_000, 120_000];
    this.userAgent = o.userAgent ?? USER_AGENT_PORTAL;
    this.somn = o.somn ?? somnImplicit;
  }

  /** O cerere cu pauză, reîncercări și numărătoare. 404 nu e eroare: se întoarce ca atare. */
  async ia(url: string, init: RequestInit = {}): Promise<RaspunsPortal> {
    for (let incercare = 0; ; incercare++) {
      if (this.cereri >= this.max) throw new PlafonAtins(this.max);
      // Prima cerere pleacă imediat; apoi pauza fixă, iar înaintea unei reîncercări așteptarea ei.
      if (incercare > 0) await this.somn(this.asteptari[incercare - 1]);
      else if (this.amCerutDeja) await this.somn(this.pauzaMs);
      this.amCerutDeja = true;
      this.cereri++;

      let motiv: string;
      try {
        const r = await this.fetchFn(url, { ...init, headers: { ...(init.headers as Record<string, string> | undefined), "User-Agent": this.userAgent } });
        const text = await r.text();
        if (r.status === 404) this.status404++;
        else if (r.status >= 200 && r.status < 300) this.status200++;
        else this.statusAlte++;
        if (!esteEroareDeReincercat(r.status)) return { status: r.status, text };
        motiv = `HTTP ${r.status}`;
      } catch (e) {
        this.statusAlte++;
        motiv = `eroare de rețea: ${e instanceof Error ? e.message : String(e)}`;
      }

      this.erori.push(`${url}: ${motiv}`);
      if (incercare >= this.asteptari.length) throw new PortalIndisponibil(url, motiv);
    }
  }
}
