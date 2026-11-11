import { describe, expect, it, vi } from "vitest";
import { authenticateCloudflareAccess, verifyCloudflareAccessJwt } from "../src/cloudflare-access-auth.js";

const issuer = "https://example.cloudflareaccess.com";
const audience = "gaas-test-audience";
const env = { ACCESS_ISSUER: issuer, ACCESS_AUD: audience };
const enc = value => btoa(String.fromCharCode(...new TextEncoder().encode(value))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
const b64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");

async function fixture(overrides = {}) {
  const pair = await crypto.subtle.generateKey({ name:"RSASSA-PKCS1-v1_5", modulusLength:2048, publicExponent:new Uint8Array([1,0,1]), hash:"SHA-256" }, true, ["sign","verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", pair.publicKey);
  jwk.kid = "test-key"; jwk.use = "sig";
  const header = enc(JSON.stringify({ alg:"RS256", kid:"test-key" }));
  const claims = enc(JSON.stringify({ iss:issuer, sub:"access-subject-001", aud:[audience], exp:Math.floor(Date.now()/1000)+300, email:"analyst@example.test", ...overrides }));
  const signed = `${header}.${claims}`;
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", pair.privateKey, new TextEncoder().encode(signed));
  return { token:`${signed}.${b64(signature)}`, fetcher:vi.fn().mockResolvedValue(new Response(JSON.stringify({ keys:[jwk] }),{status:200,headers:{"content-type":"application/json"}})) };
}

describe("Cloudflare Access identity and tenant binding",()=>{
  it("verifies a signed Access JWT and its issuer, audience and expiry",async()=>{
    const f=await fixture();
    await expect(verifyCloudflareAccessJwt(f.token,env,f.fetcher)).resolves.toMatchObject({subject:"access-subject-001",issuer,email:"analyst@example.test"});
  });
  it("rejects an invalid audience",async()=>{
    const f=await fixture({aud:["wrong-audience"]});
    await expect(verifyCloudflareAccessJwt(f.token,env,f.fetcher)).rejects.toMatchObject({code:"ACCESS_JWT_AUDIENCE_INVALID",status:401});
  });
  it("rejects an expired token",async()=>{
    const f=await fixture({exp:1});
    await expect(verifyCloudflareAccessJwt(f.token,env,f.fetcher)).rejects.toMatchObject({code:"ACCESS_JWT_EXPIRED",status:401});
  });
  it("rejects a missing bearer token",async()=>{
    await expect(verifyCloudflareAccessJwt(undefined,env)).rejects.toMatchObject({code:"ACCESS_JWT_MISSING",status:401});
  });
  it("derives tenant and role only from the server-side membership record",async()=>{
    const f=await fixture();
    const first=vi.fn().mockResolvedValue({tenant_id:"tenant_alpha_001",role:"analyst"});
    const db={prepare:vi.fn().mockReturnValue({bind:vi.fn().mockReturnValue({first})})};
    const request=new Request("https://gaas.example/api/jobs",{headers:{Authorization:`Bearer ${f.token}`,"x-tenant-id":"tenant_attacker_999"}});
    await expect(authenticateCloudflareAccess(request,env,db,f.fetcher)).resolves.toMatchObject({subject:"access-subject-001",tenantId:"tenant_alpha_001",role:"analyst"});
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("WHERE access_subject=? AND active=1"));
    expect(db.prepare.mock.results[0].value.bind).toHaveBeenCalledWith("access-subject-001");
  });
  it("denies a valid identity with no active tenant membership",async()=>{
    const f=await fixture();
    const db={prepare:vi.fn().mockReturnValue({bind:vi.fn().mockReturnValue({first:vi.fn().mockResolvedValue(null)})})};
    const request=new Request("https://gaas.example/api/jobs",{headers:{Authorization:`Bearer ${f.token}`}});
    await expect(authenticateCloudflareAccess(request,env,db,f.fetcher)).rejects.toMatchObject({code:"TENANT_MEMBERSHIP_NOT_FOUND",status:403});
  });
});
