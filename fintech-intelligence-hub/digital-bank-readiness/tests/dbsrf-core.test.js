/* Run: node --test fintech-intelligence-hub/digital-bank-readiness/tests/dbsrf-core.test.js */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../engine/dbsrf-core.js");

function fullAssessment(score = 3) {
  const answers = {};
  for (const q of core.QUESTIONS) {
    answers[q.id] = {
      status: "assessed",
      score,
      evidenceConfidence: "Moderate",
      evidenceIds: ["EV-" + q.id],
      criticalFindingConfirmed: false,
      reviewerVerified: false
    };
  }
  return { answers };
}

test("core contains exactly 28 unique questions across seven pillars", () => {
  assert.equal(core.QUESTIONS.length, 28);
  assert.equal(new Set(core.QUESTIONS.map(q => q.id)).size, 28);
  assert.equal(core.PILLARS.length, 7);
  for (const p of core.PILLARS) assert.equal(p.questions.length, 4);
});

test("complete assessment computes equal-weighted pillar maturity", () => {
  const result = core.assess(fullAssessment(3));
  assert.equal(result.valid, true);
  assert.equal(result.maturityScore, 75);
  assert.equal(result.maturityBand, "Established");
  assert.equal(result.coverage.assessedQuestions, 28);
});

test("score is withheld when any question is unanswered", () => {
  const a = fullAssessment(4);
  delete a.answers["CON-04"];
  const result = core.assess(a);
  assert.equal(result.maturityScore, null);
  assert.equal(result.coverage.unresolvedQuestions, 1);
  assert.equal(result.reportingStatus, "Assessment incomplete — maturity score withheld");
});

test("invalid score ranges and non-integer scores are rejected", () => {
  for (const score of [-1, 5, 2.5, "3", null]) {
    const a = fullAssessment();
    a.answers["GOV-02"].score = score;
    assert.equal(core.validateAssessment(a).valid, false, "score " + String(score));
  }
});

test("unknown question IDs are rejected", () => {
  const a = fullAssessment();
  a.answers["FAKE-99"] = { status: "assessed", score: 4, evidenceConfidence: "High" };
  assert.equal(core.validateAssessment(a).valid, false);
});

test("unverified N/A does not count as resolved and withholds score", () => {
  const a = fullAssessment();
  a.answers["CON-04"] = { status: "na", justification: "Not relevant to this product scope." };
  const result = core.assess(a);
  assert.equal(result.maturityScore, null);
  assert.equal(result.coverage.unresolvedQuestions, 1);
});

test("approved, applicability-verified N/A is disclosed and excluded from denominator", () => {
  const a = fullAssessment(4);
  a.answers["CON-04"] = {
    status: "na",
    justification: "Documented applicability review: this product is not offered in the assessed scope.",
    applicabilityVerified: true,
    approvedBy: "reviewer-01"
  };
  const result = core.assess(a);
  assert.equal(result.maturityScore, 100);
  assert.equal(result.coverage.approvedNAQuestions, 1);
  assert.equal(result.coverage.assessedQuestions, 27);
});

test("an all-N/A pillar has no score and does not count toward five assessed pillars", () => {
  const a = fullAssessment(3);
  for (const id of core.PILLARS.find(p => p.id === "CON").questions) {
    a.answers[id] = {
      status: "na",
      justification: "Approved scope exclusion for this assessment.",
      applicabilityVerified: true,
      approvedBy: "reviewer-01"
    };
  }
  const result = core.assess(a);
  const conduct = result.pillars.find(p => p.id === "CON");
  assert.equal(conduct.score, null);
  assert.equal(conduct.assessedQuestions, 0);
  assert.equal(result.coverage.assessedPillars, 6);
  assert.equal(result.maturityScore, 75);
});

test("fewer than five assessed pillars blocks aggregate maturity", () => {
  const a = { answers: {} };
  for (const p of core.PILLARS.slice(0, 4)) {
    for (const id of p.questions) {
      a.answers[id] = { status: "assessed", score: 3, evidenceConfidence: "Moderate", evidenceIds: ["EV-" + id] };
    }
  }
  for (const p of core.PILLARS.slice(4)) {
    for (const id of p.questions) {
      a.answers[id] = { status: "na", justification: "Out of documented scope", applicabilityVerified: true, approvedBy: "reviewer-01" };
    }
  }
  const result = core.assess(a);
  assert.equal(result.coverage.assessedPillars, 4);
  assert.equal(result.maturityScore, null);
  assert.match(result.reportingStatus, /Insufficient coverage/);
});

test("low critical-gate score is an issue requiring verification, not automatically a confirmed failure", () => {
  const a = fullAssessment(3);
  a.answers["AML-03"] = { status: "assessed", score: 0, evidenceConfidence: "Low", evidenceIds: [] };
  const result = core.assess(a);
  assert.equal(result.criticalGates.find(g => g.questionId === "AML-03").status, "Critical issue — verification required");
  assert.equal(result.reportingStatus, "Critical issue or gate requires verification");
});

