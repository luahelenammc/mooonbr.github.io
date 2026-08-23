import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = (process.env.HABBO_QA_URL || "http://127.0.0.1:4173/habbo").replace(/\/$/, "");
const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const artifactDir = path.join(root, "qa", "visual-artifacts");
fs.rmSync(artifactDir, { recursive: true, force: true });
fs.mkdirSync(artifactDir, { recursive: true });
const failures = [];
const checks = [];

function record(name, passed, detail = "") {
  checks.push({ name, passed, detail });
  if (!passed) failures.push(`${name}${detail ? `: ${detail}` : ""}`);
}
function urlFor(route) { return `${baseUrl}/${route.replace(/^\//, "")}`; }

async function waitForImages(page) {
  await page.locator("img").evaluateAll((images) => {
    images.forEach((image) => { image.loading = "eager"; });
    return Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => image.addEventListener("load", resolve, { once: true }))));
  });
  await page.waitForTimeout(150);
}

async function runPage(browser, test) {
  const context = await browser.newContext({ viewport: test.viewport, ...(test.contextOptions || {}) });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("requestfailed", (request) => failedRequests.push(`${request.url()} — ${request.failure()?.errorText || "failed"}`));
  try {
    await page.goto(urlFor(test.route), { waitUntil: "networkidle" });
    await waitForImages(page);
    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyText: document.body.innerText.trim().length,
      activeSiteStylesheet: [...document.styleSheets].some((sheet) => {
        if (!sheet.href?.includes("/assets/site-20260823-v4-group-columns")) return false;
        try { return sheet.cssRules.length > 0; } catch { return false; }
      }),
      brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src)
    }));
    record(`${test.name} loads`, layout.bodyText > 40, `body text length ${layout.bodyText}`);
    record(`${test.name} has no horizontal overflow`, layout.scrollWidth <= layout.clientWidth + 1, `${layout.scrollWidth} > ${layout.clientWidth}`);
    record(`${test.name} has V4 stylesheet`, layout.activeSiteStylesheet, "versioned V4 stylesheet did not expose CSS rules");
    record(`${test.name} has no broken images`, layout.brokenImages.length === 0, layout.brokenImages.join(", "));
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
  const commonHome = async (page) => {
    record("home exposes 29 group entities", await page.locator("[data-dock-slide]").count() === 29);
    record("home exposes 36 flattened map items", await page.locator("[data-room-open]").count() === 36);
    record("home keeps one lightbox", await page.locator(".room-lightbox").count() === 1);
    record("home exposes visible group columns", await page.locator(".dock-group-column").count() === 29);
    record("home has exact four-second autoplay marker", await page.locator('[data-cinematic-dock][data-autoplay-ms="4000"]').count() === 1);
    record("home has no legacy map", await page.locator(".spatial-world, .district-grid, .district-island, .place-node").count() === 0);
    record("home has two language buttons", await page.locator(".lang-toggle .lang-button").count() === 2);
  };

  await runPage(browser, {
    name: "home first frame",
    route: "pt-br/",
    viewport: { width: 1440, height: 900 },
    screenshot: "01-home-first-frame.png",
    assert: async (page) => {
      await commonHome(page);
      record("first group is Wobble Squabble", await page.locator('[data-cinematic-dock][data-active-id="rooftop_rumble"]').count() === 1);
      record("first group title is Wobble Squabble", await page.locator("[data-active-name]").innerText() === "Wobble Squabble");
    }
  });

  await runPage(browser, {
    name: "lobbies visible column",
    route: "pt-br/#main_lobby_primary",
    viewport: { width: 1440, height: 900 },
    screenshot: "02-group-lobbies.png",
    assert: async (page) => {
      record("Saguões is active", await page.locator('[data-cinematic-dock][data-active-id="lobbies"]').count() === 1);
      record("Saguões exposes four visible maps", await page.locator('[data-dock-slide][data-room-id="lobbies"] [data-room-open]').count() === 4);
      record("active lobby label is readable", await page.locator("[data-active-variant]").innerText() === "Saguão Principal");
      record("four lobby labels are visible", await page.locator('[data-dock-slide][data-room-id="lobbies"] .dock-variant-caption').count() === 4);
    }
  });

  await runPage(browser, {
    name: "Piscina active group",
    route: "pt-br/#lido_primary",
    viewport: { width: 1440, height: 900 },
    screenshot: "03-group-piscina.png",
    assert: async (page) => {
      record("Piscina group is active", await page.locator('[data-cinematic-dock][data-active-id="lido"]').count() === 1);
      record("Piscina exposes two visible maps", await page.locator('[data-dock-slide][data-room-id="lido"] [data-room-open]').count() === 2);
      record("Piscina map 01 is active", await page.locator('[data-cinematic-dock][data-active-item-id="lido_primary"]').count() === 1);
    }
  });

  await runPage(browser, {
    name: "flattened group progression",
    route: "pt-br/#lido_primary",
    viewport: { width: 1440, height: 900 },
    screenshot: "04-progression-piscina-to-next.png",
    assert: async (page) => {
      await page.locator("[data-dock-viewport]").focus();
      await page.keyboard.press("ArrowRight");
      record("right arrow stays inside Piscina group first", await page.locator('[data-cinematic-dock][data-active-id="lido"][data-active-item-id="lido_variant_02"]').count() === 1);
      await page.keyboard.press("ArrowRight");
      record("next arrow exits group only after final map", await page.locator('[data-cinematic-dock][data-active-id="ice_cafe"]').count() === 1);
      const viewportBox = await page.locator("[data-dock-viewport]").boundingBox();
      if (viewportBox) await page.mouse.move(viewportBox.x + viewportBox.width / 2, viewportBox.y + viewportBox.height / 2);
      await page.mouse.wheel(0, -150);
      record("wheel remains item-level", await page.locator('[data-cinematic-dock][data-active-id="lido"]').count() === 1);
    }
  });

  await runPage(browser, {
    name: "exact active variant lightbox",
    route: "pt-br/#lido_variant_02",
    viewport: { width: 1440, height: 900 },
    screenshot: "05-lightbox-piscina-variant-02.png",
    assert: async (page) => {
      await page.locator('[data-room-item-id="lido_variant_02"]').click();
      record("lightbox opens exact active variant", (await page.locator("[data-lightbox-image]").getAttribute("src"))?.includes("lido__variant_02__brpt__undated__presentation") === true);
      record("lightbox keeps Piscina group title", await page.locator("[data-lightbox-title]").innerText() === "Piscina Habbo");
      record("lightbox CTA carries exact variant", (await page.locator("[data-lightbox-detail]").getAttribute("href"))?.includes("variant=lido_variant_02") === true);
      await page.locator("[data-lightbox-next]").click();
      record("lightbox next advances to next flattened item", await page.locator('[data-lightbox-title]').innerText() === "Café Iced");
      await page.keyboard.press("Escape");
      record("Escape closes lightbox", !(await page.locator(".room-lightbox").evaluate((dialog) => dialog.open)));
    }
  });

  for (const [name, id, screenshot] of [["Battle Ball replacement", "battle_ball_lounge", "06-battle-ball.png"], ["Teatro replacement", "theatredrome", "07-teatro.png"], ["Net Café repair", "net_cafe", "08-net-cafe.png"], ["Corredores cleanup", "hallways", "09-corredores.png"]]) {
    await runPage(browser, {
      name,
      route: `pt-br/#${id}`,
      viewport: { width: 1440, height: 900 },
      screenshot,
      assert: async (page) => {
        record(`${name} active`, await page.locator(`[data-cinematic-dock][data-active-id="${id}"]`).count() === 1);
        record(`${name} uses a V4 or cleaned derivative`, await page.locator(`[data-dock-slide][data-room-id="${id}"] img`).first().getAttribute("src").then((src) => /__v4__|undated__v4__|hallways__brpt__undated__v4/.test(src || "")));
      }
    });
  }

  await runPage(browser, {
    name: "autoplay exact four seconds",
    route: "pt-br/",
    viewport: { width: 1440, height: 900 },
    screenshot: "10-autoplay-four-seconds.png",
    assert: async (page) => {
      const before = await page.locator("[data-cinematic-dock]").getAttribute("data-active-item-id");
      await page.waitForTimeout(4300);
      const after = await page.locator("[data-cinematic-dock]").getAttribute("data-active-item-id");
      record("autoplay advances at four-second cadence", before !== after, `${before} -> ${after}`);
    }
  });

  await runPage(browser, {
    name: "mobile dock and swipe",
    route: "pt-br/#lido_primary",
    viewport: { width: 390, height: 844 },
    screenshot: "11-mobile-dock.png",
    assert: async (page) => {
      record("mobile Piscina is active", await page.locator('[data-cinematic-dock][data-active-id="lido"]').count() === 1);
      const box = await page.locator("[data-dock-viewport]").boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * .75, box.y + box.height * .5);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * .2, box.y + box.height * .5, { steps: 8 });
        await page.mouse.up();
      }
      record("mobile swipe stays on homepage", new URL(page.url()).pathname === "/habbo/pt-br/");
      record("mobile swipe advances flattened cursor", await page.locator('[data-cinematic-dock][data-active-item-id="lido_variant_01"]').count() === 0);
    }
  });
} finally {
  await browser.close();
}

const report = { result: failures.length ? "failed" : "passed", baseUrl, screenshots: fs.readdirSync(artifactDir).filter((file) => file.endsWith(".png")), checks, failures };
fs.writeFileSync(path.join(root, "qa", "visual-qa-report.json"), JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync(path.join(root, "qa", "HABBO_V4_VISUAL_QA.md"), [
  "# Habbo V4 Chromium visual QA", "", `Result: **${report.result}**`, `Base URL: **${baseUrl}**`, `Screenshots: **${report.screenshots.length}**`, "",
  failures.length ? "Failures:\n\n" + failures.map((item) => `- ${item}`).join("\n") : "All V4 browser assertions passed."
].join("\n") + "\n");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
