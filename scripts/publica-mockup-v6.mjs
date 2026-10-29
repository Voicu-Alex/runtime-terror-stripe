// Copiază macheta v6 („Pentru tine” + „Noutăți”) în public/, ca aplicația Next.js s-o servească la /v6/.
// Rulează înainte de build și de dev (package.json: prebuild, predev). Sursa rămâne mockup/; copiile din public/ sunt în .gitignore.
import { cpSync, mkdirSync, rmSync } from "node:fs";

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
console.log("mockup v6 publicat în public/v6");
