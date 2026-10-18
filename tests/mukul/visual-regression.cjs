const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const artifacts = path.join(process.cwd(), 'artifacts');
  fs.mkdirSync(artifacts, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  // Keep verification self-contained: no third-party scripts, web fonts, or online images.
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return route.continue();
    return route.abort();
  });
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  const base = 'http://127.0.0.1:4173';
  await page.goto(base + '/mukul/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(700);
  const homeIds = await page.locator('[id]').evaluateAll(nodes => nodes.map(n => n.id));
  if (new Set(homeIds).size !== homeIds.length) throw new Error('Duplicate IDs on MUKUL homepage');
  await page.locator('#language-select').selectOption('bn');
  const banglaText = await page.locator('#crop-media-intake').innerText();
  if (!banglaText.includes('ছবি') || !banglaText.includes('AI')) throw new Error('Bangla media-intake labels missing');
  await page.locator('#language-select').selectOption('en');
  const englishText = await page.locator('#crop-media-intake').innerText();
  if (!englishText.toLowerCase().includes('photo') || !englishText.toLowerCase().includes('prototype')) throw new Error('English media-intake or limitation notice missing');
  for (const selector of ['#crop-photos', '#crop-video-file', '#start-live-camera', '#capture-live-frame', '#stop-live-camera']) {
    if (!(await page.locator(selector).count())) throw new Error('Missing media control: ' + selector);
  }
  // Gallery/file inputs must not use capture=environment, which can force Android browsers
  // to open the camera instead of the photo gallery/file picker.
  for (const selector of ['#crop-photos', '#crop-video-file']) {
    if (await page.locator(selector).getAttribute('capture')) throw new Error('Gallery upload unexpectedly forces camera: ' + selector);
  }
  await page.locator('#language-select').selectOption('bn');
  const banglaGalleryText = await page.locator('#crop-media-intake').innerText();
  await page.locator('#language-select').selectOption('en');
  const samplePath = path.join(artifacts, 'mukul-gallery-test.png');
  fs.writeFileSync(samplePath, Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l6sAAAAASUVORK5CYII=', 'base64'));
  await page.locator('#crop-photos').setInputFiles(samplePath);
  await page.waitForTimeout(150);
  if (!(await page.locator('#media-preview img').count())) throw new Error('Selected gallery photo was not previewed locally');
  await page.screenshot({ path: path.join(artifacts, 'mukul-desktop.png'), fullPage: true });
  const desktopWidth = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  if (desktopWidth.scroll > desktopWidth.client + 2) throw new Error('Desktop horizontal overflow: ' + JSON.stringify(desktopWidth));

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  const mobileWidth = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  if (mobileWidth.scroll > mobileWidth.client + 2) throw new Error('Mobile horizontal overflow: ' + JSON.stringify(mobileWidth));
  await page.screenshot({ path: path.join(artifacts, 'mukul-mobile.png'), fullPage: true });

  await page.goto(base + '/mukul/knowledge/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  const knowledgeIds = await page.locator('[id]').evaluateAll(nodes => nodes.map(n => n.id));
  if (new Set(knowledgeIds).size !== knowledgeIds.length) throw new Error('Duplicate IDs on MUKUL Knowledge page');
  await page.locator('#language').selectOption('bn');
  if (!(await page.locator('body').innerText()).includes('মূল পৃষ্ঠা')) throw new Error('Knowledge page Bangla switch failed');
  await page.locator('#language').selectOption('en');
  if (failures.length) throw new Error('Browser JavaScript errors: ' + failures.join(' | '));
  await browser.close();
  console.log('MUKUL browser regression passed: bilingual labels, media controls, unique IDs, mobile/desktop overflow, and local-only screenshot capture.');
})().catch(error => { console.error(error); process.exit(1); });