test("confirmed critical failure requires reviewer verification and evidence ID", () => {
  const a = fullAssessment(3);
  a.answers["PRU-01"] = {
    status: "assessed", score: 0, evidenceConfidence: "High", evidenceIds: ["EV-CAP-001"],
    criticalFindingConfirmed: true, reviewerVerified: true
  };
  const result = core.assess(a);
  assert.equal(result.criticalGates.find(g => g.questionId === "PRU-01").status, "Critical failure confirmed");
  assert.equal(result.reportingStatus, "Critical failure confirmed — maturity score is diagnostic only; readiness interpretation overridden");
  assert.equal(result.scoreDisposition, "diagnostic-only-critical-failure");
  assert.equal(result.maturityScore, 72.32);
});

test("invalid confirmed-failure claim without evidence is rejected", () => {
  const a = fullAssessment(3);
  a.answers["PRU-01"] = {
    status: "assessed", score: 0, evidenceConfidence: "High", evidenceIds: [],
    criticalFindingConfirmed: true, reviewerVerified: true
  };
  assert.equal(core.validateAssessment(a).valid, false);
});

test("missing critical gate is explicitly unassessed", () => {
  const a = fullAssessment(3);
  delete a.answers["ICT-02"];
  const result = core.assess(a);
  assert.equal(result.criticalGates.find(g => g.questionId === "ICT-02").status, "Critical gate unassessed");
  assert.equal(result.maturityScore, null);
});


test("N/A rationale must meet the minimum length", () => {
  const a = fullAssessment(3);
  a.answers["CON-04"] = {
    status: "na", justification: "Too short", applicabilityVerified: true, approvedBy: "reviewer-01"
  };
  assert.equal(core.validateAssessment(a).valid, false);
  assert.match(core.validateAssessment(a).errors.join(" "), /at least 20 non-whitespace characters/);
});

test("approved N/A on a critical gate triggers escalation and withholds the aggregate score", () => {
  const a = fullAssessment(4);
  a.answers["PRU-01"] = {
    status: "na",
    justification: "Capital requirements are outside this explicitly scoped diagnostic exercise.",
    applicabilityVerified: true,
    approvedBy: "designated-reviewer-01"
  };
  const result = core.assess(a);
  assert.equal(result.maturityScore, null);
  assert.equal(result.scoreDisposition, "withheld-critical-gate-na-exception");
  assert.match(result.reportingStatus, /N\/A exception requires escalation/);
  assert.equal(result.criticalGates.find(g => g.questionId === "PRU-01").status,
    "Critical gate N/A exception — escalation required");
});

test("confirmed critical finding requires an inventory artifact reviewed as relevant and sufficient for that question", () => {
  const a = fullAssessment(3);
  a.answers["AML-03"] = {
    status: "assessed", score: 0, evidenceConfidence: "High", evidenceIds: ["EV-AML-03"],
    criticalFindingConfirmed: true, reviewerVerified: true
  };
  a.evidenceArtifacts = [{
    id: "EV-AML-03", version: 1, artifactDate: "2026-10-25", owner: "AML control owner",
    confidence: "High", status: "Reviewed",
    questionLinks: [{
      questionId: "AML-03", relevance: "Relevant", sufficiency: "Sufficient",
      reviewer: "reviewer-01", reviewedAt: "2026-10-25"
    }]
  }];
  assert.equal(core.validateAssessment(a).valid, true);
  a.evidenceArtifacts[0].questionLinks[0].questionId = "AML-02";
  const result = core.assess(a);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /linked to this question/);
});

test("confirmed critical finding cannot reference an artifact absent from the inventory", () => {
  const a = fullAssessment(3);
  a.answers["REP-01"] = {
    status: "assessed", score: 0, evidenceConfidence: "High", evidenceIds: ["EV-MISSING"],
    criticalFindingConfirmed: true, reviewerVerified: true
  };
  a.evidenceArtifacts = [];
  const result = core.assess(a);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /inventory artifact linked to this question/);
});

test("maturity bands use the defined internal boundaries", () => {
  assert.equal(core.getMaturityBand(19).label, "Initial / severely underdeveloped");
  assert.equal(core.getMaturityBand(20).label, "Early-stage");
  assert.equal(core.getMaturityBand(40).label, "Developing");
  assert.equal(core.getMaturityBand(60).label, "Established");
  assert.equal(core.getMaturityBand(80).label, "Advanced maturity");
  assert.equal(core.getMaturityBand(101), null);
});

test("empty or malformed input is handled without throwing", () => {
  assert.equal(core.assess(null).valid, false);
  assert.equal(core.assess({}).valid, false);
  assert.equal(core.assess({ answers: [] }).valid, false);
});
