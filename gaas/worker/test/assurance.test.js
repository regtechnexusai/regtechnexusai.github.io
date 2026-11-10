import { describe, expect, it, vi } from "vitest";
import {
  ASSURANCE_STATUS,
  runAssuranceWorkflow,
  validateGeminiReview
} from "../src/assurance.js";

const primary = {
  report: "Primary report with source-led findings.",
  citations: [{ title: "Official source", url: "https://regulator.example/rule" }],
  researchDate: "2026-11-10T12:00:00.000Z"
};
const validReview = {
  overall_assessment: "revise",
  findings: [{
    id: "F-001",
    category: "legal_status",
    severity: "high",
    claim_or_section: "Section 2 — legal status",
    issue: "The instrument's current status is not established.",
    evidence_reference: "Citation 1",
    rationale: "The source page does not show current status.",
    proposed_correction: "Mark current status unverified pending original instrument review.",
    confidence: 0.92
  }],
  missing_sources: [],
  unsupported_claims: [],
  legal_status_and_dates: ["Current status needs confirmation"],
  jurisdiction_coverage_gaps: [],
  calculations_or_internal_consistency: [],
  review_limitations: []
};

describe("Gemini review schema", () => {
  it("accepts a structured review with traceable findings", () => {
    expect(validateGeminiReview(validReview).findings[0].id).toBe("F-001");
  });
  it("rejects malformed findings instead of silently accepting them", () => {
    expect(() => validateGeminiReview({
      overall_assessment: "pass",
      findings: [{ id: "F-1", category: "invented", severity: "urgent" }]
    })).toThrow("GEMINI_REVIEW_INVALID_FINDING_0");
  });
  it("rejects non-object reviewer output", () => {
    expect(() => validateGeminiReview("looks good")).toThrow("GEMINI_REVIEW_INVALID_SHAPE");
  });
});

describe("GaaS guaranteed primary report delivery", () => {
  it("returns OpenAI-finalised output after successful Gemini review", async () => {
    const finalise = vi.fn().mockResolvedValue({
      report: "Revised and source-checked report.",
      acceptedFindings: ["F-001"],
      rejectedFindings: [],
      unresolvedFindings: []
    });
    const result = await runAssuranceWorkflow({
      primary,
      reviewWithGemini: vi.fn().mockResolvedValue(validReview),
      finaliseWithOpenAI: finalise,
      selfReviewWithOpenAI: vi.fn()
    });
    expect(result.status).toBe(ASSURANCE_STATUS.FINAL);
    expect(result.report).toContain("Revised");
    expect(result.review.provider).toBe("gemini");
    expect(finalise).toHaveBeenCalledOnce();
  });

  it("falls back to a distinct OpenAI self-review when Gemini is unavailable", async () => {
    const selfReview = vi.fn().mockResolvedValue({ report: "OpenAI self-reviewed report." });
    const result = await runAssuranceWorkflow({
      primary,
      reviewWithGemini: vi.fn().mockRejectedValue(new Error("Gemini timeout")),
      finaliseWithOpenAI: vi.fn(),
      selfReviewWithOpenAI: selfReview
    });
    expect(result.status).toBe(ASSURANCE_STATUS.SELF_REVIEW);
    expect(result.report).toBe("OpenAI self-reviewed report.");
    expect(result.review.provider).toBe("openai_self_review");
    expect(selfReview).toHaveBeenCalledOnce();
  });

  it("returns the original primary report if Gemini and OpenAI self-review both fail", async () => {
    const result = await runAssuranceWorkflow({
      primary,
      reviewWithGemini: vi.fn().mockRejectedValue(new Error("Gemini quota")),
      finaliseWithOpenAI: vi.fn(),
      selfReviewWithOpenAI: vi.fn().mockRejectedValue(new Error("OpenAI unavailable"))
    });
    expect(result.status).toBe(ASSURANCE_STATUS.PRIMARY_FALLBACK);
    expect(result.report).toBe(primary.report);
    expect(result.citations).toEqual(primary.citations);
    expect(result.disclaimer).toContain("Do not treat this report as independently verified");
  });

  it("uses the OpenAI self-review path when Gemini returns malformed structured output", async () => {
    const result = await runAssuranceWorkflow({
      primary,
      reviewWithGemini: vi.fn().mockResolvedValue({ overall_assessment: "pass", findings: "not-an-array" }),
      finaliseWithOpenAI: vi.fn(),
      selfReviewWithOpenAI: vi.fn().mockResolvedValue({ report: "Fallback review completed." })
    });
    expect(result.status).toBe(ASSURANCE_STATUS.SELF_REVIEW);
    expect(result.report).toBe("Fallback review completed.");
  });

  it("returns the primary report when OpenAI finalisation fails after Gemini review", async () => {
    const result = await runAssuranceWorkflow({
      primary,
      reviewWithGemini: vi.fn().mockResolvedValue(validReview),
      finaliseWithOpenAI: vi.fn().mockRejectedValue(new Error("Finalisation timeout")),
      selfReviewWithOpenAI: vi.fn().mockRejectedValue(new Error("Second OpenAI pass failed"))
    });
    expect(result.status).toBe(ASSURANCE_STATUS.PRIMARY_FALLBACK);
    expect(result.report).toBe(primary.report);
  });
});
