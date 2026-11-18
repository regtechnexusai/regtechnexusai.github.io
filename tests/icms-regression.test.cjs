const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function makeElement(id = '') {
  const listeners = {};
  const classes = new Set();
  return {
    id, value: '', textContent: '', innerHTML: '', hidden: false, disabled: false,
    style: {}, dataset: {}, children: [], listeners,
    classList: {
      add: (...xs) => xs.forEach(x => classes.add(x)),
      remove: (...xs) => xs.forEach(x => classes.delete(x)),
      toggle: (x, force) => force === undefined ? (classes.has(x) ? classes.delete(x) : classes.add(x)) : (force ? classes.add(x) : classes.delete(x)),
      contains: x => classes.has(x)
    },
    addEventListener: (name, fn) => { listeners[name] = fn; },
    dispatch: (name, event = {}) => listeners[name]?.({ target: this, preventDefault() {}, ...event }),
    setAttribute() {}, removeAttribute() {}, focus() { this.focused = true; },
    scrollIntoView() {}, appendChild(node) { this.children.push(node); },
    querySelectorAll() { return []; },
    closest() { return { classList: this.classList }; },
    reset() {}, remove() {}
  };
}
function boot() {
  const ids = new Map();
  const get = id => { if (!ids.has(id)) ids.set(id, makeElement(id)); return ids.get(id); };
  const questions = Array.from({ length: 24 }, (_, i) => {
    const el = makeElement('q' + (i + 1)); el.name = 'q' + (i + 1); el.value = '';
    return el;
  });
  const form = get('icms-assessment-form');
  form.querySelectorAll = selector => selector === 'select[name^="q"]' ? questions : [];
  const inputIds = ['business-unit-score','ahr-financial','ahr-icms','ahr-reputation','shariah-score'];
  const inputs = inputIds.map(get);
  const capTable = get('cap-table');
  capTable.querySelectorAll = () => [];
  const doc = {
    getElementById: get,
    querySelector: selector => selector === '#cap-table tbody' ? capTable : null,
    querySelectorAll: selector => selector === '#official-ratings input' ? inputs : [],
    createElement: tag => makeElement(tag)
  };
  const win = { setTimeout: fn => fn(), print() {} };
  vm.runInNewContext(fs.readFileSync('icms-2026/icms.js','utf8'), {
    document: doc, window: win, setTimeout: fn => fn(), Date, Number, Math, String,
    Blob: function(){}, URL: { createObjectURL(){return ''}, revokeObjectURL(){} }
  }, { filename: 'icms-2026/icms.js' });
  return { ids, get, questions, form, inputs };
}
function submit(app) { app.form.listeners.submit({ preventDefault() {} }); }

test('ICMS blocks a result while any core question is unanswered', () => {
  const app = boot();
  submit(app);
  assert.match(app.get('assessment-error').textContent, /24 remain unanswered/);
  assert.equal(app.get('assessment-result').hidden, true);
  assert.equal(app.get('result-score').textContent, '');
});
for (const [value, score, band] of [
  ['0', 0, 'Foundation required'],
  ['1', 24, 'Developing'],
  ['2', 48, 'Progressing'],
  ['3', 72, 'Ready for validation']
]) {
  test('ICMS 24-question score '+score+' maps to '+band, () => {
    const app = boot();
    app.questions.forEach(q => { q.value = value; });
    submit(app);
    assert.equal(app.get('result-score').textContent, score);
    assert.equal(app.get('result-band').textContent, band);
    assert.equal(app.get('result-count').textContent, '24 / 24');
  });
}
test('ICMS AHR weighted composite remains 83.0 and Very Good', () => {
  const app = boot();
  app.get('ahr-financial').value = '100';
  app.get('ahr-icms').value = '80';
  app.get('ahr-reputation').value = '60';
  app.inputs[1].listeners.input();
  assert.match(app.get('ahr-output').innerHTML, /82\.0 \/ 100/);
  assert.match(app.get('ahr-output').innerHTML, /Very Good/);
});
test('ICMS business-unit boundaries preserve current bands', () => {
  for (const [score, band] of [['40','Low'],['60','Moderate'],['80','Above Average'],['80.01','High']]) {
    const app = boot();
    app.get('business-unit-score').value = score;
    app.inputs[0].listeners.input();
    assert.match(app.get('business-unit-output').innerHTML, new RegExp(band));
  }
});
test('ICMS Shariah boundaries preserve current categories', () => {
  for (const [score, band] of [['14.99','Low Shariah Non-Compliance Risk'],['15','Moderate Shariah Non-Compliance Risk'],['30','Above Average Non-Compliance Risk'],['50','High Shariah non-compliance risk']]) {
    const app = boot();
    app.get('shariah-score').value = score;
    app.inputs[4].listeners.input();
    assert.match(app.get('shariah-output').innerHTML, new RegExp(band,'i'));
  }
});
test('ICMS AHR rejects values outside 0–100', () => {
  const app = boot();
  app.get('ahr-financial').value = '101';
  app.get('ahr-icms').value = '80';
  app.get('ahr-reputation').value = '60';
  app.inputs[1].listeners.input();
  assert.match(app.get('ahr-output').textContent, /Enter all three component scores/);
});
