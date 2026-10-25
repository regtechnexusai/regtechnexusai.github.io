const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const file = 'mukul/knowledge/crop-quizzes.html';
const html = fs.readFileSync(file, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
assert.equal(scripts.length, 1, 'Expected exactly one inline application script');
assert.equal((html.match(/<\/script>/gi) || []).length, 1, 'Script closing tag count must match');
new vm.Script(scripts[0][1], { filename: file });
console.log('PASS: inline JavaScript syntax');

const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'Duplicate HTML id detected');
const requiredIds = [
  'lang','country','region','crop','topic','count','start','practice',
  'daily-five','learning-progress','ready','play','answers','feedback',
  'next','quit','result','score','summary','result-context','learning-review',
  'review','print-result','again'
];
for (const id of requiredIds) assert(ids.includes(id), 'Missing required element id: ' + id);
console.log('PASS: unique IDs and required quiz controls');

const js = scripts[0][1];
for (const [label, pattern] of [
  ['single-answer guard', /if\(answered\)return/],
  ['answer history tracking', /answerHistory\.push\(\{q:q,n:n,ok:ok\}\)/],
  ['score derived from answer history', /answerHistory\.filter\(function\(h\)\{return h\.ok\}\)\.length/],
  ['daily five practice action', /\$\("daily-five"\)\.onclick/],
  ['local progress persistence', /localStorage\.setItem\("mukulQuizProgressV1"/],
  ['print waits for fonts', /document\.fonts\.ready/],
  ['source link uses safe target', /rel="noopener"/]
]) assert(pattern.test(js), 'Missing regression invariant: ' + label);
console.log('PASS: core quiz regression invariants');

assert(!/href=\\\\+"/.test(js), 'Malformed escaped quotes remain in review link builder');
console.log('PASS: review-link escaping');
