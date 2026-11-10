export const ASSURANCE_STATUS = Object.freeze({
  FINAL: "finalised_pending_human_review",
  SELF_REVIEW: "finalised_after_openai_self_review",
  PRIMARY_FALLBACK: "primary_report_fallback_self_review_unavailable"
});

const REVIEW_CATEGORIES = new Set([
  "citation_accuracy", "source_authenticity", "issuer_document_identity",
  "legal_status", "publication_effective_dates", "amendment_supersession",
  "jurisdiction_applicability", "omitted_authorities", "unsupported_assertion",
  "internal_consistency", "calculation", "control_mapping", "other"
]);
const SEVERITIES = new Set(["critical", "high", "medium", "low", "informational"]);

function boundedString(value, max = 2000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function validateGeminiReview(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("GEMINI_REVIEW_INVALID_SHAPE");
  }
  if (!["pass", "revise", "insufficient_evidence"].includes(value.overall_assessment)) {
    throw new Error("GEMINI_REVIEW_INVALID_ASSESSMENT");
  }
  if (!Array.isArray(value.findings) || value.findings.length > 100) {
    throw new Error("GEMINI_REVIEW_INVALID_FINDINGS");
  }
  const findings = value.findings.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      throw new Error("GEMINI_REVIEW_INVALID_FINDING_" + index);
    }
    const finding = {
      id: boundedString(item.id, 80),
      category: boundedString(item.category, 80),
      severity: boundedString(item.severity, 30),
      claim_or_section: boundedString(item.claim_or_section, 500),
      issue: boundedString(item.issue, 2000),
      evidence_reference: boundedString(item.evidence_reference, 1000),
      rationale: boundedString(item.rationale, 2000),
      proposed_correction: boundedString(item.proposed_correction, 2000),
      confidence: Number(item.confidence)
    };
    if (!finding.id || !REVIEW_CATEGORIES.has(finding.category) ||
        !SEVERITIES.has(finding.severity) || !finding.claim_or_section ||
        !finding.issue || !Number.isFinite(finding.confidence) ||
        finding.confidence < 0 || finding.confidence > 1) {
      throw new Error("GEMINI_REVIEW_INVALID_FINDING_" + index);
    }
    return finding;
  });
  const list = (key) => {
    if (value[key] === undefined) return [];
    if (!Array.isArray(value[key]) || value[key].length > 100) {
      throw new Error("GEMINI_REVIEW_INVALID_" + key.toUpperCase());
    }
    return value[key].map((entry) => boundedString(entry, 1500)).filter(Boolean);
  };
  return {
    overall_assessment: value.overall_assessment,
    findings,
    missing_sources: list("missing_sources"),
    unsupported_claims: list("unsupported_claims"),
    legal_status_and_dates: list("legal_status_and_dates"),
    jurisdiction_coverage_gaps: list("jurisdiction_coverage_gaps"),
    calculations_or_internal_consistency: list("calculations_or_internal_consistency"),
    review_limitations: list("review_limitations")
  };
}

/**
 * Runs the assurance sequence using injected provider functions.
 * The primary report is immutable fallback data: secondary-stage failures
 * must never reject this function or suppress that report.
 */
export async function runAssuranceWorkflow({ primary, reviewWithGemini, selfReviewWithOpenAI, finaliseWithOpenAI }) {
  if (!primary || !boundedString(primary.report, 100000)) {
    throw new Error("PRIMARY_REPORT_REQUIRED");
  }
  const original = {
    report: primary.report,
    citations: Array.isArray(primary.citations) ? primary.citations : [],
    researchDate: primary.researchDate || new Date().toISOString()
  };

  try {
    const rawReview = await reviewWithGemini(original);
    const review = validateGeminiReview(rawReview);
    const finalised = await finaliseWithOpenAI({ primary: original, review });
    if (!finalised || !boundedString(finalised.report, 100000)) {
      throw new Error("OPENAI_FINALISATION_EMPTY");
    }
    return {
      status: ASSURANCE_STATUS.FINAL,
      report: finalised.report,
      citations: Array.isArray(finalised.citations) && finalised.citations.length
        ? finalised.citations : original.citations,
      researchDate: original.researchDate,
      review: {
        provider: "gemini",
        overallAssessment: review.overall_assessment,
        findings: review.findings,
        acceptedFindings: Array.isArray(finalised.acceptedFindings) ? finalised.acceptedFindings : [],
        rejectedFindings: Array.isArray(finalised.rejectedFindings) ? finalised.rejectedFindings : [],
        unresolvedFindings: Array.isArray(finalised.unresolvedFindings) ? finalised.unresolvedFindings : review.findings
      },
      disclaimer: "AI-assisted research and independent model review completed. Human verification and approval remain mandatory; this is not legal advice."
    };
  } catch (geminiOrFinalisationError) {
    // If Gemini failed or its findings could not be finalised, attempt a distinct
    // OpenAI self-review. The error is deliberately not exposed to the customer.
    try {
      const selfReviewed = await selfReviewWithOpenAI(original);
      if (!selfReviewed || !boundedString(selfReviewed.report, 100000)) {
        throw new Error("OPENAI_SELF_REVIEW_EMPTY");
      }
      return {
        status: ASSURANCE_STATUS.SELF_REVIEW,
        report: selfReviewed.report,
        citations: Array.isArray(selfReviewed.citations) && selfReviewed.citations.length
          ? selfReviewed.citations : original.citations,
        researchDate: original.researchDate,
        review: {
          provider: "openai_self_review",
          findings: Array.isArray(selfReviewed.findings) ? selfReviewed.findings : [],
          acceptedFindings: Array.isArray(selfReviewed.acceptedFindings) ? selfReviewed.acceptedFindings : [],
          rejectedFindings: Array.isArray(selfReviewed.rejectedFindings) ? selfReviewed.rejectedFindings : [],
          unresolvedFindings: Array.isArray(selfReviewed.unresolvedFindings) ? selfReviewed.unresolvedFindings : []
        },
        disclaimer: "Gemini independent review was unavailable or unusable. OpenAI performed a separate self-review. Human verification and approval remain mandatory; this is not legal advice."
      };
    } catch {
      return {
        status: ASSURANCE_STATUS.PRIMARY_FALLBACK,
        report: original.report,
        citations: original.citations,
        researchDate: original.researchDate,
        review: {
          provider: "none",
          findings: [],
          acceptedFindings: [],
          rejectedFindings: [],
          unresolvedFindings: [],
          limitation: "Independent review and OpenAI self-review could not be completed."
        },
        disclaimer: "PRIMARY REPORT FALLBACK: the original research report is provided, but neither independent Gemini review nor OpenAI self-review could be completed. Do not treat this report as independently verified. Human verification is mandatory."
      };
    }
  }
}
