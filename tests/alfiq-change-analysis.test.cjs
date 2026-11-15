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
    handlers: {}, addEventListener(name, fn) { this.handlers[name] = fn; }, focus() { this.focused = true; }, scrollIntoView() { this.scrolled = true; }
  });
  return elements.get(id);
}
const clickedAnchors = [];
const appended = [];
const document = {
  body: {
    appendChild(node) { appended.push(node); },
    removeChild(node) { appended.splice(appended.indexOf(node), 1); }
  },
  getElementById: element,
  createElement(tag) {
    return { tag, style: {}, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; },
      click() { this.clicked = true; clickedAnchors.push(this); },
      remove() { this.removed = true; } };
  },
  querySelectorAll() { return []; }
};
const revoked = [];
const sandbox = {
  document, Blob,
  URL: { createObjectURL(blob) { sandbox.lastBlob = blob; return "blob:alfiq-test"; },
    revokeObjectURL(url) { revoked.push(url); } },
  window: { setTimeout(fn, delay) { sandbox.delayedRevoke = { fn, delay }; },
    print() { sandbox.didPrint = true; } },
  alert(message) { throw new Error(message); }, console
};
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
assert.match(element("printReport").textContent, /quarterly/, "complete report is prepared for print");
assert.match(element("analysisStatus").textContent, /Analysis complete/, "successful analysis status is displayed");
assert.equal(element("results").scrolled, true, "results are brought into view after analysis");
element("download").handlers.click();
assert.equal(clickedAnchors.length, 1, "download link is clicked");
assert.equal(clickedAnchors[0].download, "alfiq-preliminary-review.txt", "download filename is set");
assert.equal(clickedAnchors[0].href, "blob:alfiq-test", "download uses a generated Blob URL");
assert.equal(clickedAnchors[0].removed, true, "temporary download link is removed after click");
assert.equal(sandbox.delayedRevoke.delay, 60000, "Blob URL is retained for mobile download hand-off");
sandbox.delayedRevoke.fn();
assert.deepEqual(revoked, ["blob:alfiq-test"], "Blob URL is eventually revoked");
element("print").handlers.click();
assert.equal(sandbox.didPrint, true, "print action opens the browser print flow");
assert.match(element("printReport").textContent, /STRUCTURED OBLIGATION SIGNALS/, "print-only report includes structured fields");
const matrix = element("impactMatrix").innerHTML;
for (const area of ["Policy", "Process", "Control", "Ownership", "Evidence"]) {
  assert.match(matrix, new RegExp(area), area + " impact row is present");
}
element("oldText").value = "";
element("newText").value = oldText;
element("analyse").handlers.click();
assert.match(element("analysisStatus").textContent, /Earlier \/ existing requirement/, "missing earlier text is identified");
assert.equal(element("oldText").focused, true, "missing field receives focus");
element("oldText").value = oldText;
element("newText").value = oldText;
element("analyse").handlers.click();
assert.match(element("clauseChanges").innerHTML, /No paragraph changes identified/, "no-change case is explicit");
assert.equal(element("addedN").textContent, 0, "no-change case has zero added paragraphs");
assert.equal(element("removedN").textContent, 0, "no-change case has zero removed paragraphs");
console.log("AlfiQ change-analysis smoke tests passed.");
