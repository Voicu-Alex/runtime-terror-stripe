// Marca aplicației, desenată o singură dată pentru iconițe (app/icon.tsx, app/apple-icon.tsx) și pentru
// imaginea de previzualizare a linkului (app/opengraph-image.tsx). Culorile sunt cele din designul v3 F
// (app/globals.css): gri cald pentru logo, verde pentru bani în plus.
export const CULORI = {
  logo: "#44403C",
  hartie: "#FFFFFF",
  tenta: "#DEDBD8",
  tenta2: "#F1F0EE",
  cerneala: "#111827",
  verde: "#00853A",
  // moneda din iconiță: verdele de bani în plus din tema închisă, care se vede pe gri
  verdeDeschis: "#2EE873",
  gri: "#57534E",
} as const;

/** Iconița: buzunarul alb cusut, cu moneda verde, pe pătratul gri al logo-ului (același desen ca components/Logo.tsx). */
export function Insigna({ marime }: { marime: number }) {
  const semn = marime * 0.62;
  return (
    <div
      style={{
        width: marime,
        height: marime,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: CULORI.logo,
        borderRadius: marime * 0.22,
      }}
    >
      <svg width={semn * 0.9} height={semn} viewBox="0 0 36 40">
        <circle cx="22.5" cy="9" r="7" fill={CULORI.verdeDeschis} />
        <path d="M4 10.5h28v17.2c0 1-.5 1.9-1.3 2.4L18 38l-12.7-7.9C4.5 29.6 4 28.7 4 27.7z" fill="#FFFFFF" />
        <path d="M7.5 14v13.1L18 33.6l10.5-6.5V14" fill="none" stroke={CULORI.logo} strokeWidth="1.5" strokeDasharray="2.2 2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
