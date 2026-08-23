import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = (process.env.HABBO_QA_URL || "http://127.0.0.1:4173/habbo").replace(/\/$/, "");
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const artifactDir = path.join(root, "qa", "visual-artifacts");
fs.mkdirSync(artifactDir, { recursive: true });

const failures = [];
const checks = [];

function record(name, passed, detail = "") {
  checks.push({ name, passed, detail });
  if (!passed) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}

function urlFor(route) {
  return `${baseUrl}/${route.replace(/^\//, "")}`;
}

async function waitForImages(page) {
  await page.locator("img").evaluateAll((images) => {
    images.forEach((image) => {
      /* Lazy images below the fold are still part of the public artifact. */
      image.loading = "eager";
    });
    return Promise.all(images.map((image) => {
      if (image.complete) return Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }));
  });
  await page.waitForTimeout(150);
}

async function runPage(browser, test) {
  const context = await browser.newContext({ viewport: test.viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(`${request.url()} — ${request.failure()?.errorText || "failed"}`));
  try {
    await page.goto(urlFor(test.route), { waitUntil: "networkidle" });
    await waitForImages(page);
    const bodyText = await page.locator("body").innerText();
    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyText: document.body.innerText.trim().length,
      images: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src)
    }));
    record(`${test.name} loads`, bodyText.length > 40 && layout.bodyText > 40, `body text length ${bodyText.length}`);
    record(`${test.name} has no horizontal overflow`, layout.scrollWidth <= layout.clientWidth + 1, `${layout.scrollWidth} > ${layout.clientWidth}`);
    record(`${test.name} has no broken images`, layout.images.length === 0, layout.images.join(", "));
    record(`${test.name} has no console errors`, consoleErrors.length === 0, consoleErrors.join(" | "));
    record(`${test.name} has no page errors`, pageErrors.length === 0, pageErrors.join(" | "));
    record(`${test.name} has no failed requests`, failedRequests.length === 0, failedRequests.join(" | "));
    if (test.assert) await test.assert(page);
    await page.screenshot({ path: path.join(artifactDir, test.screenshot), fullPage: false });
  } catch (error) {
    record(`${test.name} execution`, false, error.message);
  } finally {
    await context.close();
  }
}

