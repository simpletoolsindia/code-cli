// Native Browser Tools - Playwright-based headless browser
// Enables live page interaction, screenshots, and dynamic content scraping

import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export interface BrowserResult {
  success: boolean
  content: string
  url?: string
  title?: string
  screenshot?: string
  error?: string
}

// Playwright CLI wrapper - no Node API needed
async function runPlaywright(script: string): Promise<string> {
  // Use project directory for scripts so node_modules is accessible
  const projectRoot = process.cwd()
  const scriptsDir = join(projectRoot, '.playwright-scripts')
  mkdirSync(scriptsDir, { recursive: true })

  const scriptPath = join(scriptsDir, `playwright-script-${Date.now()}.mjs`)
  writeFileSync(scriptPath, script)

  try {
    const result = execSync(
      `node ${scriptPath}`,
      { encoding: 'utf-8', timeout: 30000, maxBuffer: 5 * 1024 * 1024, cwd: projectRoot }
    )
    return result
  } finally {
    // Clean up
    try {
      const { unlinkSync } = require('node:fs')
      unlinkSync(scriptPath)
    } catch { /* ignore */ }
  }
}

// ── Live Browser Tool ─────────────────────────────────────────────────────────

export async function browser_navigate(
  url: string,
  waitForSelector?: string,
  timeout = 15000
): Promise<BrowserResult> {
  try {
    const script = `
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
});
const page = await context.newPage();
page.setDefaultTimeout(${timeout});

await page.goto('${url.replace(/'/g, "\\'")}', { waitUntil: 'domcontentloaded' });
${waitForSelector ? `await page.waitForSelector('${waitForSelector}', { timeout: ${timeout} });` : ''}

const title = await page.title();
const content = await page.content();

console.log(JSON.stringify({
  url: page.url(),
  title,
  content: content.slice(0, 80000)
}));

await browser.close();
`

    const result = await runPlaywright(script)
    const data = JSON.parse(result.trim())
    return {
      success: true,
      url: data.url,
      title: data.title,
      content: data.content || '',
    }
  } catch (e: any) {
    return { success: false, content: '', error: e.message }
  }
}

export async function browser_screenshot(
  url: string,
  selector?: string,
  fullPage = false
): Promise<BrowserResult> {
  try {
    const selectorPart = selector
      ? `await page.waitForSelector('${selector}', { timeout: 10000 }); const element = await page.locator('${selector}'); const screenshot = await element.screenshot({ path: imgPath });`
      : `const screenshot = await page.screenshot({ path: imgPath, fullPage: ${fullPage} });`

    const script = `
import { chromium } from 'playwright';

const imgPath = '/tmp/beast-browser/screenshot-${Date.now()}.png';
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto('${url.replace(/'/g, "\\'")}', { waitUntil: 'domcontentloaded' });
${selectorPart}

const base64 = require('fs').readFileSync(imgPath).toString('base64');
console.log(JSON.stringify({ success: true, screenshot: base64, path: imgPath }));
await browser.close();
`

    const result = await runPlaywright(script)
    const data = JSON.parse(result.trim())
    return {
      success: true,
      content: `Screenshot saved: ${data.path}`,
      url,
      screenshot: data.screenshot,
    }
  } catch (e: any) {
    return { success: false, content: '', error: e.message }
  }
}

export async function browser_click(
  url: string,
  selector: string,
  waitForNavigation = true
): Promise<BrowserResult> {
  try {
    const script = `
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
const page = await browser.newPage();

await page.goto('${url.replace(/'/g, "\\'")}', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('${selector}', { timeout: 15000 });

if (${waitForNavigation}) {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('${selector}')
  ]);
} else {
  await page.click('${selector}');
  await page.waitForTimeout(2000);
}

console.log(JSON.stringify({
  url: page.url(),
  title: await page.title(),
  content: (await page.content()).slice(0, 80000)
}));

await browser.close();
`

    const result = await runPlaywright(script)
    const data = JSON.parse(result.trim())
    return {
      success: true,
      url: data.url,
      title: data.title,
      content: data.content || '',
    }
  } catch (e: any) {
    return { success: false, content: '', error: e.message }
  }
}

export async function browser_type(
  url: string,
  selector: string,
  text: string,
  submit = false
): Promise<BrowserResult> {
  try {
    const script = `
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
const page = await browser.newPage();

await page.goto('${url.replace(/'/g, "\\'")}', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('${selector}', { timeout: 15000 });
await page.fill('${selector}', '${text.replace(/'/g, "\\'")}');

if (${submit}) {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.click('${selector}'),
  ]);
} else {
  await page.waitForTimeout(1000);
}

console.log(JSON.stringify({
  url: page.url(),
  title: await page.title(),
  content: (await page.content()).slice(0, 80000)
}));

await browser.close();
`

    const result = await runPlaywright(script)
    const data = JSON.parse(result.trim())
    return {
      success: true,
      url: data.url,
      title: data.title,
      content: data.content || '',
    }
  } catch (e: any) {
    return { success: false, content: '', error: e.message }
  }
}

export async function browser_evaluate(
  url: string,
  jsCode: string
): Promise<BrowserResult> {
  try {
    const escapedCode = jsCode.replace(/'/g, "\\'").replace(/\n/g, '\\n')
    const script = `
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
const page = await browser.newPage();

await page.goto('${url.replace(/'/g, "\\'")}', { waitUntil: 'domcontentloaded' });
const result = await page.evaluate(function() {
  ${jsCode}
});

console.log(JSON.stringify({
  success: true,
  result: typeof result === 'object' ? JSON.stringify(result) : String(result)
}));

await browser.close();
`

    const result = await runPlaywright(script)
    const data = JSON.parse(result.trim())
    return {
      success: true,
      content: `JS Result: ${data.result}`,
    }
  } catch (e: any) {
    return { success: false, content: '', error: e.message }
  }
}

export async function browser_extract(
  url: string,
  selectors: Record<string, string>
): Promise<BrowserResult> {
  try {
    const selectorsJson = JSON.stringify(selectors).replace(/'/g, "\\'")
    const script = `
import { chromium } from 'playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
const page = await browser.newPage();

await page.goto('${url.replace(/'/g, "\\'")}', { waitUntil: 'domcontentloaded' });

const selectors = ${selectorsJson};
const extracted = {};

for (const [key, selector] of Object.entries(selectors)) {
  try {
    const elements = await page.locator(selector).all();
    if (elements.length === 1) {
      extracted[key] = await elements[0].textContent() || '';
    } else if (elements.length > 1) {
      extracted[key] = await Promise.all(elements.map(e => e.textContent()));
    }
  } catch (e) {
    extracted[key] = 'NOT FOUND';
  }
}

console.log(JSON.stringify({ success: true, extracted, url: page.url() }));
await browser.close();
`

    const result = await runPlaywright(script)
    const data = JSON.parse(result.trim())
    return {
      success: true,
      content: JSON.stringify(data.extracted, null, 2),
      url: data.url,
    }
  } catch (e: any) {
    return { success: false, content: '', error: e.message }
  }
}

// Health check
export async function browser_health(): Promise<{ success: boolean; error?: string }> {
  try {
    const script = `
import { chromium } from 'playwright';
const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  executablePath: '/home/sridhar/.cache/ms-playwright/chromium_headless_shell-1208/chrome-linux/headless_shell',
});
await browser.close();
console.log(JSON.stringify({ success: true }));
`
    await runPlaywright(script)
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}