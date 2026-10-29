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
  gri: "#57534E",
} as const;

/** Pătratul cu „B” (Buzunar), ca în notificarea de pe landing page. */
export function Insigna({ marime }: { marime: number }) {
  return (
    <div
      style={{
        width: marime,
        height: marime,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: CULORI.logo,
        color: "#FFFFFF",
        fontSize: marime * 0.46,
        fontWeight: 800,
        letterSpacing: -marime * 0.02,
        borderRadius: marime * 0.22,
      }}
    >
      B
    </div>
  );
}
