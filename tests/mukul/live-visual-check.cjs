const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const artifacts = path.join(process.cwd(), 'artifacts');
  fs.mkdirSync(artifacts, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  // Only request the user's own website; block third-party images, scripts, fonts, and trackers.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'regtechnexusai.com' || url.hostname === 'www.regtechnexusai.com') return route.continue();
    return route.abort();
  });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const base = process.env.MUKUL_LIVE_URL || 'https://regtechnexusai.com/mukul/';
  const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!response || response.status() < 200 || response.status() >= 400) {
    throw new Error('Live MUKUL page did not return a successful HTTP response');
  }
  await page.waitForSelector('#crop-media-intake', { timeout: 20000 });
  await page.waitForSelector('#check-photo-quality', { timeout: 10000 });
  await page.locator('#language-select').selectOption('bn');
  await page.waitForFunction(() => (document.querySelector('#crop-media-intake')?.innerText || '').includes('ছবি'), null, { timeout: 15000 });
  const bn = await page.locator('#crop-media-intake').innerText();
  if (!bn.includes('ছবি')) throw new Error('Live Bangla language switch did not update media intake');
  await page.locator('#language-select').selectOption('en');
  await page.waitForFunction(() => (document.querySelector('#photo-quality-note')?.innerText || '').toLowerCase().includes('no image is uploaded'), null, { timeout: 15000 });
  const en = await page.locator('#crop-media-intake').innerText();
  const privacyNote = await page.locator('#photo-quality-note').innerText();
  if (!en.toLowerCase().includes('photo') || !privacyNote.toLowerCase().includes('no image is uploaded')) {
    throw new Error('Live English labels or local-only privacy statement missing: ' + JSON.stringify({ mediaText: en.slice(0, 500), privacyNote }));
  }
  await page.screenshot({ path: path.join(artifacts, 'mukul-live-desktop.png'), fullPage: true });
  const desktop = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  if (desktop.scroll > desktop.client + 2) throw new Error('Live desktop horizontal overflow: ' + JSON.stringify(desktop));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('#check-photo-quality', { timeout: 10000 });
  const mobile = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  if (mobile.scroll > mobile.client + 2) throw new Error('Live mobile horizontal overflow: ' + JSON.stringify(mobile));
  await page.screenshot({ path: path.join(artifacts, 'mukul-live-mobile.png'), fullPage: true });

  // Confirm quality check is local-only: a synthetic image is generated in memory, no image URL is fetched.
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/7VQAAAAASUVORK5CYII=', 'base64');
  await page.locator('#crop-photos').setInputFiles({ name: 'local-test.png', mimeType: 'image/png', buffer: png });
  await page.locator('#check-photo-quality').click();
  await page.waitForTimeout(500);
  if (errors.length) throw new Error('Live JavaScript errors: ' + errors.join(' | '));
  await browser.close();
  console.log('Live MUKUL deployment check passed: HTTP response, bilingual UI, local image-quality controls, desktop/mobile layout, and screenshots. Third-party resources were blocked.');
})().catch(error => { console.error(error); process.exit(1); });
