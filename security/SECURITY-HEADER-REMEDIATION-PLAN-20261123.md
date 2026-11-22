# Security Header Remediation Plan — 23 Nov 2026

## Evidence
SecurityHeaders/Snyk scan provided by the owner on 22 Nov 2026 at 18:18:33 UTC reported grade F and these response headers absent on `https://regtechnexusai.com/`: Strict-Transport-Security, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Raw response showed HTTP/2 200, server Cloudflare, and `Access-Control-Allow-Origin: *`.

This is a report for the tested homepage response; it does not establish every endpoint's response behavior or a TLS grade.

## Deployment approach
The domain is reportedly served from GitHub Pages behind Cloudflare. Do not commit a `_headers` file as a remediation unless hosting is confirmed to be Cloudflare Pages: GitHub Pages does not consume Cloudflare Pages' `_headers` convention. Prefer Cloudflare dashboard response-header transform rules for the proxied domain, after confirming the DNS record is proxied.

Use Cloudflare Rules > Transform Rules > Response Header Transform Rules. Create a rule scoped to the host `regtechnexusai.com` (and create a separate rule for `www` only if that host is confirmed in use and is intended to serve the same site). Verify in Rules Simulator before deploy and capture the final rule.

## Recommended baseline headers (deploy after review)
- `Strict-Transport-Security: max-age=31536000` — only after HTTPS-only behavior and redirects are verified; initially omit `includeSubDomains` and `preload`.
- `X-Frame-Options: SAMEORIGIN` — test embedded tools/frames first.
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — verify no current feature needs these browser capabilities.

These may be set using Set static operations in a Response Header Transform Rule. Avoid duplicate headers and inspect effective response headers after deployment.

## CSP — not ready to enforce
The report confirms CSP is missing. Do not deploy an enforcement policy before inventorying all script, style, image, font, frame and connect sources used by the existing static site, analytics, calculators, tools and integrations. Build a CSP draft from that inventory; test with `Content-Security-Policy-Report-Only` and observe violations. Avoid adding `unsafe-eval` or broad wildcard sources unless justified by tested compatibility. Only move to enforcement after functional regression tests.

## CORS
The scan observed `Access-Control-Allow-Origin: *`. This may be intentional for public static assets, but inventory API/data endpoints and browser cross-origin dependencies. If no endpoint needs broad CORS, scope it to the relevant public resources or remove it; do not change it without tests.

## Validation / rollback
After deployment, retest:
- HTTPS homepage and HTTP-to-HTTPS redirects
- apex and www canonicalization (only if www exists)
- response headers for homepage and representative tools/assets
- navigation, calculators, analytics, embeds, and client-side integrations
- CSP report-only violations before enforcement

Record timestamp, test URLs, scanner report, rule screenshots, failures and rollback. If any tool breaks, disable or revert the response-header rule immediately and investigate.

## Access limitation
Cloudflare dashboard access is not available to this repository workflow. Dashboard deployment and post-deployment external scans must be performed by an authenticated account holder. This plan does not mark remediation deployed.
