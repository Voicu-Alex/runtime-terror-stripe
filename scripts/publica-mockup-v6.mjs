// Copiază macheta v6 („Pentru tine” + „Noutăți”) în public/, ca aplicația Next.js s-o servească la /v6/.
// Rulează înainte de build și de dev (package.json: prebuild, predev). Sursa rămâne mockup/; copiile din public/ sunt în .gitignore.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import './genereaza-solutii.mjs';

const fisiere = [
  ["mockup/v6", "public/v6"],
  ["mockup/v5/base.css", "public/v5/base.css"],
  ["mockup/v5/common.js", "public/v5/common.js"],
  ["mockup/v4/data.js", "public/v4/data.js"],
];
for (const d of ["public/v4", "public/v5", "public/v6"]) rmSync(d, { recursive: true, force: true });
for (const [src, dst] of fisiere) {
  mkdirSync(dst.replace(/\/[^/]+\.\w+$/, ""), { recursive: true });
  cpSync(src, dst, { recursive: true, filter: (f) => !f.endsWith(".test.js") });
}
// v6 e și pagina principală (next.config.ts o servește la /): cu <base>, căile relative din ea
// (../v5/base.css, noutati.js) se rezolvă la fel și la /, și la /v6/index.html. Sursa din mockup/ rămâne neatinsă.
const index = "public/v6/index.html";
// Fiind statică, pagina nu primește metadatele din app/layout.tsx: titlul, iconița, manifestul și previzualizarea
// linkului (Open Graph) le punem aici, spre rutele aplicației (app/icon.tsx, app/manifest.ts, app/opengraph-image.tsx).
const site = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://descriere.andreidobrin.com";
const meta = [
  '<base href="/v6/">',
  '<link rel="icon" href="/icon">',
  '<link rel="apple-touch-icon" href="/apple-icon">',
  '<link rel="manifest" href="/manifest.webmanifest">',
  '<meta name="theme-color" content="#FFFFFF">',
  '<meta name="description" content="Fiecare lege nouă, tradusă în lei pentru tine.">',
  '<meta property="og:title" content="Ce înseamnă pentru mine">',
  '<meta property="og:description" content="Every new Romanian law, in lei for you, with what you can do and by when.">',
  `<meta property="og:image" content="${site}/opengraph-image">`,
  '<meta name="twitter:card" content="summary_large_image">',
].join("\n");
writeFileSync(
  index,
  readFileSync(index, "utf8")
    .replace("<head>", `<head>\n${meta}`)
    .replace(/<title>[^<]*<\/title>/, "<title>Ce înseamnă pentru mine</title>"),
);
console.log("mockup v6 publicat în public/v6");
