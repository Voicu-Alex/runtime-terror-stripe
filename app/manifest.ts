import type { MetadataRoute } from "next";

// Manifestul pentru „Adaugă pe ecranul principal”: aplicația se deschide pe tot ecranul, ca una instalată.
// Fără service worker deocamdată: un cache vechi ar putea arăta juriului o versiune trecută după un deploy.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ce înseamnă pentru mine",
    short_name: "Ce înseamnă",
    description: "Fiecare lege nouă, tradusă în lei pe lună pentru tine. / Every new law, translated into lei per month for you.",
    start_url: "/flux",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    lang: "ro",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
