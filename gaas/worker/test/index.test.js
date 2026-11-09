import { describe, it, expect } from "vitest";
import worker, { classifyOpenAIError, extractResponse } from "../src/index.js";

const ORIGIN = "https://regtechnexusai.com";
const ENV = {
  ALLOWED_ORIGIN: ORIGIN,
  OPENAI_API_KEY: "test-only-placeholder",
  TURNSTILE_SECRET_KEY: "test-only-placeholder"
};

describe("GaaS research API edge behaviour", () => {
  it("returns a public health response without requiring an Origin header", async () => {
    const response = await worker.fetch(new Request("https://worker.example/health"), ENV);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "ok", service: "gaas-research-api", mode: "phase-1-mvp" });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns CORS headers only for an approved origin", async () => {
    const response = await worker.fetch(new Request("https://worker.example/api/research", {
      method: "OPTIONS", headers: { Origin: ORIGIN }
    }), ENV);
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBe(ORIGIN);
    expect(response.headers.get("access-control-allow-methods")).toContain("POST");
  });

  it("rejects an unapproved origin, including preflight", async () => {
    const request = new Request("https://worker.example/api/research", {
      method: "OPTIONS", headers: { Origin: "https://evil.example" }
    });
    expect((await worker.fetch(request, ENV)).status).toBe(403);
  });

  it("rejects requests without an allowed Origin", async () => {
    const response = await worker.fetch(new Request("https://worker.example/api/research", {
      method: "POST", headers: { "content-type": "application/json" }, body: "{}"
    }), ENV);
    expect(response.status).toBe(403);
  });

  it("rejects unsupported paths", async () => {
    const response = await worker.fetch(new Request("https://worker.example/nope", {
      headers: { Origin: ORIGIN }
    }), ENV);
    expect(response.status).toBe(404);
  });

  it("rejects unsupported methods on the research endpoint", async () => {
    const response = await worker.fetch(new Request("https://worker.example/api/research", {
      method: "GET", headers: { Origin: ORIGIN }
    }), ENV);
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toContain("POST");
  });

  it("rejects oversized requests before provider access", async () => {
    // Use a real oversized body rather than a mismatched Content-Length header;
    // Node's Fetch implementation rejects inconsistent request bodies at construction.
    const oversizedBody = "x".repeat(13 * 1024);
    const response = await worker.fetch(new Request("https://worker.example/api/research", {
      method: "POST",
      headers: { Origin: ORIGIN, "content-type": "application/json" },
      body: oversizedBody
    }), ENV);
    expect(response.status).toBe(413);
  });

  it("does not expose an unconfigured research endpoint", async () => {
    const response = await worker.fetch(new Request("https://worker.example/api/research", {
      method: "POST", headers: { Origin: ORIGIN, "content-type": "application/json" }, body: "{}"
    }), { ALLOWED_ORIGIN: ORIGIN });
    expect(response.status).toBe(503);
  });
});

describe("OpenAI Responses citation extraction", () => {
  it("extracts URL and title from the URL citation annotation itself", () => {
    const result = extractResponse({
      output: [{ type: "message", content: [{
        type: "output_text",
        text: "Bangladesh Bank published a circular.",
        annotations: [{ type: "url_citation", start_index: 0, end_index: 36,
          title: "Bangladesh Bank circular", url: "https://www.bb.org.bd/circulars/example" }]
      }]}]
    });
    expect(result.report).toBe("Bangladesh Bank published a circular.");
    expect(result.citations).toEqual([{
      title: "Bangladesh Bank circular", url: "https://www.bb.org.bd/circulars/example"
    }]);
  });

  it("deduplicates citations and ignores non-HTTPS URLs", () => {
    const result = extractResponse({
      output: [{ type: "message", content: [{
        type: "output_text", text: "Sources",
        annotations: [
          { type: "url_citation", title: "Source A", url: "https://example.com/a", start_index: 0, end_index: 1 },
          { type: "url_citation", title: "Duplicate", url: "https://example.com/a", start_index: 2, end_index: 3 },
          { type: "url_citation", title: "Insecure", url: "http://example.com/b", start_index: 4, end_index: 5 }
        ]
      }]}]
    });
    expect(result.citations).toEqual([{ title: "Source A", url: "https://example.com/a" }]);
  });
});

describe("OpenAI provider diagnostic classification", () => {
  it("distinguishes exhausted prepaid credits from temporary rate limits", () => {
    expect(classifyOpenAIError(429, { type: "insufficient_quota", code: "credit_balance_exhausted" }).code).toBe("OPENAI_CREDIT_BALANCE_EXHAUSTED");
    expect(classifyOpenAIError(429, { type: "rate_limit_error", code: "rate_limit_exceeded" }).code).toBe("OPENAI_TEMPORARY_RATE_LIMIT");
  });
  it("identifies organization and project spend limits", () => {
    expect(classifyOpenAIError(429, { code: "organization_spend_limit_exceeded" }).code).toBe("OPENAI_ORGANIZATION_SPEND_LIMIT");
    expect(classifyOpenAIError(429, { code: "project_spend_limit_exceeded" }).code).toBe("OPENAI_PROJECT_SPEND_LIMIT");
  });
  it("identifies authentication, permission, model and overload errors", () => {
    expect(classifyOpenAIError(401, {}).code).toBe("OPENAI_AUTHENTICATION_FAILED");
    expect(classifyOpenAIError(403, {}).code).toBe("OPENAI_PERMISSION_DENIED");
    expect(classifyOpenAIError(404, {}).code).toBe("OPENAI_MODEL_OR_ENDPOINT_NOT_FOUND");
    expect(classifyOpenAIError(503, { code: "server_is_overloaded" }).code).toBe("OPENAI_MODEL_OVERLOADED");
  });
  it("does not include raw provider error messages in client diagnostics", () => {
    const result = classifyOpenAIError(500, { message: "sensitive provider detail" });
    expect(result.message).not.toContain("sensitive provider detail");
  });
});
