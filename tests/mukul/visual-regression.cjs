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
  const mainOrder = await page.locator('#main-content > section').evaluateAll(nodes => nodes.map(node => node.id));
  if (mainOrder[0] !== 'free-help') throw new Error('Free crop guidance section must be the first section after the site header');
  if (!(mainOrder.indexOf('top') > mainOrder.indexOf('free-help'))) throw new Error('Introductory hero should remain below the crop guidance form');
  if (!(await page.locator('#crop-help-form').isVisible())) throw new Error('Crop guidance form is not immediately visible on landing page');
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
  for (const selector of ['#delete-media', '#refresh-media', '#reset-crop-form']) {
    if (!(await page.locator(selector).count())) throw new Error('Missing media action: ' + selector);
  }
  await page.locator('#refresh-media').click();
  if (!(await page.locator('#media-preview img').count())) throw new Error('Refresh did not preserve and redraw selected media');


  // Functional regression: guidance must match the selected observation and must never
  // render missing translation keys as the literal text "undefined".
  // Local context intake: all requested fields exist, accept user input, and appear in the generated checklist.
  for (const selector of ['#help-district', '#help-season', '#help-variety', '#help-age', '#help-age-unit', '#help-stage', '#help-start-date', '#help-area', '#help-area-unit', '#help-spread', '#help-field-condition', '#help-management']) {
    if (!(await page.locator(selector).count())) throw new Error('Missing local context field: ' + selector);
  }
  await page.locator('#help-district').fill('Khulna / Dighalia');
  await page.locator('#help-season').selectOption('aman');
  await page.locator('#help-variety').fill('BRRI dhan example');
  await page.locator('#help-age').fill('45');
  await page.locator('#help-age-unit').selectOption('days');
  await page.locator('#help-stage').selectOption('vegetative');
  await page.locator('#help-start-date').fill('2026-10-10');
  await page.locator('#help-area').fill('5');
  await page.locator('#help-area-unit').selectOption('shotok');
  await page.locator('#help-spread').selectOption('yes');
  await page.locator('#help-field-condition').selectOption('standing');
  await page.locator('#help-management').fill('Rain after irrigation');
  await page.locator('#help-region').selectOption('bangladesh');
  await page.locator('#help-crop').selectOption('rice');
  await page.locator('#help-symptom').selectOption('wilt');
  await page.locator('#crop-help-form button[type="submit"]').click();
  let resultText = await page.locator('#crop-help-result').innerText();
  if (resultText.includes('undefined')) throw new Error('MUKUL result contains undefined text');
  if (!resultText.includes('water level') || !resultText.includes('Media selected for this session: 1')) throw new Error('Wilting guidance or media count missing');
  if (!resultText.includes('not a diagnosis') || !resultText.includes('IRRI Rice Knowledge Bank')) throw new Error('Rice safety boundary or authoritative learning reference missing');
  for (const value of ['Khulna / Dighalia', 'Aman', 'BRRI dhan example', '45 Days', '2026-10-10', '5 শতক', 'Yes, increasing', 'Standing water', 'Rain after irrigation']) {
    if (!resultText.includes(value)) throw new Error('Submitted local context missing from result: ' + value);
  }
  if (!resultText.includes('not uploaded or analysed the media with AI')) throw new Error('Local-only media limitation missing');
  if (await page.locator('#crop-result-actions').isHidden()) throw new Error('Result print/PDF action did not appear');
  await page.evaluate(() => { window.__printCalled = false; window.print = () => { window.__printCalled = true; }; });
  await page.locator('#print-crop-result').click();
  if (!(await page.locator('body').evaluate(el => el.classList.contains('print-result-mode')))) throw new Error('Result-only print mode did not activate');
  if (!(await page.evaluate(() => window.__printCalled))) throw new Error('Print/PDF action did not call browser print');
  await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  await page.locator('#delete-media').click();
  if ((await page.locator('#media-preview img').count()) || (await page.locator('#crop-photos').inputValue())) throw new Error('Delete media did not clear selected photos');
  if (!(await page.locator('#crop-help-result').isVisible())) throw new Error('Delete media unexpectedly cleared generated result');
  await page.locator('#reset-crop-form').click();
  if (await page.locator('#crop-help-result').isVisible()) throw new Error('Reset did not clear generated result');
  if (!(await page.locator('#crop-result-actions').isHidden())) throw new Error('Reset did not hide result print/PDF action');
  await page.locator('#help-district').fill('Khulna / Dighalia');


  await page.locator('#help-symptom').selectOption('spots');
  await page.locator('#crop-help-form button[type="submit"]').click();
  resultText = await page.locator('#crop-help-result').innerText();
  if (!resultText.includes('spot colour, shape, size') || resultText.includes('water level')) throw new Error('Symptom-specific guidance did not update for leaf spots');

  await page.locator('#language-select').selectOption('bn');
  if (!(await page.locator('#help-district').getAttribute('placeholder')).includes('যেমন')) throw new Error('Bangla local-context placeholder did not translate');
  await page.locator('#help-symptom').selectOption('spots');
  await page.locator('#crop-help-form button[type="submit"]').click();
  resultText = await page.locator('#crop-help-result').innerText();
  if (resultText.includes('undefined') || !resultText.includes('দাগের রং, আকৃতি, আকার')) throw new Error('Bangla symptom-specific result failed');
  if (!resultText.includes('রোগ নির্ণয় নয়') || !resultText.includes('এই সেশনে নির্বাচিত মিডিয়া: 1')) throw new Error('Bangla safety boundary or media count missing');
  await page.locator('#language-select').selectOption('en');
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
