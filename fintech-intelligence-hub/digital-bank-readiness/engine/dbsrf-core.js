/* DBSRF core assessment engine.
 * Additive module: does not import, modify, or depend on ICMS, TradeGuard, or calculators.
 * CommonJS for Node tests; global DBSRFCore for browser integration.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.DBSRFCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MAX_SCORE = 4;
  const MIN_ASSESSED_PILLARS = 5;
  const MIN_NA_JUSTIFICATION_LENGTH = 20;
  const MATURITY_BANDS = [
    { min: 0, max: 19.999999, label: "Initial / severely underdeveloped" },
    { min: 20, max: 39.999999, label: "Early-stage" },
    { min: 40, max: 59.999999, label: "Developing" },
    { min: 60, max: 79.999999, label: "Established" },
    { min: 80, max: 100, label: "Advanced maturity" }
  ];

  const PILLARS = [
    { id: "GOV", name: "Governance & ownership", questions: ["GOV-01","GOV-02","GOV-03","GOV-04"] },
    { id: "PRU", name: "Prudential resilience", questions: ["PRU-01","PRU-02","PRU-03","PRU-04"] },
    { id: "ICT", name: "Technology & operational resilience", questions: ["ICT-01","ICT-02","ICT-03","ICT-04"] },
    { id: "AML", name: "AML/CFT & financial crime", questions: ["AML-01","AML-02","AML-03","AML-04"] },
    { id: "DAT", name: "Data, models & AI governance", questions: ["DAT-01","DAT-02","DAT-03","DAT-04"] },
    { id: "CON", name: "Consumer outcomes & conduct", questions: ["CON-01","CON-02","CON-03","CON-04"] },
    { id: "REP", name: "Regulatory reporting & assurance", questions: ["REP-01","REP-02","REP-03","REP-04"] }
  ];

  const QUESTIONS = [
    ["GOV-01","GOV","Ownership, ultimate beneficial ownership, source of wealth and capital due diligence"],
    ["GOV-02","GOV","Board and senior-management responsibilities, risk/compliance/audit accountability and independence"],
    ["GOV-03","GOV","Board-approved business model, risk appetite, strategy, limits and viability"],
    ["GOV-04","GOV","Conflicts of interest, related-party exposures, new products and material changes"],
    ["PRU-01","PRU","Capital adequacy, eligible capital, buffers and reconciled data"],
    ["PRU-02","PRU","Liquidity, funding concentration, intraday obligations and stress scenarios"],
    ["PRU-03","PRU","Credit underwriting, concentration, arrears, impairment and expected credit loss"],
    ["PRU-04","PRU","Capital/liquidity contingency, recovery and applicable solvent wind-down planning"],
    ["ICT-01","ICT","Critical services, assets, data flows, dependencies and accountable owners"],
    ["ICT-02","ICT","Identity/access management, privileged access, encryption, secure development and vulnerability management"],
    ["ICT-03","ICT","Business continuity, disaster recovery, incident response, recovery objectives and disruption tolerances"],
    ["ICT-04","ICT","Cloud/core banking/outsourcing lifecycle, concentration risk and exit arrangements"],
    ["AML-01","AML","Customer due diligence, enhanced due diligence, beneficial ownership, ongoing checks and digital onboarding"],
    ["AML-02","AML","Transaction monitoring, fraud detection and customer-risk calibration"],
    ["AML-03","AML","Sanctions/PEP controls, escalation, suspicious-transaction reporting and quality assurance"],
    ["AML-04","AML","Mule accounts, account takeover, synthetic identity and cross-channel fraud patterns"],
    ["DAT-01","DAT","Data assets, definitions, lineage, quality, access, retention and permitted uses"],
    ["DAT-02","DAT","Quantitative/AI model inventory, risk classification, independent validation and change control"],
    ["DAT-03","DAT","Automated credit/fraud decision performance, drift, explainability and fairness"],
    ["DAT-04","DAT","AI/vendor model privacy, security, human oversight, incidents and retirement"],
    ["CON-01","CON","Clear product terms, fees, rates, eligibility and material risks"],
    ["CON-02","CON","Testing customer journeys for harm, unfair treatment, accessibility and misleading design"],
    ["CON-03","CON","Complaints, disputes, unauthorised transactions, losses, resolution and redress"],
    ["CON-04","CON","Customer outcomes by segment, including vulnerable customers and digital exclusion"],
    ["REP-01","REP","Obligations register, accountable owners and timely submissions"],
    ["REP-02","REP","Regulatory-report reconciliation, lineage, validation, adjustments and exceptions"],
    ["REP-03","REP","Escalation of reporting changes, incidents, breaches and supervisory requests"],
    ["REP-04","REP","Independent testing, remediation, management challenge and retesting"]
  ].map(function (row) {
    return { id: row[0], pillarId: row[1], prompt: row[2], criticalGate: ["GOV-01","GOV-04","PRU-01","PRU-02","ICT-02","AML-03","REP-01"].includes(row[0]) };
  });

  const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map(function (q) { return [q.id, q]; }));
  const VALID_CONFIDENCE = new Set(["High", "Moderate", "Low", "Unverified"]);
  const VALID_STATUSES = new Set(["assessed", "na"]);

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function validateAssessment(assessment) {
    const errors = [];
    if (!isPlainObject(assessment)) {
      return { valid: false, errors: ["Assessment must be an object."] };
    }
    if (!isPlainObject(assessment.answers)) {
      return { valid: false, errors: ["Assessment must contain an answers object."] };
    }

    Object.keys(assessment.answers).forEach(function (id) {
      const answer = assessment.answers[id];
      if (!QUESTION_BY_ID[id]) {
        errors.push("Unknown question ID: " + id + ".");
        return;
      }
      if (!isPlainObject(answer)) {
        errors.push(id + ": answer must be an object.");
        return;
      }
      if (!VALID_STATUSES.has(answer.status)) {
        errors.push(id + ": status must be 'assessed' or 'na'.");
        return;
      }
      if (answer.status === "assessed") {
        if (!Number.isInteger(answer.score) || answer.score < 0 || answer.score > MAX_SCORE) {
          errors.push(id + ": score must be an integer from 0 to 4.");
        }
        if (!VALID_CONFIDENCE.has(answer.evidenceConfidence)) {
          errors.push(id + ": evidenceConfidence must be High, Moderate, Low, or Unverified.");
        }
        if (answer.evidenceIds !== undefined && (!Array.isArray(answer.evidenceIds) || answer.evidenceIds.some(function (x) { return typeof x !== "string" || !x.trim(); }))) {
          errors.push(id + ": evidenceIds must be an array of non-empty strings.");
        }
        // Critical-finding evidence is evaluated separately from the maturity score.
        // Missing or unreviewed evidence must not invalidate the numeric answer.

      }
      if (answer.status === "na") {
        if (typeof answer.justification !== "string" || answer.justification.trim().length < MIN_NA_JUSTIFICATION_LENGTH) {
          errors.push(id + ": N/A justification must contain at least " + MIN_NA_JUSTIFICATION_LENGTH + " non-whitespace characters.");
        }
        if (answer.applicabilityVerified === true && (typeof answer.approvedBy !== "string" || !answer.approvedBy.trim())) {
          errors.push(id + ": Enter an approver ID to mark this N/A as verified.");
        }
        if (answer.applicabilityVerified === true && (typeof answer.approvedBy !== "string" || !answer.approvedBy.trim())) {
          errors.push(id + ": verified N/A requires an approver identifier.");
        }
      }
    });

    return { valid: errors.length === 0, errors: errors };
  }

  function isApprovedNA(answer) {
    return answer && answer.status === "na" &&
      typeof answer.justification === "string" && answer.justification.trim().length > 0 &&
      answer.applicabilityVerified === true &&
      typeof answer.approvedBy === "string" && answer.approvedBy.trim().length > 0;
  }

  function answerIsResolved(answer) {
    return !!answer && (answer.status === "assessed" || isApprovedNA(answer));
  }

  function getMaturityBand(score) {
    if (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100) return null;
    return MATURITY_BANDS.find(function (band) { return score >= band.min && score <= band.max; }) || null;
  }

  function evaluateCriticalGates(answers, evidenceArtifacts) {
    function hasReviewedEvidence(id, answer) {
      return Array.isArray(evidenceArtifacts) && Array.isArray(answer.evidenceIds) && answer.evidenceIds.some(function (evidenceId) {
        return evidenceArtifacts.some(function (artifact) {
          if (!artifact || artifact.id !== evidenceId || artifact.status !== "Reviewed" || artifact.confidence === "Unverified" || !Array.isArray(artifact.questionLinks)) return false;
          return artifact.questionLinks.some(function (link) {
            return link && link.questionId === id && link.relevance === "Relevant" && link.sufficiency === "Sufficient" &&
              typeof link.reviewer === "string" && link.reviewer.trim() &&
              typeof link.reviewedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(link.reviewedAt) &&
              !Number.isNaN(Date.parse(link.reviewedAt)) && new Date(link.reviewedAt).toISOString().slice(0,10) === link.reviewedAt;
          });
        });
      });
    }
    return QUESTIONS.filter(function (q) { return q.criticalGate; }).map(function (q) {
      const answer = answers[q.id];
      let status;
      let rationale;
      if (!answer || !answerIsResolved(answer)) {
        status = "Critical gate unassessed";
        rationale = "The answer is missing or N/A applicability has not been verified and approved.";
      } else if (answer.status === "na") {
        status = "Critical gate N/A exception — escalation required";
        rationale = "Approved N/A does not count as a passed critical gate. Obtain designated governance review; the aggregate maturity score is withheld until the exception is resolved.";
       } else if (answer.criticalFindingConfirmed === true) {
        if (answer.reviewerVerified === true && hasReviewedEvidence(q.id, answer)) {
          status = "Critical failure confirmed";
          rationale = "A reviewer-confirmed finding is linked to reviewed, relevant and sufficient evidence.";
        } else {
          status = "Critical finding unconfirmed — reviewed evidence pending";
          rationale = "The maturity score is retained separately. Complete reviewer verification and link reviewed evidence with a valid review date before confirming this gate.";
        }
      } else if (answer.score <= 1) {
        status = "Critical issue — verification required";
        rationale = "Low self-assessment score is a risk signal, not by itself a verified legal or supervisory conclusion.";
      } else {
        status = "No critical gate identified";
        rationale = "This gate did not trigger under the internal scoring rule; this does not establish compliance.";
      }
      return { questionId: q.id, status: status, rationale: rationale };
    });
  }

  function assess(assessment) {
    const validation = validateAssessment(assessment);
    if (!validation.valid) {
      return {
        valid: false,
        errors: validation.errors,
        maturityScore: null,
        maturityBand: null,
        reportingStatus: "Assessment input invalid",
        coverage: { totalQuestions: QUESTIONS.length, resolvedQuestions: 0, assessedQuestions: 0, approvedNAQuestions: 0, unresolvedQuestions: QUESTIONS.length, assessedPillars: 0 },
        pillars: [],
        criticalGates: []
      };
    }

    const answers = assessment.answers;
    const pillars = PILLARS.map(function (pillar) {
      const assessed = pillar.questions.map(function (id) { return { id: id, answer: answers[id] }; })
        .filter(function (entry) { return entry.answer && entry.answer.status === "assessed"; });
      const approvedNA = pillar.questions.filter(function (id) { return isApprovedNA(answers[id]); });
      const unresolved = pillar.questions.filter(function (id) { return !answerIsResolved(answers[id]); });
      const scoreTotal = assessed.reduce(function (sum, entry) { return sum + entry.answer.score; }, 0);
      const percentage = assessed.length ? (scoreTotal / (MAX_SCORE * assessed.length)) * 100 : null;
      return {
        id: pillar.id,
        name: pillar.name,
        score: percentage === null ? null : Math.round(percentage * 100) / 100,
        assessedQuestions: assessed.length,
        approvedNAQuestions: approvedNA.length,
        unresolvedQuestions: unresolved.length,
        applicableAssessedQuestions: assessed.length,
        complete: unresolved.length === 0
      };
    });

    const assessedPillars = pillars.filter(function (p) { return p.assessedQuestions > 0; });
    const resolvedQuestions = QUESTIONS.filter(function (q) { return answerIsResolved(answers[q.id]); }).length;
    const assessedQuestions = QUESTIONS.filter(function (q) { return answers[q.id] && answers[q.id].status === "assessed"; }).length;
    const approvedNAQuestions = QUESTIONS.filter(function (q) { return isApprovedNA(answers[q.id]); }).length;
    const unresolvedQuestions = QUESTIONS.length - resolvedQuestions;
    const criticalGates = evaluateCriticalGates(answers, assessment.evidenceArtifacts);
    const confirmed = criticalGates.some(function (g) { return g.status === "Critical failure confirmed"; });
    const criticalGateNAException = criticalGates.some(function (g) {
      return g.status === "Critical gate N/A exception — escalation required";
    });
    const needsVerification = criticalGates.some(function (g) {
      return g.status === "Critical issue — verification required" || g.status === "Critical gate unassessed";
    });

    const enoughPillars = assessedPillars.length >= MIN_ASSESSED_PILLARS;
    const complete = unresolvedQuestions === 0;
    const maturityScore = complete && enoughPillars && !criticalGateNAException
      ? Math.round((assessedPillars.reduce(function (sum, p) { return sum + p.score; }, 0) / assessedPillars.length) * 100) / 100
      : null;

    let reportingStatus;
    if (confirmed && criticalGateNAException) reportingStatus = "Critical failure confirmed; critical-gate N/A exception — maturity score withheld";
    else if (confirmed) reportingStatus = "Critical failure confirmed — maturity score is diagnostic only; readiness interpretation overridden";
    else if (criticalGateNAException && !complete) reportingStatus = "Critical-gate N/A exception requires escalation; assessment incomplete — maturity score withheld";
    else if (criticalGateNAException && !enoughPillars) reportingStatus = "Critical-gate N/A exception requires escalation; insufficient coverage — maturity score withheld";
    else if (criticalGateNAException) reportingStatus = "Critical-gate N/A exception requires escalation — maturity score withheld";
    else if (needsVerification) reportingStatus = "Critical issue or gate requires verification";
    else if (!complete) reportingStatus = "Assessment incomplete — maturity score withheld";
    else if (!enoughPillars) reportingStatus = "Insufficient coverage — maturity score withheld";
    else reportingStatus = "Internal maturity result available — not a compliance conclusion";

    const scoreDisposition = criticalGateNAException ? "withheld-critical-gate-na-exception" :
      confirmed ? "diagnostic-only-critical-failure" :
      maturityScore === null ? "withheld-incomplete-or-insufficient-coverage" : "internal-maturity-only";

    return {
      valid: true,
      errors: [],
      reportingStatus: reportingStatus,
      scoreDisposition: scoreDisposition,
      maturityScore: maturityScore,
      maturityBand: maturityScore === null ? null : getMaturityBand(maturityScore).label,
      coverage: {
        totalQuestions: QUESTIONS.length,
        resolvedQuestions: resolvedQuestions,
        assessedQuestions: assessedQuestions,
        approvedNAQuestions: approvedNAQuestions,
        unresolvedQuestions: unresolvedQuestions,
        assessedPillars: assessedPillars.length,
        requiredAssessedPillars: MIN_ASSESSED_PILLARS,
        complete: complete
      },
      pillars: pillars,
      criticalGates: criticalGates,
      limitations: [
        "Internal self-assessment methodology; not a regulator rating, legal opinion, audit opinion, licence decision, certification or compliance determination.",
        "A maturity score is shown only when every question is assessed or has a justified, applicability-verified and approved N/A status, and at least five pillars contain assessed questions.",
        "Critical-gate status takes precedence in reporting. 'No critical gate identified' does not establish compliance.",
        "Regulatory applicability and source mappings require separate verification by jurisdiction and date."
      ]
    };
  }

  return Object.freeze({
    MAX_SCORE: MAX_SCORE,
    MIN_ASSESSED_PILLARS: MIN_ASSESSED_PILLARS,
    MIN_NA_JUSTIFICATION_LENGTH: MIN_NA_JUSTIFICATION_LENGTH,
    PILLARS: PILLARS,
    QUESTIONS: QUESTIONS,
    validateAssessment: validateAssessment,
    evaluateCriticalGates: evaluateCriticalGates,
    getMaturityBand: getMaturityBand,
    assess: assess
  });
});
