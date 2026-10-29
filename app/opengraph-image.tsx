import { ImageResponse } from "next/og";
import { CULORI, Insigna } from "@/lib/marca";

// Imaginea care apare când linkul e trimis pe WhatsApp, Slack sau LinkedIn. În engleză, ca pitch-ul;
// cifra e cea din landing page (Legea 141/2025, art. III; calculul e în components/Acasa.tsx).
export const alt = "Ce înseamnă pentru mine: every new law, translated into lei per year for you";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraph() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: `linear-gradient(135deg, ${CULORI.tenta} 0%, ${CULORI.tenta2} 45%, ${CULORI.hartie} 100%)`,
        color: CULORI.cerneala,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Insigna marime={84} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 40, fontWeight: 800, color: CULORI.logo }}>Ce înseamnă pentru mine</div>
          <div style={{ fontSize: 22, letterSpacing: 4, color: CULORI.gri }}>THE LAW, IN YOUR MONEY</div>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", fontSize: 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>
        The law gave you 6 days to keep&nbsp;<span style={{ color: CULORI.verde }}>48,000 lei</span>. Did you know?
      </div>
      <div style={{ fontSize: 28, color: CULORI.gri }}>Every new Romanian law, in lei per year for you, with what you can do and by when.</div>
    </div>,
    size,
  );
}
