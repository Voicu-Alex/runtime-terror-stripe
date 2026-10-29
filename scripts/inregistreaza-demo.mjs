#!/usr/bin/env node
/**
 * Filmează scenele pentru video-ul de pitch (docs/pitch/scenariu-video.md), în engleză, pe telefon și pe desktop.
 * Rezultatul: captures/video/<scena>.webm, gata de pus în montaj (CapCut, DaVinci, Premiere acceptă .webm).
 *
 *   npm i --no-save playwright-core            # o singură dată; nu intră în package.json
 *   npx next build && PRO_DESCHIS_DEMO=1 npx next start -p 3100
 *   node scripts/inregistreaza-demo.mjs [http://localhost:3100] [scena...]
 *
 * Folosește Chrome-ul instalat (CHROME=... pentru altă cale). Dacă Playwright cere ffmpeg: `npx playwright-core install ffmpeg`.
 * Fără nume de scenă le filmează pe toate. Nicio scenă nu apelează API-ul Anthropic (documentul e din test-docs/, mod demo).
 */
import { mkdirSync, renameSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const RAD = path.join(import.meta.dirname, "..");
const BAZA = process.argv[2]?.startsWith("http") ? process.argv[2] : "http://localhost:3100";
const ALESE = process.argv.slice(2).filter((x) => !x.startsWith("http"));
const OUT = path.join(RAD, "captures/video");
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
mkdirSync(OUT, { recursive: true });

// Playwright filmează la mărimea viewport-ului (fără deviceScaleFactor), deci telefonul e un iPhone 14 Pro Max
// la 430×932: încape întreg într-un cadru 1080p, lângă clipul de desktop.
const TELEFON = { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true };
const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };

/** Derulare lină, ca în video să se poată citi. */
async function deruleaza(page, px, pasi = 30) {
  for (let i = 0; i < pasi; i++) {
    await page.mouse.wheel(0, px / pasi);
    await page.waitForTimeout(25);
  }
}

const SCENE = {
  // 0:00–0:20 cârligul: cazul real cu 48.000 de lei și notificarea pe care ai fi primit-o
  async "01-carlig"(page) {
    await page.goto(`${BAZA}/?lang=en`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    await deruleaza(page, 1150, 60);
    await page.waitForTimeout(2500);
    await deruleaza(page, 900, 50);
    await page.waitForTimeout(2500);
  },
  // 0:20–0:50 profilul din document: fluturașul (mod demo), etichetele intră singure
  async "02-profil"(page) {
    await page.goto(`${BAZA}/profil?lang=en`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.locator('input[type="file"]').setInputFiles(path.join(RAD, "test-docs/fluturas-salariu.png"));
    await page.waitForTimeout(3000);
    await deruleaza(page, 400);
    await page.waitForTimeout(2000);
    await page.getByRole("link", { name: /See your feed/ }).click();
    await page.waitForURL("**/flux");
    await page.waitForTimeout(2500);
  },
  // 0:50–1:40 fluxul: articolul principal, cifrele, un card deschis, „O fac” și Planul meu
  async "03-flux"(page) {
    await page.goto(`${BAZA}/flux?p=andrei&lang=en`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await deruleaza(page, 700, 40);
    await page.waitForTimeout(2000);
    const detalii = page.getByRole("button", { name: /Details/ }).first();
    await detalii.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await detalii.click();
    await page.waitForTimeout(3000);
    await deruleaza(page, 450);
    await page.waitForTimeout(2500);
  },
  // 1:40–2:15 partea tehnică: inbox-ul din Monitorul Oficial, „Aprobă”, cardul apare în flux
  async "04-admin"(page, ctx) {
    const flux = await ctx.newPage();
    await flux.goto(`${BAZA}/flux?p=elena&lang=en`, { waitUntil: "networkidle" });
    await page.bringToFront();
    await page.goto(`${BAZA}/admin?lang=en`, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.removeItem("cipm.aprobate.v1"));
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(2500);
    await deruleaza(page, 1250, 50);
    await page.waitForTimeout(2000);
    await page.getByRole("button", { name: "Approve and publish" }).nth(1).click();
    await page.waitForTimeout(2500);
    await flux.close();
    await flux.video()?.delete();
  },
  // urmarea scenei 04: același flux, cu actul aprobat sus (pornește după 04, în același browser)
  async "05-flux-dupa-aprobare"(page) {
    await page.goto(`${BAZA}/flux?p=elena&lang=en`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await page.getByRole("button", { name: /Details/ }).first().click();
    await page.waitForTimeout(3500);
  },
  // 2:15–2:35 încrederea: sursele, ipotezele și limitările
  async "06-surse"(page) {
    await page.goto(`${BAZA}/surse?lang=en`, { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await deruleaza(page, 1600, 80);
    await page.waitForTimeout(1500);
  },
  // 2:35–2:50 modelul de business: Pro prin Stripe
  async "07-pro"(page) {
    await page.goto(`${BAZA}/abonament?lang=en`, { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
  },
};

const browser = await chromium.launch({ executablePath: CHROME });
// aprobările din 04 trebuie să rămână pentru 05: un singur context pe ecran
const contexte = {};
for (const [nume, scena] of Object.entries(SCENE)) {
  if (ALESE.length && !ALESE.includes(nume)) continue;
  for (const [ecran, opt] of [
    ["telefon", TELEFON],
    ["desktop", DESKTOP],
  ]) {
    contexte[ecran] ??= { storageState: undefined };
    const ctx = await browser.newContext({
      ...opt,
      storageState: contexte[ecran].storageState,
      recordVideo: { dir: OUT, size: opt.viewport },
    });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem("cipm.limba.v1", "en");
      } catch {}
    });
    const page = await ctx.newPage();
    try {
      await scena(page, ctx);
    } catch (e) {
      console.error(`✗ ${nume} (${ecran}): ${e.message.split("\n")[0]}`);
    }
    contexte[ecran].storageState = await ctx.storageState();
    const video = page.video();
    // filmările paginilor secundare (fluxul din 04) nu ne trebuie
    const altele = ctx.pages().filter((p) => p !== page).map((p) => p.video());
    await ctx.close();
    for (const v of altele) await v?.delete().catch(() => {});
    if (video) {
      const tinta = path.join(OUT, `${nume}-${ecran}.webm`);
      renameSync(await video.path(), tinta);
      console.log(`✓ ${path.relative(RAD, tinta)}`);
    }
  }
}
await browser.close();
