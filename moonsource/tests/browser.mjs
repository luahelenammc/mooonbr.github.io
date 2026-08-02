import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const baseUrl = process.env.MOON_SOURCE_REVIEW_URL || 'http://127.0.0.1:4173/moonsource/';
const artifactRoot = path.resolve('review-artifacts');
const screenshotRoot = path.join(artifactRoot, 'screenshots');
fs.mkdirSync(screenshotRoot, { recursive: true });

const report = {
  baseUrl,
  pages: [],
  accessibility: [],
  consoleErrors: [],
  pageErrors: [],
  failures: [],
  links: []
};

const browser = await chromium.launch({ headless: true });
const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 }
];

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, colorScheme: 'light', locale: 'pt-BR' });
  const page = await context.newPage();
  page.on('console', (message) => {
    if (message.type() === 'error') report.consoleErrors.push({ viewport: viewport.name, text: message.text() });
  });
  page.on('pageerror', (error) => report.pageErrors.push({ viewport: viewport.name, text: error.message }));

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  const title = await page.locator('h1').innerText();
  if (!title.includes('Contexto que sua IA consegue realmente usar')) {
    report.failures.push(`${viewport.name}: unexpected hero title`);
  }

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 1) report.failures.push(`${viewport.name}: horizontal overflow ${overflow}px`);

  if (viewport.name === 'mobile') {
    await page.locator('.menu-toggle').click();
    const expanded = await page.locator('.menu-toggle').getAttribute('aria-expanded');
    const visible = await page.locator('#primary-nav').isVisible();
    if (expanded !== 'true' || !visible) report.failures.push('mobile: menu did not open accessibly');
  }

  const axe = await new AxeBuilder({ page }).analyze();
  const serious = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
  report.accessibility.push({ viewport: viewport.name, violations: axe.violations.length, serious: serious.length });
  if (serious.length) {
    report.failures.push(`${viewport.name}: ${serious.length} serious/critical axe violations`);
    fs.writeFileSync(path.join(artifactRoot, `axe-${viewport.name}.json`), JSON.stringify(axe, null, 2));
  }

  const screenshot = path.join(screenshotRoot, `home-${viewport.name}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  report.pages.push({ viewport: viewport.name, screenshot, overflow });
  await context.close();
}

const interactionContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', locale: 'pt-BR' });
const interactionPage = await interactionContext.newPage();
interactionPage.on('console', (message) => {
  if (message.type() === 'error') report.consoleErrors.push({ viewport: 'interaction', text: message.text() });
});
interactionPage.on('pageerror', (error) => report.pageErrors.push({ viewport: 'interaction', text: error.message }));
await interactionPage.goto(baseUrl, { waitUntil: 'networkidle' });

await interactionPage.locator('[data-language="en"]').click();
await interactionPage.waitForFunction(() => document.documentElement.lang === 'en');
const englishTitle = await interactionPage.locator('h1').innerText();
if (englishTitle !== 'Context your AI can actually use.') report.failures.push('language: English interface did not apply');
await interactionPage.screenshot({ path: path.join(screenshotRoot, 'home-english.png'), fullPage: true });

await interactionPage.locator('[data-language="pt"]').click();
await interactionPage.locator('[data-theme-toggle]').click();
const theme = await interactionPage.evaluate(() => document.documentElement.dataset.theme);
if (theme !== 'night') report.failures.push(`theme: expected night, received ${theme}`);
await interactionPage.screenshot({ path: path.join(screenshotRoot, 'home-night.png'), fullPage: true });

const localLinks = [
  new URL('downloads/MOON_SOURCE_SETUP.md', baseUrl).href,
  new URL('downloads/MOON_SOURCE_KERNEL.md', baseUrl).href,
  new URL('/downloads/CHAT_WORK_ROUTING_PROTOCOL_V2_MSL_4_3.md', baseUrl).href,
  new URL('/moonsource/knowledge/', baseUrl).href
];
for (const url of localLinks) {
  const response = await interactionPage.request.get(url);
  report.links.push({ url, status: response.status() });
  if (!response.ok()) report.failures.push(`link: ${url} returned ${response.status()}`);
}

await interactionContext.close();
await browser.close();

if (report.consoleErrors.length) report.failures.push(`${report.consoleErrors.length} browser console errors`);
if (report.pageErrors.length) report.failures.push(`${report.pageErrors.length} uncaught page errors`);

fs.writeFileSync(path.join(artifactRoot, 'browser-report.json'), JSON.stringify(report, null, 2) + '\n');
if (report.failures.length) {
  console.error(report.failures.join('\n'));
  process.exit(1);
}
console.log(`Moon Source browser review passed: ${report.pages.length + 2} screenshots, ${report.accessibility.length} axe audits, ${report.links.length} links.`);
