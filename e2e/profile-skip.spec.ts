import { expect, test, type Page } from "@playwright/test";

const storedProfile = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("cipm.profil.v1") ?? "null"));
const answers = (page: Page) => page.getByRole("group", { name: "Răspunsuri la întrebarea curentă" });
const skip = (page: Page) => answers(page).getByRole("button", { name: "Sar peste", exact: true });
const step = (page: Page, number: number) => expect(page.getByText(`pasul ${number} din 6`, { exact: true })).toBeVisible();

test("skip every unanswered question and reach the feed with an empty profile", async ({ page }) => {
  await page.goto("/profil");
  for (const number of [1, 2, 4, 5, 6]) {
    await step(page, number);
    await expect(skip(page)).toBeEnabled();
    await skip(page).click();
    expect(await storedProfile(page)).toEqual({ taguri: [], valori: {} });
  }
  await expect(page.getByText("Gata. Nu am notat nicio etichetă. Le poți adăuga oricând din Profil.", { exact: true })).toBeVisible();
  await expect(skip(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Vezi ce te privește", exact: true }).click();
  await expect(page).toHaveURL(/\/flux$/);
  await page.reload();
  expect(await storedProfile(page)).toEqual({ taguri: [], valori: {} });
});

test("skip discards unconfirmed choices and text but saves confirmed answers", async ({ page }) => {
  await page.goto("/profil");
  await page.getByRole("button", { name: "Salariu", exact: true }).click();
  await page.getByRole("textbox", { name: "Scrie aici…" }).fill("text neconfirmat");
  await skip(page).click();
  await step(page, 2);
  await expect(page.getByRole("textbox", { name: "Scrie aici…" })).toHaveValue("");
  expect(await storedProfile(page)).toEqual({ taguri: [], valori: {} });
  await page.getByRole("button", { name: "IT", exact: true }).click();
  await step(page, 4);
  await page.getByRole("button", { name: "Mașină", exact: true }).click();
  await page.getByRole("button", { name: "Gata", exact: true }).click();
  for (const number of [5, 6]) {
    await step(page, number);
    await skip(page).click();
  }
  expect(await storedProfile(page)).toEqual({ taguri: ["it", "masina"], valori: {} });
  await page.reload();
  expect(await storedProfile(page)).toEqual({ taguri: ["it", "masina"], valori: {} });
});

test("skip the company question without losing an existing profile", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("cipm.profil.v1", JSON.stringify({ taguri: ["parinte"], valori: { nr_copii: 2 } })));
  await page.goto("/profil");
  await page.getByRole("button", { name: "Dividende din SRL", exact: true }).click();
  await page.getByRole("button", { name: "Gata", exact: true }).click();
  await skip(page).click();
  await step(page, 3);
  await skip(page).click();
  await step(page, 4);
  expect(await storedProfile(page)).toEqual({ taguri: ["parinte", "srl_dividende"], valori: { nr_copii: 2 } });
});

test("skip after an unrecognized free-text answer", async ({ page }) => {
  await page.route("**/api/asistent", route => route.fulfill({ json: { etichete: [], mesaj: "" } }));
  await page.goto("/profil");
  await page.getByRole("textbox", { name: "Scrie aici…" }).fill("Nu știu");
  await page.getByRole("button", { name: "Trimite", exact: true }).click();
  await expect(page.getByText("Nu am găsit o etichetă în ce ai scris. Alege de mai jos sau sari peste.", { exact: true })).toBeVisible();
  await skip(page).click();
  await step(page, 2);
  expect(await storedProfile(page)).toEqual({ taguri: [], valori: {} });
});

test("English skip works from the keyboard", async ({ page }) => {
  await page.goto("/profil?lang=en");
  const button = page.getByRole("group", { name: "Answers to the current question" }).getByRole("button", { name: "Skip", exact: true });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("step 2 of 6", { exact: true })).toBeVisible();
  expect(await storedProfile(page)).toEqual({ taguri: [], valori: {} });
});

test("wait for the pending answer before allowing a skip", async ({ page }) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/asistent", async route => {
    await pending;
    await route.fulfill({ json: { etichete: [], mesaj: "" } });
  });
  await page.goto("/profil");
  await page.getByRole("textbox", { name: "Scrie aici…" }).fill("Nu știu");
  const request = page.waitForRequest("**/api/asistent");
  await page.getByRole("button", { name: "Trimite", exact: true }).click();
  await request;
  try {
    await expect(skip(page)).toBeDisabled();
    await expect(page.getByRole("button", { name: "Salariu", exact: true })).toBeDisabled();
    await step(page, 1);
  } finally {
    release();
  }
  await expect(skip(page)).toBeEnabled();
  await skip(page).click();
  await step(page, 2);
});
