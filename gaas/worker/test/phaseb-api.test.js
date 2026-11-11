import { describe, expect, it, vi } from "vitest";
import { handlePhaseBApi } from "../src/phaseb-api.js";

describe("Phase B authenticated HTTP routes",()=>{
  it("rejects a missing Access bearer token before touching D1",async()=>{
    const db={prepare:vi.fn()};
    const response=await handlePhaseBApi(new Request("https://worker.example/api/jobs",{method:"POST",headers:{"content-type":"application/json"},body:"{}"}),{ASSURANCE_DB:db,ACCESS_ISSUER:"https://team.cloudflareaccess.com",ACCESS_AUD:"test"});
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({error:"ACCESS_JWT_MISSING"});
    expect(db.prepare).not.toHaveBeenCalled();
  });
  it("fails closed when the membership database is unavailable",async()=>{
    const response=await handlePhaseBApi(new Request("https://worker.example/api/jobs",{method:"GET",headers:{Authorization:"Bearer x.y.z"}}),{ACCESS_ISSUER:"https://team.cloudflareaccess.com",ACCESS_AUD:"test"});
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({error:"TENANT_MEMBERSHIP_DATABASE_REQUIRED"});
  });
  it("rejects unsupported methods and paths after authentication configuration is checked",async()=>{
    const response=await handlePhaseBApi(new Request("https://worker.example/api/jobs/not-a-job",{method:"DELETE",headers:{Authorization:"Bearer x.y.z"}}),{});
    expect(response.status).toBe(503);
  });
});
