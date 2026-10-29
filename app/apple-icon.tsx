import { ImageResponse } from "next/og";
import { CULORI, Insigna } from "@/lib/marca";

// Iconița de pe ecranul principal al iPhone-ului: iOS rotunjește singur colțurile, deci fundalul e plin.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: 180, height: 180, display: "flex", background: CULORI.logo }}>
      <Insigna marime={180} />
    </div>,
    size,
  );
}
