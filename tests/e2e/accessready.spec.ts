import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const appPath = (path: string) => `${process.env.PLAYWRIGHT_BASE_PATH ?? ""}${path}`;

async function assertNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}
async function assertAccessible(page: Page) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(result.violations.map(({ id, nodes }) => ({ id, elements: nodes.map((node) => node.target) }))).toEqual([]);
}

test("homepage has real styling, working navigation, and accessible responsive content", async ({ page }, testInfo) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(appPath("/"));
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Care that sees");
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => [...document.fonts].some((font) => font.status === "loaded"))).toBe(true);
  await expect(page.locator(".hero-grid")).toHaveCSS("display", "grid");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(13, 13, 18)");
  await expect(page.locator(".hero-actions .button-primary")).toHaveCSS("color", "rgb(13, 13, 18)");
  await expect(page.locator(".hero-actions .button-primary")).toHaveCSS("background-color", "rgb(255, 122, 0)");
  // This class is emitted by Tailwind, independently of the custom stylesheet.
  await expect(page.locator(".brand .text-pumpkin").first()).toHaveCSS("color", "rgb(255, 122, 0)");
  const stylesheets = await page.locator('link[rel="stylesheet"]').evaluateAll((links) => links.map((link) => (link as HTMLLinkElement).href));
  expect(stylesheets.length).toBeGreaterThan(0);
  for (const stylesheet of stylesheets) expect((await page.request.get(stylesheet)).status()).toBe(200);
  await assertNoOverflow(page);
  await assertAccessible(page);
  await page.screenshot({ path: `test-results/home-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole("link", { name: "Find Accessible Care", exact: true }).click();
  await expect(page).toHaveURL(/find-care/);
  await expect(page.getByRole("heading", { name: "12 facilities to explore" })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("complete demo matches, details, comparison, and persistence", async ({ page }, testInfo) => {
  let matchCalls = 0;
  page.on("request", (request) => { if (request.url().endsWith("/api/match") && request.method() === "POST") matchCalls++; });
  await page.goto(appPath("/"));
  await page.getByRole("link", { name: "Try the demo 2 min" }).click();
  await expect(page.getByRole("checkbox", { name: "Wheelchair-accessible entrance" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Adjustable-height exam tables" })).toBeChecked();
  await expect(page.getByRole("heading", { name: "12 facilities to explore" })).toBeVisible();
  const willow = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Willow Family Care" }) });
  await expect(willow.locator(".score strong")).toHaveText("100%");
  const harbor = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Harborview Wellness" }) });
  await expect(harbor.locator(".score strong")).toHaveText("50%");
  await willow.getByRole("button", { name: "Compare Willow Family Care: add to comparison" }).click();
  await harbor.getByRole("button", { name: "Compare Harborview Wellness: add to comparison" }).click();
  await willow.getByRole("link", { name: "View details for Willow Family Care" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Willow Family Care" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your selected needs are supported." })).toBeVisible();
  await expect(page.locator(".selected-checks")).toContainText("adjustable examination table");
  await assertNoOverflow(page);
  await assertAccessible(page);
  await page.screenshot({ path: `test-results/detail-${testInfo.project.name}.png`, fullPage: true });
  await page.locator(".compare-tray").getByRole("link", { name: "Compare" }).click();
  await expect(page.getByRole("table")).toBeVisible();
  const table = page.getByRole("table");
  await expect(table.getByRole("link", { name: "Willow Family Care", exact: true })).toBeVisible();
  await expect(table.getByRole("link", { name: "Harborview Wellness", exact: true })).toBeVisible();
  await expect(table.getByRole("row", { name: /Adjustable-height exam tables/ })).toContainText("Not supported");
  await assertNoOverflow(page);
  await assertAccessible(page);
  await page.screenshot({ path: `test-results/compare-${testInfo.project.name}.png`, fullPage: true });
  await page.reload();
  await expect(page.getByRole("table")).toContainText("Harborview Wellness");
  await expect(page.locator(".compare-toolbar")).toContainText("2 selected requirements");
  expect(matchCalls).toBeGreaterThanOrEqual(3);
});

test("profile edits, all categories, filters, empty results, and unknown evidence", async ({ page }, testInfo) => {
  await page.goto(appPath("/find-care"));
  await expect(page.getByRole("heading", { name: "12 facilities to explore" })).toBeVisible();
  await expect(page.locator(".facility-card").first().locator(".score")).toContainText("Your needs, your match");
  await page.getByRole("checkbox", { name: "Wheelchair-accessible entrance" }).check();
  await page.getByRole("checkbox", { name: "Adjustable-height exam tables" }).check();
  await page.getByRole("button", { name: "Find care", exact: true }).click();
  await expect(page.getByRole("heading", { name: "12 facilities to explore" })).toBeFocused();
  await page.getByLabel("Search facilities, specialties, or neighborhoods", { exact: true }).fill("Tidewell");
  await expect(page.getByRole("heading", { name: "1 facility to explore" })).toBeVisible();
  await expect(page.locator(".facility-card .match-breakdown")).toContainText("1 unknown");
  await page.getByLabel("Search facilities, specialties, or neighborhoods", { exact: true }).fill("no-matching-facility-xyz");
  await expect(page.getByRole("heading", { name: "No facilities found" })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters", exact: true }).first().click();
  await page.getByLabel("Specialty", { exact: true }).selectOption("Dental care");
  await expect(page.getByRole("heading", { name: "2 facilities to explore" })).toBeVisible();
  await page.getByLabel("Verification status", { exact: true }).selectOption("verified");
  await expect(page.getByRole("heading", { name: "1 facility to explore" })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters", exact: true }).click();
  for (const [category, label] of [["Hearing", "ASL interpretation"], ["Vision", "Large-print materials"], ["Sensory", "Quiet waiting areas"], ["Communication", "Alternative communication support"]]) {
    await page.locator("summary").filter({ hasText: category }).click();
    await page.getByRole("checkbox", { name: label, exact: true }).check();
  }
  await expect(page.locator(".profile-meta")).toContainText("6 selected");
  await expect(page.getByRole("heading", { name: "12 facilities to explore" })).toBeVisible();
  await assertAccessible(page);
  await assertNoOverflow(page);
  await page.screenshot({ path: `test-results/find-${testInfo.project.name}.png`, fullPage: true });
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator(".profile-meta")).toContainText("0 selected");
  await expect(page.locator(".facility-card").first().locator(".score")).toContainText("Your needs, your match");
  const restartDemo = async () => {
    if (testInfo.project.name === "mobile") await page.getByRole("button", { name: "Open navigation" }).click();
    await page.locator(".site-header").getByRole("link", { name: "Try the demo", exact: true }).click();
  };
  await restartDemo();
  await expect(page.getByRole("checkbox", { name: "Adjustable-height exam tables" })).toBeChecked();
  await page.getByRole("checkbox", { name: "Adjustable-height exam tables" }).uncheck();
  await restartDemo();
  await expect(page.getByRole("checkbox", { name: "Adjustable-height exam tables" })).toBeChecked();
  await expect(page.locator(".profile-meta")).toContainText("2 selected");
});

test("comparison can be built directly, limited to three, removed, and cleared", async ({ page }) => {
  await page.goto(appPath("/compare"));
  await expect(page.getByRole("heading", { name: "Your next step, side by side." })).toBeVisible();
  await page.getByRole("button", { name: "Compare Willow Family Care: add to comparison" }).click();
  await expect(page.getByText("Add one more facility below")).toBeVisible();
  await page.getByRole("button", { name: "Compare Cedar Grove Health: add to comparison" }).click();
  await page.getByRole("button", { name: "Compare Harborview Wellness: add to comparison" }).click();
  await expect(page.locator(".compare-toolbar")).toContainText("3 of 3 facilities");
  await expect(page.getByRole("heading", { name: "Add a facility", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Remove Cedar Grove Health from comparison" }).click();
  await expect(page.locator(".compare-toolbar")).toContainText("2 of 3 facilities");
  await page.getByRole("button", { name: "Clear comparison" }).click();
  await expect(page.getByRole("heading", { name: "Your next step, side by side." })).toBeVisible();
});

test("API errors are accessible and recoverable without showing stale matches", async ({ page }) => {
  await page.route("**/api/match", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Unavailable" }) }));
  await page.goto(appPath("/find-care"));
  await expect(page.getByRole("alert").filter({ hasText: "We couldn’t load your matches" })).toBeVisible();
  await expect(page.locator(".facility-card")).toHaveCount(0);
  await assertAccessible(page);
  await page.unroute("**/api/match");
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(page.locator(".facility-card")).toHaveCount(12);
});

test("about, keyboard navigation, reduced motion, mobile menu, and not-found page", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(appPath("/"));
  await expect(page.locator(".hero-actions .button-primary")).toHaveCSS("transition-duration", "0s");
  if (!isMobile) {
    await page.locator(".hero-actions .button-primary").hover();
    await expect(page.locator(".hero-actions .button-primary")).toHaveCSS("transform", "none");
  }
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await expect(page.getByRole("link", { name: "Skip to main content" })).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link", { name: "Our mission" }).click();
    await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible();
  } else {
    await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Our mission" }).click();
  }
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Everyone deserves");
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
  await assertNoOverflow(page);
  await assertAccessible(page);
  await page.goto(appPath("/facilities/does-not-exist"));
  await expect(page.getByRole("heading", { name: "We couldn’t find that page." })).toBeVisible();
  await page.getByRole("link", { name: "Explore facilities", exact: true }).click();
  await expect(page.getByRole("heading", { name: "12 facilities to explore" })).toBeVisible();
});

test("deployed HTTP endpoints validate requests and return ranked synthetic data", async ({ request }) => {
  const health = await request.get(appPath("/api/health"));
  expect(health.status()).toBe(200);
  expect((await health.json()).facilityCount).toBe(12);
  const catalog = await request.get(appPath("/api/clinics?q=willow"));
  expect((await catalog.json()).clinics[0].id).toBe("willow-family-care");
  const match = await request.post(appPath("/api/match"), { data: { requirements: ["wheelchair_entrance", "adjustable_exam_table"] } });
  expect(match.status()).toBe(200);
  const payload = await match.json();
  expect(payload.synthetic).toBe(true);
  expect(payload.results).toHaveLength(12);
  expect(payload.results[0].score).toBe(100);
  expect((await request.post(appPath("/api/match"), { data: { requirements: ["not-real"] } })).status()).toBe(400);
  expect((await request.post(appPath("/api/match"), { data: "{", headers: { "Content-Type": "application/json" } })).status()).toBe(400);
  expect((await request.get(appPath("/api/clinics?id=not-real"))).status()).toBe(404);
});
