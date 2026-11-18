const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:4173';
let browser;
test.before(async () => { browser = await chromium.launch({ headless: true }); });
test.after(async () => { await browser?.close(); });
test('AlfiQ accepts local text documents on both sides and produces a preliminary comparison', async () => {
  const page = await browser.newPage();
  await page.goto(base + '/alfiq/', { waitUntil: 'domcontentloaded' });
  await page.locator('#earlierFile').setInputFiles({name:'earlier.txt',mimeType:'text/plain',buffer:Buffer.from('The bank shall review customer risk annually.')});
  await page.locator('#revisedFile').setInputFiles({name:'revised.txt',mimeType:'text/plain',buffer:Buffer.from('The bank shall review customer risk quarterly and document escalation.')});
  await page.getByText(/extracted locally into its matching text field/).first().waitFor();
  await page.locator('#analyse').click();
  await page.locator('#report').waitFor({state:'visible'});
  assert.equal(await page.locator('#analyse').isEnabled(),true);
  await page.close();
});
test('AlfiQ rejects a malformed DOCX archive without replacing existing text', async () => {
  const page = await browser.newPage();
  await page.goto(base + '/alfiq/', {waitUntil:'domcontentloaded'});
  await page.locator('#oldText').fill('Existing synthetic source text');
  await page.locator('#earlierFile').setInputFiles({name:'broken.docx',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:Buffer.from('PK-not-a-valid-docx')});
  await page.getByText(/Document extraction stopped:/).waitFor();
  assert.equal(await page.locator('#oldText').inputValue(),'Existing synthetic source text');
  await page.close();
});
test('ICMS completes a 24-answer assessment and downloads its report', async () => {
  const page = await browser.newPage();
  await page.goto(base + '/icms-2026/', {waitUntil:'domcontentloaded'});
  await page.locator('#icms-assessment-form select[name^="q"]').evaluateAll(fields => fields.forEach(field => {field.value='3';field.dispatchEvent(new Event('change',{bubbles:true}));}));
  await page.getByRole('button',{name:/Calculate indicative result/}).click();
  await page.locator('#assessment-result').waitFor({state:'visible'});
  assert.equal(await page.locator('#result-score').textContent(),'72');
  assert.match(await page.locator('#result-band').textContent(),/Ready for validation/);
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#download-report').click();
  const download=await downloadPromise;
  assert.match(download.suggestedFilename(),/^icms-readiness-report-.*\.html$/);
  await page.close();
});
test('TradeGuard transaction-monitoring and document-assessment workspaces render', async () => {
  const page=await browser.newPage();
  await page.goto(base+'/tradeguard/proactive-monitoring.html',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:/Transaction monitoring before the pattern/}).waitFor();
  assert.equal(await page.locator('#proactiveForm').count(),1);
  await page.goto(base+'/tradeguard/document-assessment.html',{waitUntil:'domcontentloaded'});
  await page.getByRole('heading',{name:'Document Assessment',exact:true}).waitFor();
  assert.equal(await page.locator('#documentFileInput').count(),1);
  assert.equal(await page.locator('#runDocumentAssessment').isEnabled(),true);
  await page.close();
});

test('TradeGuard mobile navigation is compact, scroll-contained and responsive', async () => {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(base + '/tradeguard/', { waitUntil: 'domcontentloaded' });
  const menu = page.locator('.tradeguard-main-nav .menu');
  const nav = page.locator('.tradeguard-main-nav nav');
  await menu.click();
  await nav.waitFor({ state: 'visible' });
  const desktop = await nav.evaluate(element => ({ display: getComputedStyle(element).display, direction: getComputedStyle(element).flexDirection, width: element.getBoundingClientRect().width }));
  assert.equal(desktop.display, 'flex');
  assert.equal(desktop.direction, 'column');
  assert.ok(desktop.width <= 440);
  await menu.click();
  await page.setViewportSize({ width: 390, height: 844 });
  await menu.click();
  await nav.waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const element = document.querySelector('.tradeguard-main-nav nav');
    return element && getComputedStyle(element).display === 'grid';
  });
  const mobile = await nav.evaluate(element => {
    const style = getComputedStyle(element);
    const heading = element.querySelector('.nav-menu-heading');
    return {
      columns: style.gridTemplateColumns.split(' ').length,
      overflowY: style.overflowY,
      maxHeight: parseFloat(style.maxHeight),
      headingColumn: heading ? getComputedStyle(heading).gridColumn : null,
      headingDisplay: heading ? getComputedStyle(heading).display : null,
      linkCount: element.querySelectorAll('a').length,
      expanded: document.querySelector('.tradeguard-main-nav .menu').getAttribute('aria-expanded')
    };
  });
  assert.equal(mobile.columns, 2);
  assert.equal(mobile.overflowY, 'auto');
  assert.ok(mobile.maxHeight > 0 && mobile.maxHeight < 844);
  assert.match(mobile.headingColumn || '', /1.*-1/);
  assert.equal(mobile.headingDisplay, 'block');
  assert.ok(mobile.linkCount >= 15);
  assert.equal(mobile.expanded, 'true');
  await page.setViewportSize({ width: 360, height: 800 });
  const narrowColumns = await nav.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  assert.equal(narrowColumns, 1);
  await page.close();
});

test('Homepage mobile navigation is compact, two-column and scroll-contained', async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  const menu = page.locator('body.homepage-redesign .nav .menu');
  const nav = page.locator('body.homepage-redesign .nav nav');
  await menu.click();
  await nav.waitFor({ state: 'visible' });
  await page.waitForFunction(() => {
    const element = document.querySelector('body.homepage-redesign .nav nav');
    return element && getComputedStyle(element).display === 'grid';
  });
  const state = await nav.evaluate(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    const heading = element.querySelector('.nav-menu-heading');
    return {
      columns: style.gridTemplateColumns.split(' ').length,
      overflowY: style.overflowY,
      maxHeight: parseFloat(style.maxHeight),
      left: rect.left,
      right: rect.right,
      headingColumn: heading ? getComputedStyle(heading).gridColumn : null,
      linkCount: element.querySelectorAll('a').length
    };
  });
  assert.equal(state.columns, 2);
  assert.equal(state.overflowY, 'auto');
  assert.ok(state.maxHeight > 0 && state.maxHeight < 844);
  assert.ok(state.left >= 0 && state.right <= 390);
  assert.match(state.headingColumn || '', /1.*-1/);
  assert.ok(state.linkCount >= 15);
  await page.setViewportSize({ width: 360, height: 800 });
  assert.equal(await nav.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length), 1);
  await page.close();
});
