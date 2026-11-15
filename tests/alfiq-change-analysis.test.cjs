#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const html = fs.readFileSync("alfiq/index.html", "utf8");
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
assert.ok(scripts.length >= 1, "AlfiQ application script exists");
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    id, value: "", hidden: false, textContent: "", innerHTML: "",
    handlers: {}, addEventListener(name, fn) { this.handlers[name] = fn; }
  });
  return elements.get(id);
}
const document = {
  getElementById: element,
  querySelectorAll() { return []; }
};
const sandbox = { document, alert(message) { throw new Error(message); }, console };
vm.runInNewContext(scripts[0], sandbox, { timeout: 2000 });
const oldText = "The Compliance Department shall review the AML policy annually and maintain documented evidence of the review.";
const newText = "The Compliance Department shall review the AML policy quarterly and maintain documented evidence of the review, including approval by the Head of Compliance.";
element("oldText").value = oldText;
element("newText").value = newText;
element("meta").value = "Document reference: TEST-001\nEffective date: Not applicable";
element("analyse").handlers.click();
const clauses = element("clauseChanges").innerHTML;
assert.match(clauses, /annually/, "old cadence is shown as removed");
assert.match(clauses, /quarterly/, "new cadence is shown as added");
assert.match(clauses, /approval by the Head of Compliance/, "new approval clause is shown as added");
const obligations = element("obligationFields").innerHTML;
assert.match(obligations, /The Compliance Department/, "responsible party is extracted");
assert.match(obligations, /shall/, "obligation modality is extracted");
assert.match(obligations, /quarterly/, "frequency is extracted");
assert.match(obligations, /approval by the Head of Compliance/, "approval signal is extracted");
assert.match(obligations, /documented evidence/, "evidence signal is extracted");
const matrix = element("impactMatrix").innerHTML;
for (const area of ["Policy", "Process", "Control", "Ownership", "Evidence"]) {
  assert.match(matrix, new RegExp(area), area + " impact row is present");
}
element("oldText").value = oldText;
element("newText").value = oldText;
element("analyse").handlers.click();
assert.match(element("clauseChanges").innerHTML, /No paragraph changes identified/, "no-change case is explicit");
assert.equal(element("addedN").textContent, 0, "no-change case has zero added paragraphs");
assert.equal(element("removedN").textContent, 0, "no-change case has zero removed paragraphs");
console.log("AlfiQ change-analysis smoke tests passed.");
