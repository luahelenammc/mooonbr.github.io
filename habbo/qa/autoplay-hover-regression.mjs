import { chromium } from "playwright";

const baseUrl = (process.env.HABBO_QA_URL || "http://127.0.0.1:4173/habbo").replace(/\/$/, "");
const browser = await chromium.launch({ headless: true });
let failed = false;

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseUrl}/pt-br/?qa=autoplay`, { waitUntil: "networkidle" });

  const dock = page.locator("[data-cinematic-dock]");
  const box = await dock.boundingBox();
  if (!box) throw new Error("cinematic dock has no bounding box");

  // Reproduce the real desktop condition that escaped the old QA: the user
  // opens the page and simply leaves the mouse parked inside the almost-full-
  // viewport Dock. Hover may magnify, but it must not pause the slideshow.
  await page.mouse.move(box.x + box.width * 0.52, box.y + box.height * 0.48);
  const before = await dock.getAttribute("data-active-id");
  await page.waitForTimeout(1150);
  const after = await dock.getAttribute("data-active-id");
  const holds = await dock.getAttribute("data-autoplay-holds");
  const blocked = await dock.getAttribute("data-autoplay-blocked");

  console.log(JSON.stringify({ before, after, holds, blocked, errors }, null, 2));

  if (before === after) {
    console.error(`FAIL: autoplay did not advance with mouse parked inside Dock (${before} -> ${after})`);
    failed = true;
  }
  if ((holds || "").split(",").includes("hover")) {
    console.error(`FAIL: hover leaked into autoplay holds: ${holds}`);
    failed = true;
  }
  if (errors.length) {
    console.error(`FAIL: page errors: ${errors.join(" | ")}`);
    failed = true;
  }
} finally {
  await browser.close();
}

if (failed) process.exit(1);
console.log("PASS: Habbo autoplay continues while pointer is parked inside the Dock.");
