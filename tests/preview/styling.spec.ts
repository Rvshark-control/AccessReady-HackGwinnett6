import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base = "/ports/3100";

test("forwarded preview retains styling, fonts, navigation, and the complete demo", async ({ page }, testInfo) => {
  const failedResponses: string[] = [];
  const pageErrors: string[] = [];
  const apiCalls: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("request", (request) => {
    if (request.url().includes("/api/")) apiCalls.push(new URL(request.url()).pathname);
  });
  await page.goto(`${base}/`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Care that sees");
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => [...document.fonts].filter((font) => font.status === "loaded").length)).toBeGreaterThanOrEqual(2);
  await expect(page.locator(".hero-grid")).toHaveCSS("display", "grid");
  await expect(page.locator(".hero-actions .button-primary")).toHaveCSS("background-color", "rgb(36, 90, 76)");
  await expect(page.locator(".brand .text-teal-800").first()).toHaveCSS("color", "oklch(0.437 0.078 188.216)");
  const stylesheets = await page.locator('link[rel="stylesheet"]').evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href));
  expect(stylesheets.length).toBeGreaterThan(0);
  for (const url of stylesheets) {
    expect(new URL(url).pathname.startsWith(`${base}/_next/`)).toBe(true);
    const response = await page.request.get(url);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/css");
    expect(await response.text()).toContain(".hero-grid");
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `test-results/preview/home-${testInfo.project.name}.png`, fullPage: true, scale: "css" });

  await page.getByRole("link", { name: "Try the demo 2 min" }).click();
  await expect(page).toHaveURL(new RegExp(`${base}/find-care`));
  await expect(page.getByRole("checkbox", { name: "Wheelchair-accessible entrance" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Adjustable-height exam tables" })).toBeChecked();
  await expect(page.getByRole("heading", { name: "12 facilities to explore" })).toBeVisible();
  const willow = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Willow Family Care" }) });
  const harbor = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Harborview Wellness" }) });
  await expect(willow.locator(".score strong")).toHaveText("100%");
  await expect(harbor.locator(".score strong")).toHaveText("50%");
  await willow.getByRole("button", { name: "Compare Willow Family Care: add to comparison" }).click();
  await harbor.getByRole("button", { name: "Compare Harborview Wellness: add to comparison" }).click();
  await willow.getByRole("link", { name: "View details for Willow Family Care" }).click();
  await expect(page.getByRole("heading", { name: "Your selected needs are supported." })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${base}/facilities/willow-family-care`));
  await page.locator(".compare-tray").getByRole("link", { name: "Compare" }).click();
  await expect(page.getByRole("table").getByRole("row", { name: /Adjustable-height exam tables/ })).toContainText("Not supported");
  await page.reload();
  await expect(page.getByRole("table")).toContainText("Harborview Wellness");
  await page.screenshot({ path: `test-results/preview/compare-${testInfo.project.name}.png`, fullPage: true, scale: "css" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(scan.violations.map((violation) => violation.id)).toEqual([]);

  // Next's trailing-slash redirect must not double the workspace prefix.
  await page.goto(`${base}/about/`);
  await expect(page).toHaveURL(new RegExp(`${base}/about$`));
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Everyone deserves");
  expect(apiCalls.length).toBeGreaterThan(0);
  expect(apiCalls.every((path) => path.startsWith(`${base}/api/`))).toBe(true);
  expect(failedResponses).toEqual([]);
  expect(pageErrors).toEqual([]);
});
