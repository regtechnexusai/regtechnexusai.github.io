import { describe, it, expect } from "vitest";
import worker, { extractResponse } from "../src/index.js";

describe("GaaS research API edge behaviour", () => {
  it("returns a public health response without requiring an Origin header", async () => {
    const request = new Request("https://worker.example/health");
    const response = await worker.fetch(request, { ALLOWED_ORIGIN: "https://regtechnexusai.com" });
    expect(response.status).toBe(200);
    expect((await response.json()).status).toBe("ok");
  });
  it("rejects an unapproved origin", async () => {
    const request = new Request("https://worker.example/api/research", { method: "POST", headers: { Origin: "https://evil.example", "content-type": "application/json" }, body: "{}" });
    const response = await worker.fetch(request, { ALLOWED_ORIGIN: "https://regtechnexusai.com" });
    expect(response.status).toBe(403);
  });
  it("rejects unsupported paths", async () => {
    const request = new Request("https://worker.example/nope", { headers: { Origin: "https://regtechnexusai.com" } });
    const response = await worker.fetch(request, { ALLOWED_ORIGIN: "https://regtechnexusai.com" });
    expect(response.status).toBe(404);
  });
  it("does not expose an unconfigured research endpoint", async () => {
    const request = new Request("https://worker.example/api/research", { method: "POST", headers: { Origin: "https://regtechnexusai.com", "content-type": "application/json" }, body: "{}" });
    const response = await worker.fetch(request, { ALLOWED_ORIGIN: "https://regtechnexusai.com" });
    expect(response.status).toBe(503);
  });
});


describe("OpenAI Responses citation extraction", () => {
  it("extracts URL and title from the URL citation annotation itself", () => {
    const result = extractResponse({
      output: [{
        type: "message",
        content: [{
          type: "output_text",
          text: "Bangladesh Bank published a circular.",
          annotations: [{
            type: "url_citation",
            start_index: 0,
            end_index: 36,
            title: "Bangladesh Bank circular",
            url: "https://www.bb.org.bd/circulars/example"
          }]
        }]
      }]
    });

    expect(result.report).toBe("Bangladesh Bank published a circular.");
    expect(result.citations).toEqual([{
      title: "Bangladesh Bank circular",
      url: "https://www.bb.org.bd/circulars/example"
    }]);
  });

  it("deduplicates citations and ignores non-HTTPS URLs", () => {
    const result = extractResponse({
      output: [{
        type: "message",
        content: [{
          type: "output_text",
          text: "Sources",
          annotations: [
            { type: "url_citation", title: "Source A", url: "https://example.com/a", start_index: 0, end_index: 1 },
            { type: "url_citation", title: "Source A duplicate", url: "https://example.com/a", start_index: 2, end_index: 3 },
            { type: "url_citation", title: "Insecure", url: "http://example.com/b", start_index: 4, end_index: 5 }
          ]
        }]
      }]
    });

    expect(result.citations).toEqual([{ title: "Source A", url: "https://example.com/a" }]);
  });
});
