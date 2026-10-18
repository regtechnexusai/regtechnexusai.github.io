const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const artifacts = path.join(process.cwd(), 'artifacts');
  fs.mkdirSync(artifacts, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  // Keep the check self-contained: allow only the user's own site; block third-party assets.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (['regtechnexusai.com', 'www.regtechnexusai.com', 'regtechnexusai.github.io'].includes(url.hostname)) return route.continue();
    return route.abort();
  });
  const base = process.env.MUKUL_LIVE_URL || 'https://regtechnexusai.com/mukul/';
  const response = await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!response || response.status() < 200 || response.status() >= 400) {
    throw new Error('Live MUKUL page HTTP check failed: ' + (response ? response.status() : 'no response'));
  }
  await page.waitForSelector('#crop-media-intake', { timeout: 20000 });
  await page.waitForSelector('#check-photo-quality', { timeout: 10000 });

  await page.locator('#language-select').selectOption('bn');
  const bn = await page.locator('#crop-media-intake').innerText();
  if (!bn.includes('ছবি')) throw new Error('Bangla language switch failed; visible text: ' + bn.slice(0, 300));
  await page.locator('#language-select').selectOption('en');
  // Switching back from Google Translate may intentionally reload to clear its cookie.
  // Wait until the new document has finished applying the saved English selection.
  await page.waitForFunction(() => {
    const note = (document.querySelector('#photo-quality-note')?.innerText || '').toLowerCase();
    const intake = (document.querySelector('#crop-media-intake')?.innerText || '').toLowerCase();
    return note.includes('no image is uploaded') && intake.includes('photo');
  }, null, { timeout: 20000 });
  const en = await page.locator('#crop-media-intake').innerText();
  const privacyNote = await page.locator('#photo-quality-note').innerText();
  if (!en.toLowerCase().includes('photo') || !privacyNote.toLowerCase().includes('no image is uploaded')) {
    throw new Error('English labels/local-only privacy note missing; visible text: ' + en.slice(0, 300) + ' | note: ' + privacyNote);
  }

  // Generate a synthetic test image locally in the browser; no online images are used.
  const bytes = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 96; canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#438b43'; ctx.fillRect(0, 0, 96, 96);
    ctx.strokeStyle = '#174c35'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(8, 8); ctx.lineTo(88, 88); ctx.stroke();
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  await page.locator('#crop-photos').setInputFiles({
    name: 'synthetic-local-test.png', mimeType: 'image/png', buffer: Buffer.from(bytes)
  });
  await page.locator('#check-photo-quality').click();
  await page.waitForSelector('.photo-quality-card', { timeout: 10000 });
  await page.screenshot({ path: path.join(artifacts, 'mukul-live-desktop.png'), fullPage: true });
  const desktop = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  if (desktop.scroll > desktop.client + 2) throw new Error('Live desktop horizontal overflow: ' + JSON.stringify(desktop));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('#check-photo-quality', { timeout: 10000 });
  const mobile = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  if (mobile.scroll > mobile.client + 2) throw new Error('Live mobile horizontal overflow: ' + JSON.stringify(mobile));
  await page.screenshot({ path: path.join(artifacts, 'mukul-live-mobile.png'), fullPage: true });
  await browser.close();
  console.log('PASS: live HTTP, Bangla/English labels, local synthetic-image quality check, and desktop/mobile layout. Third-party resources blocked; no external images fetched.');
})().catch(error => { console.error(error); process.exit(1); });
