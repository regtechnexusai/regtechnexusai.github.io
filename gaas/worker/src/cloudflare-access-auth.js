const encoder = new TextEncoder();
const jwksCache = new Map();

function decodeBase64Url(value) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}
function decodeJsonSegment(value) {
  return JSON.parse(new TextDecoder().decode(decodeBase64Url(value)));
}
function unauthorized(code) {
  const error = new Error(code);
  error.code = code;
  error.status = 401;
  return error;
}
async function loadJwks(issuer, fetcher) {
  const cached = jwksCache.get(issuer);
  if (cached && cached.expiresAt > Date.now()) return cached.keys;
  const response = await fetcher(`${issuer}/cdn-cgi/access/certs`, { headers: { accept: "application/json" } });
  if (!response.ok) throw unauthorized("ACCESS_JWKS_UNAVAILABLE");
  const payload = await response.json();
  if (!Array.isArray(payload.keys) || payload.keys.length === 0) throw unauthorized("ACCESS_JWKS_INVALID");
  jwksCache.set(issuer, { keys: payload.keys, expiresAt: Date.now() + 5 * 60 * 1000 });
  return payload.keys;
}

export async function verifyCloudflareAccessJwt(token, env, fetcher = fetch, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (typeof token !== "string") throw unauthorized("ACCESS_JWT_MISSING");
  const parts = token.split(".");
  if (parts.length !== 3) throw unauthorized("ACCESS_JWT_MALFORMED");
  let header, claims;
  try { header = decodeJsonSegment(parts[0]); claims = decodeJsonSegment(parts[1]); }
  catch { throw unauthorized("ACCESS_JWT_MALFORMED"); }
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw unauthorized("ACCESS_JWT_ALGORITHM_REJECTED");
  const issuer = String(env.ACCESS_ISSUER || "").replace(/\/$/, "");
  const audience = String(env.ACCESS_AUD || "");
  if (!issuer || !audience) throw new Error("ACCESS_CONFIGURATION_MISSING");
  if (claims.iss !== issuer || !claims.sub || typeof claims.sub !== "string") throw unauthorized("ACCESS_JWT_CLAIMS_INVALID");
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(audience)) throw unauthorized("ACCESS_JWT_AUDIENCE_INVALID");
  if (!Number.isFinite(claims.exp) || claims.exp <= nowSeconds) throw unauthorized("ACCESS_JWT_EXPIRED");
  if (claims.nbf !== undefined && (!Number.isFinite(claims.nbf) || claims.nbf > nowSeconds)) throw unauthorized("ACCESS_JWT_NOT_YET_VALID");
  const keys = await loadJwks(issuer, fetcher);
  const jwk = keys.find(key => key.kid === header.kid && key.kty === "RSA" && (!key.use || key.use === "sig"));
  if (!jwk) throw unauthorized("ACCESS_JWT_KEY_NOT_FOUND");
  let publicKey;
  try { publicKey = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]); }
  catch { throw unauthorized("ACCESS_JWT_KEY_INVALID"); }
  const signed = encoder.encode(`${parts[0]}.${parts[1]}`);
  const valid = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, decodeBase64Url(parts[2]), signed);
  if (!valid) throw unauthorized("ACCESS_JWT_SIGNATURE_INVALID");
  return { subject: claims.sub, issuer, email: typeof claims.email === "string" ? claims.email : null };
}

export async function authenticateCloudflareAccess(request, env, db, fetcher = fetch) {
  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const identity = await verifyCloudflareAccessJwt(match?.[1], env, fetcher);
  if (!db?.prepare) throw new Error("TENANT_MEMBERSHIP_DATABASE_REQUIRED");
  const membership = await db.prepare(
    "SELECT tenant_id, role FROM gaas_tenant_memberships WHERE access_subject=? AND active=1 LIMIT 1"
  ).bind(identity.subject).first();
  if (!membership || typeof membership.tenant_id !== "string" || !membership.tenant_id || typeof membership.role !== "string") {
    const error = new Error("TENANT_MEMBERSHIP_NOT_FOUND");
    error.code = "TENANT_MEMBERSHIP_NOT_FOUND";
    error.status = 403;
    throw error;
  }
  return Object.freeze({ subject: identity.subject, tenantId: membership.tenant_id, role: membership.role, email: identity.email });
}
