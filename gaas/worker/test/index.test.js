import { describe, it, expect } from "vitest";
import worker from "../src/index.js";

describe("GaaS research API edge behaviour", () => {
  it("returns health status only to the configured site origin", async () => {
    const request = new Request("https://worker.example/health", { headers: { Origin: "https://regtechnexusai.com" } });
    const response = await worker.fetch(request, { ALLOWED_ORIGIN: "https://regtechnexusai.com" });
    expect(response.status).toBe(200);
    expect((await response.json()).status).toBe("ok");
    expect(response.headers.get("access-control-allow-origin")).toBe("https://regtechnexusai.com");
  });
  it("rejects an unapproved origin", async () => {
    const request = new Request("https://worker.example/health", { headers: { Origin: "https://evil.example" } });
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
