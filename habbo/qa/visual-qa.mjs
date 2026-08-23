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

function urlFor(route) {
  return `${baseUrl}/${route.replace(/^\//, "")}`;
}

async function waitForImages(page) {
  await page.locator("img").evaluateAll((images) => {
    images.forEach((image) => { image.loading = "eager"; });
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
    const bodyText = await page.locator("body").innerText();
    const layout = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyText: document.body.innerText.trim().length,
      activeSiteStylesheet: [...document.styleSheets].some((sheet) => {
        if (!sheet.href?.includes("/assets/site-") || !sheet.href?.includes("effects-hotfix")) return false;
        try { return sheet.cssRules.length > 0; } catch { return false; }
      }),
      images: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      overflowers: [...document.querySelectorAll("*")].map((element) => {
        const box = element.getBoundingClientRect();
        return { tag: element.tagName.toLowerCase(), className: element.className?.toString?.() || "", right: Math.round(box.right * 10) / 10 };
      }).filter((item) => item.right > document.documentElement.clientWidth + 1).sort((a, b) => b.right - a.right).slice(0, 5)
    }));
    record(`${test.name} loads`, bodyText.length > 40 && layout.bodyText > 40, `body text length ${bodyText.length}`);
    record(`${test.name} has no horizontal overflow`, layout.scrollWidth <= layout.clientWidth + 1, `${layout.scrollWidth} > ${layout.clientWidth}${layout.overflowers.length ? ` (${layout.overflowers.map((item) => `${item.tag}.${item.className}=${item.right}`).join(", ")})` : ""}`);
    record(`${test.name} has active site stylesheet`, layout.activeSiteStylesheet, "site.css did not expose CSS rules");
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
    record("home has 27 dock rooms", await page.locator("[data-room-open]").count() === 27);
    record("home has cinematic dock", await page.locator(".cinematic-dock").count() === 1);
    record("home has one lightbox", await page.locator(".room-lightbox").count() === 1);
    record("home has no legacy map or grid", await page.locator(".spatial-world, .district-grid, .district-island, .place-node").count() === 0);
    record("home has flag switcher", await page.locator(".lang-toggle .lang-button").count() === 2);
    record("home has no plain language text", !(await page.locator("body").innerText()).includes("PT-BR | EN"));
    record("home has no meta explanation surface", await page.locator(".dock-intro, .dock-topline, .dock-instruction, .home-secondary, .info-dialog, [data-open-info]").count() === 0);
    record("home keeps the zoom dock", await page.locator('[data-cinematic-dock][data-dock-effect="zoom"]').count() === 1);
  };

  await runPage(browser, {
    name: "home idle desktop",
    route: "pt-br/?qa=autoplay",
    viewport: { width: 1440, height: 900 },
    screenshot: "01-home-idle.png",
    assert: async (page) => {
      await commonHomeAssert(page);
      record("production autoplay interval is five-to-seven seconds", await page.locator('[data-cinematic-dock][data-autoplay-ms="5800"]').count() === 1);
      const before = await page.locator("[data-cinematic-dock]").getAttribute("data-active-id");
      await page.waitForTimeout(1000);
      const after = await page.locator("[data-cinematic-dock]").getAttribute("data-active-id");
      record("autoplay advances in QA mode", before !== after, `${before} -> ${after}`);
    }
  });

  await runPage(browser, {
    name: "Piscina centered",
    route: "pt-br/?qa=1#lido",
    viewport: { width: 1440, height: 900 },
    screenshot: "02-home-piscina.png",
    assert: async (page) => {
    record("hash selects Piscina", await page.locator('[data-cinematic-dock][data-active-id="lido"]').count() === 1);
    record("Piscina is the active visual focus", await page.locator('[data-dock-slide][data-room-id="lido"].is-active').count() === 1);
    record("dock exposes only active caption", await page.locator(".dock-caption [data-active-name]").innerText() === "Piscina Habbo");
    const zoomMetrics = await page.evaluate(() => {
      const dock = document.querySelector("[data-cinematic-dock]");
      const active = dock?.querySelector("[data-dock-slide].is-active");
      const visible = [...(dock?.querySelectorAll("[data-dock-slide]") || [])].filter((slide) => {
        const rect = slide.getBoundingClientRect();
        return rect.right > 0 && rect.left < innerWidth && Number.parseFloat(getComputedStyle(slide).opacity) > .3;
      });
      const activeRect = active?.getBoundingClientRect();
      const neighbor = visible.find((slide) => slide !== active);
      const neighborRect = neighbor?.getBoundingClientRect();
      return {
        visible: visible.length,
        activeWidth: activeRect?.width || 0,
        neighborWidth: neighborRect?.width || 0,
        transform: active ? getComputedStyle(active).transform : "none"
      };
    });
    record("active dock slide is materially zoomed", zoomMetrics.activeWidth > zoomMetrics.neighborWidth * 1.2, JSON.stringify(zoomMetrics));
    record("dock exposes layered depth", zoomMetrics.transform !== "none" && zoomMetrics.transform.includes("matrix3d"), zoomMetrics.transform);
    record("dock exposes five or more visual rooms", zoomMetrics.visible >= 5, `visible ${zoomMetrics.visible}`);
    }
  });

  await runPage(browser, {
    name: "adjacent hover and focus",
    route: "pt-br/?qa=1#lido",
    viewport: { width: 1440, height: 900 },
    screenshot: "03-home-hover.png",
    assert: async (page) => {
      await page.locator('[data-room-open][data-room-id="hallways"]').hover();
      record("hover magnifies adjacent room", await page.locator('[data-dock-slide][data-room-id="hallways"].is-visual-focus').count() === 1);
      await page.locator('[data-room-open][data-room-id="hallways"]').focus();
      const before = await page.locator("[data-cinematic-dock]").getAttribute("data-active-id");
      await page.waitForTimeout(1100);
      record("focus pauses autoplay", await page.locator("[data-cinematic-dock]").getAttribute("data-active-id") === before);
    }
  });

  await runPage(browser, {
    name: "manual controls and drag",
    route: "pt-br/?qa=1#lido",
    viewport: { width: 1440, height: 900 },
    screenshot: "04-home-drag.png",
    assert: async (page) => {
      await page.locator("[data-dock-viewport]").focus();
      await page.keyboard.press("ArrowRight");
      record("keyboard arrow advances dock", await page.locator('[data-cinematic-dock][data-active-id="hallways"]').count() === 1);
      await page.waitForTimeout(100);
      record("slide change exposes transition state", await page.locator("[data-cinematic-dock].is-transitioning").count() === 1);
      const box = await page.locator("[data-dock-viewport]").boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2 + 140, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width / 2 - 180, box.y + box.height / 2, { steps: 8 });
        await page.mouse.up();
      }
      record("drag advances without navigation", await page.locator("[data-cinematic-dock]").count() === 1 && /\/habbo\/pt-br\/$/.test(page.url().split("?")[0]));
      record("drag changes active room", await page.locator('[data-cinematic-dock][data-active-id="hallways"]').count() === 0);
      await page.locator("[data-dock-play]").click();
      const paused = await page.locator("[data-cinematic-dock]").getAttribute("data-active-id");
      await page.waitForTimeout(1100);
      record("manual pause persists", await page.locator("[data-cinematic-dock]").getAttribute("data-active-id") === paused && await page.locator("[data-dock-play]").getAttribute("aria-pressed") === "true");
    }
  });

  await runPage(browser, {
    name: "lightbox Piscina",
    route: "pt-br/?qa=1#lido",
    viewport: { width: 1440, height: 900 },
    screenshot: "05-lightbox-piscina.png",
    assert: async (page) => {
      await page.locator('[data-room-open][data-room-id="lido"]').click();
      record("room click stays on presentation", /\/habbo\/pt-br\/$/.test(page.url().split("?")[0]));
      record("Piscina opens lightbox", await page.locator(".room-lightbox").evaluate((dialog) => dialog.open) && await page.locator("[data-lightbox-title]").innerText() === "Piscina Habbo");
      const lightboxSrc = await page.locator("[data-lightbox-image]").getAttribute("src");
      const lightboxText = await page.locator(".room-lightbox").innerText();
      record("lightbox uses original image without metadata", Boolean(lightboxSrc?.includes("archive-reference/assets/")) && !lightboxText.includes("public_reference_only"));
      record("lightbox CTA points to Piscina detail", (await page.locator("[data-lightbox-detail]").getAttribute("href"))?.endsWith("/lugar/lido/") === true);
    }
  });

  await runPage(browser, {
    name: "lightbox next room",
    route: "pt-br/?qa=1#lido",
    viewport: { width: 1440, height: 900 },
    screenshot: "06-lightbox-other.png",
    assert: async (page) => {
      await page.locator('[data-room-open][data-room-id="lido"]').click();
      await page.locator("[data-lightbox-next]").click();
      record("lightbox next control changes room", await page.locator("[data-lightbox-title]").innerText() !== "Piscina Habbo");
      await page.keyboard.press("Escape");
      record("Escape closes and restores focus", !(await page.locator(".room-lightbox").evaluate((dialog) => dialog.open)) && await page.locator('[data-room-open][data-room-id="hallways"]').evaluate((node) => document.activeElement === node));
    }
  });

  await runPage(browser, {
    name: "detail reached from CTA",
    route: "pt-br/?qa=1#lido",
    viewport: { width: 1440, height: 900 },
    screenshot: "07-detail-from-cta.png",
    assert: async (page) => {
      await page.locator('[data-room-open][data-room-id="lido"]').click();
      await page.locator("[data-lightbox-detail]").click();
      await page.waitForLoadState("networkidle");
      record("CTA reaches Piscina detail", /\/habbo\/pt-br\/lugar\/lido\/$/.test(page.url()));
      record("detail has stateful return", await page.locator('[data-back-presentation][href$="#lido"]').count() >= 1);
      await page.locator("[data-back-presentation]").first().click();
      await page.waitForLoadState("networkidle");
      const returnUrl = new URL(page.url());
      record("detail returns to selected Piscina", returnUrl.pathname.endsWith("/habbo/pt-br/") && returnUrl.hash === "#lido" && await page.locator('[data-cinematic-dock][data-active-id="lido"]').count() === 1);
    }
  });

  await runPage(browser, {
    name: "English presentation",
    route: "en/?qa=1#lido",
    viewport: { width: 1440, height: 900 },
    screenshot: "08-en-home.png",
    assert: async (page) => {
      record("English flag is active", await page.locator('.v2-header .lang-button[data-lang="en"].is-active').count() === 1);
      record("English selected room is Lido", await page.locator('[data-cinematic-dock][data-active-id="lido"]').count() === 1 && await page.locator("[data-active-name]").innerText() === "Lido");
    }
  });

  await runPage(browser, {
    name: "language preserves selected lightbox",
    route: "pt-br/?qa=1#lido",
    viewport: { width: 1200, height: 800 },
    screenshot: "09-language-preserving-lightbox.png",
    assert: async (page) => {
      await page.locator('[data-room-open][data-room-id="lido"]').click();
      await page.locator('.lightbox-lang-toggle .lang-button[data-lang="en"]').click();
      await page.waitForLoadState("networkidle");
      record("language switch preserves room hash", /\/habbo\/en\/$/.test(page.url().split("?")[0]) && page.url().endsWith("#lido"));
      record("language switch preserves lightbox", await page.locator(".room-lightbox").evaluate((dialog) => dialog.open) && await page.locator("[data-lightbox-title]").innerText() === "Lido");
    }
  });

  await runPage(browser, {
    name: "mobile dock",
    route: "pt-br/?qa=1#lido",
    viewport: { width: 390, height: 844 },
    screenshot: "10-mobile-home.png",
    assert: async (page) => {
      await commonHomeAssert(page);
      const width = await page.locator('[data-dock-slide][data-room-id="lido"]').evaluate((node) => node.getBoundingClientRect().width);
      record("mobile central room uses touch-first scale", width >= 280 && width <= 360, `width ${width}`);
    }
  });

  await runPage(browser, {
    name: "mobile swipe",
    route: "pt-br/?qa=1#lido",
    viewport: { width: 390, height: 844 },
    screenshot: "11-mobile-swipe.png",
    assert: async (page) => {
      const box = await page.locator("[data-dock-viewport]").boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width * .72, box.y + box.height * .5);
        await page.mouse.down();
        await page.mouse.move(box.x + box.width * .2, box.y + box.height * .5, { steps: 8 });
        await page.mouse.up();
      }
      record("mobile swipe changes active room", await page.locator('[data-cinematic-dock][data-active-id="lido"]').count() === 0);
      record("mobile swipe stays on home", /\/habbo\/pt-br\/$/.test(page.url().split("?")[0]));
    }
  });

  await runPage(browser, {
    name: "mobile lightbox",
    route: "pt-br/?qa=1#lido",
    viewport: { width: 390, height: 844 },
    screenshot: "12-mobile-lightbox.png",
    assert: async (page) => {
      await page.locator('[data-room-open][data-room-id="lido"]').click();
      record("mobile lightbox opens full image", await page.locator(".room-lightbox").evaluate((dialog) => dialog.open) && await page.locator("[data-lightbox-image]").count() === 1);
    }
  });

  await runPage(browser, {
    name: "reduced motion",
    route: "pt-br/?qa=1",
    viewport: { width: 1440, height: 900 },
    contextOptions: { reducedMotion: "reduce" },
    screenshot: "13-reduced-motion.png",
    assert: async (page) => {
      const before = await page.locator("[data-cinematic-dock]").getAttribute("data-active-id");
      await page.waitForTimeout(1200);
      record("reduced motion disables autoplay", await page.locator("[data-cinematic-dock]").getAttribute("data-active-id") === before);
      record("reduced motion is exposed", await page.locator('[data-cinematic-dock][data-reduced-motion="true"]').count() === 1);
      await page.locator("[data-dock-next]").click();
      record("reduced motion keeps manual controls", await page.locator("[data-cinematic-dock]").getAttribute("data-active-id") !== before);
    }
  });

  await runPage(browser, {
    name: "documentary place page",
    route: "pt-br/lugar/lido/",
    viewport: { width: 1440, height: 900 },
    screenshot: "14-place-detail.png",
    assert: async (page) => {
      record("place page keeps arrival image", await page.locator(".place-arrival .arrival-figure").count() === 1);
      record("place page keeps archive drawer", await page.locator("[data-archive-drawer]").count() === 1);
      const returnHref = await page.locator("[data-back-presentation]").first().getAttribute("href");
      record("place page has presentation return", Boolean(returnHref?.endsWith("#lido")));
    }
  });

  await runPage(browser, {
    name: "topology evidence page",
    route: "pt-br/topologia/",
    viewport: { width: 1440, height: 900 },
    screenshot: "15-topology.png",
    assert: async (page) => {
      record("topology keeps SVG graph", await page.locator(".topology-graph").count() === 1);
      record("topology has no legacy edge cards", await page.locator(".edge-card, .topology-list").count() === 0);
    }
  });
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
fs.writeFileSync(path.join(root, "qa", "HABBO_V2_VISUAL_QA.md"), [
  "# Habbo V2 Cinematic Dock visual QA",
  "",
  `Result: **${report.result}**`,
  `Base URL: **${baseUrl}**`,
  `Screenshots: **${report.screenshots.length}**`,
  "",
  failures.length ? "Failures:\n\n" + failures.map((item) => `- ${item}`).join("\n") : "All browser assertions passed."
].join("\n") + "\n");
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
