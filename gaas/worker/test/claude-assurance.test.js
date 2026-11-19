import { describe, expect, it, vi } from "vitest";
import {
  buildClaudeReviewPayload,
  classifyAnthropicError,
  isClaudeReviewEnabled,
  runClaudeAssuranceReview
} from "../src/claude-assurance.js";

const enabledEnv = {
  GAAS_CLAUDE_REVIEW_ENABLED: "true",
  ANTHROPIC_API_KEY: "test-only-not-a-real-key",
  ANTHROPIC_MODEL: "test-model",
  ANTHROPIC_MAX_OUTPUT_TOKENS: "900"
};

describe("disabled-by-default Claude assurance adapter", () => {
  it("is disabled unless the explicit feature flag, key and model are present", () => {
    expect(isClaudeReviewEnabled({})).toBe(false);
    expect(isClaudeReviewEnabled({ ...enabledEnv, GAAS_CLAUDE_REVIEW_ENABLED: "false" })).toBe(false);
    expect(isClaudeReviewEnabled({ ...enabledEnv, ANTHROPIC_API_KEY: "" })).toBe(false);
    expect(isClaudeReviewEnabled({ ...enabledEnv, ANTHROPIC_MODEL: "" })).toBe(false);
  });

  it("does not call the network when disabled", async () => {
    const fetchImpl = vi.fn();
    const result = await runClaudeAssuranceReview({ report: "synthetic report" }, {}, fetchImpl);
    expect(result).toEqual({ status: "disabled", provider: "anthropic" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("requires a report and limits supplied sources to safe HTTPS URLs", () => {
    expect(() => buildClaudeReviewPayload({ report: " " })).toThrow("CLAUDE_REVIEW_REPORT_REQUIRED");
    const payload = buildClaudeReviewPayload({
      report: "synthetic public regulatory research",
      jurisdiction: "GB",
      topic: "AML/CFT",
      sources: [
        { title: "Official source", url: "https://regulator.example/rule" },
        { title: "Unsafe source", url: "http://example.com" },
        { title: "Invalid source", url: "javascript:alert(1)" }
      ]
    });
    expect(payload.sources).toEqual([{ title: "Official source", url: "https://regulator.example/rule" }]);
  });

  it("sends a bounded Messages API request and normalises the result", async () => {
    const fetchImpl = vi.fn(async (url, options) => {
      expect(url).toBe("https://api.anthropic.com/v1/messages");
      expect(options.headers["x-api-key"]).toBe(enabledEnv.ANTHROPIC_API_KEY);
      expect(options.headers["anthropic-version"]).toBe("2023-06-01");
      const body = JSON.parse(options.body);
      expect(body.model).toBe("test-model");
      expect(body.max_tokens).toBe(900);
      return new Response(JSON.stringify({
        model: "test-model",
        content: [{ type: "text", text: "Synthetic assurance findings." }],
        usage: { input_tokens: 120, output_tokens: 45 }
      }), { status: 200, headers: { "request-id": "req_test_123" } });
    });

    const result = await runClaudeAssuranceReview({
      report: "Synthetic report only",
      sources: [{ title: "Official", url: "https://example.gov/rule" }]
    }, enabledEnv, fetchImpl);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      status: "completed",
      provider: "anthropic",
      review: "Synthetic assurance findings.",
      usage: { inputTokens: 120, outputTokens: 45 },
      providerRequestId: "req_test_123"
    });
  });

  it("classifies billing, quota and authentication failures as non-retryable", () => {
    expect(classifyAnthropicError(401).retryable).toBe(false);
    expect(classifyAnthropicError(402).code).toBe("ANTHROPIC_BILLING_LIMIT");
    expect(classifyAnthropicError(429).retryable).toBe(false);
    expect(classifyAnthropicError(503).retryable).toBe(true);
  });

  it("does not expose raw provider error messages", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      error: { type: "authentication_error", message: "secret diagnostic text" }
    }), { status: 401 }));
    const result = await runClaudeAssuranceReview({ report: "Synthetic report" }, enabledEnv, fetchImpl);
    expect(result).toMatchObject({
      status: "failed",
      errorCode: "ANTHROPIC_AUTHENTICATION_FAILED",
      retryable: false
    });
    expect(JSON.stringify(result)).not.toContain("secret diagnostic text");
  });
});
