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
  // Mobile layout regression: crop-help content must stay within a narrow phone viewport.
  await page.setViewportSize({ width: 360, height: 800 });
  await page.waitForTimeout(100);
  const mobileLayout = await page.evaluate(() => {
    const selectors = ['.free-help-front .section-heading .kicker', '.free-help-front .section-heading h2', '.free-help-front .section-heading p', '.free-help-front .free-help-panel'];
    return { viewport: document.documentElement.clientWidth, documentWidth: document.documentElement.scrollWidth,
      boxes: selectors.map(selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { selector, left: r.left, right: r.right, width: r.width }; }) };
  });
  if (mobileLayout.documentWidth > mobileLayout.viewport + 1) throw new Error('MUKUL mobile page has horizontal overflow: ' + JSON.stringify(mobileLayout));
  for (const box of mobileLayout.boxes) {
    if (box.left < 8 || box.right > mobileLayout.viewport - 8) throw new Error('MUKUL mobile crop-help content is clipped: ' + JSON.stringify(box));
  }
  const consentLayout = await page.evaluate(() => {
    const label = document.querySelector('label.ai-consent[for="mukul-gemini-consent"]');
    const span = label && label.querySelector('span');
    if (!label || !span) return { missing: true };
    const lr = label.getBoundingClientRect(), sr = span.getBoundingClientRect();
    return { viewport: document.documentElement.clientWidth, label: { left: lr.left, right: lr.right, width: lr.width }, text: { left: sr.left, right: sr.right, width: sr.width } };
  });
  if (consentLayout.missing) throw new Error('MUKUL Vision API consent label/text is missing');
  if (consentLayout.label.left < 8 || consentLayout.label.right > consentLayout.viewport - 8 || consentLayout.text.left < consentLayout.label.left || consentLayout.text.right > consentLayout.label.right + 1 || consentLayout.text.width < 100) throw new Error('MUKUL mobile Vision API consent text is collapsed or clipped: ' + JSON.stringify(consentLayout));
  await page.setViewportSize({ width: 1440, height: 1000 });
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
  // These fields are intentionally inside a collapsed optional-details disclosure.
  await page.locator('.crop-optional-details > summary').click();
  for (const selector of ['#help-district', '#help-season', '#help-variety', '#help-age', '#help-age-unit', '#help-stage', '#help-start-date', '#help-area', '#help-area-unit', '#help-spread', '#help-field-condition', '#help-management', '#help-leaf-age', '#help-yellow-pattern', '#help-other-signs']) {
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
  await page.locator('#help-leaf-age').selectOption('old');
  await page.locator('#help-yellow-pattern').selectOption('patches');
  await page.locator('#help-other-signs').selectOption('insects');
  await page.locator('#help-region').selectOption('bangladesh');
  await page.locator('#help-crop').selectOption('rice');
  await page.locator('#help-symptom').selectOption('wilt');
  // Assert the known English output below regardless of the preceding bilingual UI checks.
  await page.locator('#language-select').selectOption('en');
  await page.locator('#crop-help-form button[type="submit"]').click();
  let resultText = await page.locator('#crop-help-result').innerText();
  if (resultText.includes('undefined')) throw new Error('MUKUL result contains undefined text');
  if (!resultText.toLowerCase().includes('water level')) throw new Error('Wilting guidance missing; selected symptom=' + await page.locator('#help-symptom').inputValue() + '; language=' + await page.locator('#language-select').inputValue());
  if (!(await page.locator('#media-preview img').count())) throw new Error('Selected media preview missing before report assertions');
  if (!resultText.includes('not a diagnosis') || !resultText.includes('IRRI Rice Knowledge Bank')) throw new Error('Rice safety boundary or authoritative learning reference missing');
  if (!resultText.includes('The problem is spreading') || !resultText.includes('check whether normal drainage paths are blocked') || !resultText.includes('do not guess doses')) throw new Error('Spreading warning, wet-field guidance or no-dose safety boundary missing');
  for (const value of ['Khulna / Dighalia', 'Aman', 'BRRI dhan example', '45 Days', '2026-10-10', '5 শতক', 'Yes, increasing', 'Standing water', 'Rain after irrigation', 'Older / lower leaves', 'Patches in parts of the field', 'Insects near leaves or plant base']) {
    if (!resultText.includes(value)) throw new Error('Submitted local context missing from result: ' + value);
  }
  if (!resultText.includes('no request from this form to send a photo to Google Vision API was recorded') || !resultText.includes('not a diagnosis from photos')) throw new Error('Local-only media limitation or no-diagnosis boundary missing');
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
  // Re-add the sample image after the preceding delete-media check so this case
  // independently verifies the Bangla result's local-only media count.
  await page.locator('#crop-photos').setInputFiles(samplePath);
  await page.locator('#help-symptom').selectOption('spots');
  await page.locator('#crop-help-form button[type="submit"]').click();
  resultText = await page.locator('#crop-help-result').innerText();
  if (resultText.includes('undefined') || !resultText.includes('দাগের রং, আকৃতি, আকার')) throw new Error('Bangla symptom-specific result failed');
  if (!resultText.includes('রোগ নির্ণয় নয়') || !resultText.includes('এই সেশনে নির্বাচিত ছবি: 1')) throw new Error('Bangla safety boundary or photo count missing; result=' + resultText.slice(0, 2500));
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
  await page.waitForFunction(() => document.querySelector('#main-nav a[href="/mukul/"]')?.textContent.trim() === 'মূল পৃষ্ঠা', { timeout: 3000 });
  const knowledgeBanglaText = await page.locator('body').innerText();
  if (!knowledgeBanglaText.includes('মূল পৃষ্ঠা') || !knowledgeBanglaText.includes('সবার জন্য কৃষিশিক্ষা।')) throw new Error('Knowledge page Bangla switch failed; nav=' + await page.locator('#main-nav a[href="/mukul/"]').innerText() + '; heading=' + await page.locator('.hero h1').innerText());
  await page.locator('#language').selectOption('en');

  // Farm Records publishing preview: save, summary, bilingual switch, CSV, privacy page and mobile layout.
  await page.goto(base + '/mukul/farm-records/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(250);
  if (!(await page.title()).includes('MUKUL')) throw new Error('Farm Records title missing');
  await page.locator('#farm-form button[type="submit"]').click();
  if (!(await page.locator('#status').innerText()).includes('অন্তত একটি তথ্য দিন')) throw new Error('Empty Farm Records form should not save a blank record');
  await page.locator('input[name="district"]').fill('Khulna');
  await page.locator('input[name="crop"]').fill('Rice');
  await page.locator('input[name="soil_ph"]').fill('6.2');
  await page.locator('#farm-form button[type="submit"]').click();
  if (!(await page.locator('#summary').innerText()).includes('Khulna')) throw new Error('Farm record was not rendered in summary');
  if (!(await page.locator('#report').innerText()).includes('পরবর্তী করণীয়')) throw new Error('Farm Records Bangla actionable report was not generated');
  if (!(await page.locator('#report').innerText()).includes('২. মাটির পরীক্ষার তথ্য')) throw new Error('Farm Records Bangla soil-test section missing');
  if (!(await page.locator('.site-header .brand-logo').count())) throw new Error('Farm Records is missing the shared MUKUL header logo');
  if (!(await page.locator('.site-footer .footer-logo').count())) throw new Error('Farm Records is missing the shared MUKUL footer logo');
  if (!(await page.locator('.site-header a[href="/mukul/farm-records/"]').count())) throw new Error('Farm Records current-page navigation link missing');
  await page.locator('#language').selectOption('en');
  if (!(await page.locator('#report').innerText()).includes('Suggested next steps')) throw new Error('Farm report did not render in English');
  if (!(await page.locator('body').innerText()).includes('Farm and crop details')) throw new Error('Farm Records English switch failed');
  const csvDownloadPromise = page.waitForEvent('download');
  await page.locator('#export').click();
  const csvDownload = await csvDownloadPromise;
  if (csvDownload.suggestedFilename() !== 'mukul-farm-record.csv') throw new Error('Farm Records CSV download filename mismatch');
  await page.goto(base + '/mukul/farm-records/privacy.html', { waitUntil: 'domcontentloaded' });
  if (!(await page.title()).includes('Privacy')) throw new Error('Farm Records privacy page failed to load');
  await page.goto(base + '/mukul/farm-records/', { waitUntil: 'domcontentloaded' });
  await page.setViewportSize({ width: 390, height: 844 });
  const farmMobileWidth = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  if (farmMobileWidth.scroll > farmMobileWidth.client + 2) throw new Error('Farm Records mobile horizontal overflow: ' + JSON.stringify(farmMobileWidth));
  await page.locator('.menu-toggle').click();
  if (!(await page.locator('#main-nav').isVisible())) throw new Error('Farm Records mobile menu did not open');
  if (!(await page.locator('#main-nav a[href="/mukul/knowledge/"]').count())) throw new Error('Farm Records shared navigation is missing Learning guides');

  if (failures.length) throw new Error('Browser JavaScript errors: ' + failures.join(' | '));
  await browser.close();
  console.log('MUKUL browser regression passed: main site, knowledge page, Farm Records save/summary, bilingual UI, CSV download, privacy page, and mobile/desktop overflow.');
})().catch(error => { console.error(error); process.exit(1); });