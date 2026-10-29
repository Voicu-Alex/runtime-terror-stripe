import { ImageResponse } from "next/og";
import { Insigna } from "@/lib/marca";

// Iconița din tab și din manifest (Android o folosește la „Adaugă pe ecranul principal”).
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<Insigna marime={512} />, size);
}