const browser = await chromium.launch({ headless: true });
try {
  const commonHomeAssert = async (page) => {
    record("home has 27 room links", await page.locator("[data-room-node]").count() === 27);
    record("home has spatial field", await page.locator(".spatial-world").count() === 1);
    record("home has no legacy grid", await page.locator(".district-grid, .district-island, .place-node").count() === 0);
    record("home has flag switcher", await page.locator(".lang-toggle .lang-button").count() === 2);
    record("home has no plain language text", !(await page.locator("body").innerText()).includes("PT-BR | EN"));
  };

  await runPage(browser, {
    name: "home desktop",
    route: "",
    viewport: { width: 1440, height: 900 },
    screenshot: "01-home-desktop.png",
    assert: commonHomeAssert
  });
  await runPage(browser, {
    name: "home mobile",
    route: "",
    viewport: { width: 390, height: 844 },
    screenshot: "02-home-mobile.png",
    assert: commonHomeAssert
  });
  await runPage(browser, {
    name: "PT home desktop",
    route: "pt-br/",
    viewport: { width: 1440, height: 900 },
    screenshot: "03-pt-home-desktop.png",
    assert: commonHomeAssert
  });
  await runPage(browser, {
    name: "selected Lido map state",
    route: "pt-br/?selected=lido",
    viewport: { width: 1440, height: 900 },
    screenshot: "04-map-selected-lido.png",
    assert: async (page) => {
      record("selected map state has selected room", await page.locator(".spatial-world.has-selection .room-node.is-selected").count() === 1);
    }
  });
  await runPage(browser, {
    name: "Piscina desktop",
    route: "pt-br/lugar/lido/",
    viewport: { width: 1440, height: 900 },
    screenshot: "05-piscina-desktop.png",
    assert: async (page) => {
      record("Piscina is arrival-first", await page.locator(".place-arrival .arrival-figure").count() === 1);
      record("Piscina has no first-fold sidebar", await page.locator(".place-sidebar, .facts").count() === 0);
      record("Piscina has closed archive layer", await page.locator("[data-archive-drawer]").count() === 1 && !(await page.locator("[data-archive-drawer]").evaluate((node) => node.open)));
    }
  });
  await runPage(browser, {
    name: "Piscina mobile",
    route: "pt-br/lugar/lido/",
    viewport: { width: 390, height: 844 },
    screenshot: "06-piscina-mobile.png",
    assert: async (page) => {
      record("Piscina mobile has readable title", await page.locator("#place-title").count() === 1);
    }
  });
  await runPage(browser, {
    name: "Corredores desktop",
    route: "pt-br/lugar/hallways/",
    viewport: { width: 1440, height: 900 },
    screenshot: "07-corredores-desktop.png",
    assert: async (page) => {
      record("Corredores has visual exits", await page.locator(".exit-path").count() >= 2);
    }
  });
  await runPage(browser, {
    name: "topology desktop",
    route: "pt-br/topologia/",
    viewport: { width: 1440, height: 900 },
    screenshot: "08-topology-desktop.png",
    assert: async (page) => {
      record("topology has SVG graph", await page.locator(".topology-graph").count() === 1);
      record("topology has no edge cards", await page.locator(".edge-card, .topology-list").count() === 0);
      await page.locator('[data-topology-filter="unknown"]').click();
      record("topology filter hides other lines", await page.locator(".topology-edge:not(.is-hidden)").evaluateAll((nodes) => nodes.every((node) => node.dataset.edgeStatus === "unknown")));
    }
  });
  await runPage(browser, {
    name: "English home desktop",
    route: "en/",
    viewport: { width: 1440, height: 900 },
    screenshot: "09-en-home-desktop.png",
    assert: async (page) => {
      record("English flag is active", await page.locator('.lang-button[data-lang="en"].is-active').count() === 1);
    }
  });

  const context = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  const page = await context.newPage();
  await page.goto(urlFor("pt-br/lugar/lido/"), { waitUntil: "networkidle" });
  await page.locator('.lang-button[data-lang="en"]').click();
  await page.waitForLoadState("networkidle");
  record("language switch preserves place route", /\/habbo\/en\/place\/lido\/$/.test(page.url()));
  record("language preference persists", await page.evaluate(() => localStorage.getItem("habbo-archive-language") === "en"));
  await page.locator('.lang-button[data-lang="pt-br"]').click();
  await page.waitForLoadState("networkidle");
  record("language switch returns to same place", /\/habbo\/pt-br\/lugar\/lido\/$/.test(page.url()));
  await context.close();

  const searchContext = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  const searchPage = await searchContext.newPage();
  await searchPage.goto(urlFor("pt-br/"), { waitUntil: "networkidle" });
  await searchPage.locator("[data-open-search]").first().click();
  await searchPage.locator("[data-place-search]").fill("Piscina");
  record("search utility filters place results", await searchPage.locator("[data-search-results] li:not(.is-hidden)").count() === 1);
  await searchContext.close();
} finally {
  await browser.close();
}

const report = {
  result: failures.length ? "failed" : "passed",
  baseUrl,
  screenshots: fs.readdirSync(artifactDir).filter((file) => file.endsWith(".png")),
  checks,
  failures
};
fs.writeFileSync(path.join(root, "qa", "visual-qa-report.json"), JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync(path.join(root, "qa", "HABBO_V1_VISUAL_QA.md"), [
  "# Habbo V1 visual QA",
  "",
  `Result: **${report.result}**`,
  `Base URL: **${baseUrl}**`,
  `Screenshots: **${report.screenshots.length}**`,
  "",
  failures.length ? "Failures:\n\n" + failures.map((item) => `- ${item}`).join("\n") : "All browser assertions passed."
].join("\n") + "\n");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
