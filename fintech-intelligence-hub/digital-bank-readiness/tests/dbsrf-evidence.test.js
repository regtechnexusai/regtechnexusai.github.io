/* Run with Node.js 22: node --test fintech-intelligence-hub/digital-bank-readiness/tests/dbsrf-evidence.test.js */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const evidence = require("../engine/dbsrf-evidence.js");

function artifact(id, questionLinks) {
  return { id, version:1, artifactDate:"2026-10-25", owner:"Control owner",
    confidence:"High", status:"Reviewed", questionLinks };
}
test("one artifact may map to multiple questions with separate relevance/sufficiency", () => {
  const list = [artifact("EV-001", [
    {questionId:"GOV-01", relevance:"Relevant", sufficiency:"Sufficient", reviewer:"reviewer-1", reviewedAt:"2026-10-25"},
    {questionId:"GOV-02", relevance:"Partially relevant", sufficiency:"Insufficient", reviewer:"reviewer-2", reviewedAt:"2026-10-25"}
  ])];
  assert.equal(evidence.validateInventory(list).valid, true);
  assert.equal(evidence.getQuestionEvidence(list,"GOV-01")[0].sufficiency,"Sufficient");
  assert.equal(evidence.getQuestionEvidence(list,"GOV-02")[0].sufficiency,"Insufficient");
});
test("multiple artifacts can map to the same question", () => {
  const list = [
    artifact("EV-001", [{questionId:"AML-03",relevance:"Relevant",sufficiency:"Sufficient",reviewer:"reviewer-1",reviewedAt:"2026-10-25"}]),
    artifact("EV-002", [{questionId:"AML-03",relevance:"Relevant",sufficiency:"Partially sufficient",reviewer:"reviewer-2",reviewedAt:"2026-10-25"}])
  ];
  assert.equal(evidence.validateInventory(list).valid, true);
  assert.equal(evidence.getQuestionEvidence(list,"AML-03").length, 2);
});
test("evidence summary does not infer sufficiency from a link alone", () => {
  const list = [artifact("EV-001", [{questionId:"PRU-01",relevance:"Partially relevant",sufficiency:"Not assessed"}])];
  const result = evidence.summarizeQuestionEvidence(list,"PRU-01");
  assert.equal(result.reviewedSufficientArtifacts, 0);
  assert.match(result.status,/not established/);
});
test("invalid dates, duplicate IDs, unknown question IDs and invalid confidence are rejected", () => {
  const list = [
    artifact("EV-001", [{questionId:"GOV-01",relevance:"Relevant",sufficiency:"Sufficient"}]),
    {...artifact("EV-001", [{questionId:"FAKE-01",relevance:"Relevant",sufficiency:"Sufficient"}]),artifactDate:"2026-02-31",confidence:"Certain"}
  ];
  assert.equal(evidence.validateInventory(list).valid, false);
});
test("unlinked question list is explicit", () => {
  const result = evidence.validateInventory([]);
  assert.equal(result.valid, true);
  assert.equal(result.summary.unlinkedQuestionIds.length, 28);
});

test("evidence is not treated as reviewed-sufficient without reviewer and review date", () => {
  const list = [artifact("EV-009", [
    {questionId:"GOV-03",relevance:"Relevant",sufficiency:"Sufficient"}
  ])];
  const result = evidence.summarizeQuestionEvidence(list,"GOV-03");
  assert.equal(result.reviewedSufficientArtifacts,0);
  assert.match(result.status,/not established/);
});

test("reviewed-sufficient evidence requires reviewer and review date", () => {
  const list = [artifact("EV-010", [
    {questionId:"REP-01",relevance:"Relevant",sufficiency:"Sufficient"}
  ])];
  const result = evidence.validateInventory(list);
  assert.equal(result.valid,false);
  assert.match(result.errors.join(" "),/reviewer and valid reviewedAt date/);
});
