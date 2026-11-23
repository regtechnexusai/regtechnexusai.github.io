# CSP Hardening Assessment — 23 November 2026

## Evidence reviewed
- User-provided Snyk/SecurityHeaders scan of `https://regtechnexusai.com/` at 16:31:11 UTC on 23 Nov 2026: Grade A.
- Scan reports a `Content-Security-Policy-Report-Only` response header; it does not report an enforced response CSP header.
- User-provided raw response header confirms the Report-Only policy was returned for the homepage.
- GitHub source `index.html` was fetched from the default branch and inspected.

## Observed policy layers
### Cloudflare response header — Report-Only
The reported policy is broadly permissive and includes:
- `script-src 'self' 'unsafe-inline' https:`
- `style-src 'self' 'unsafe-inline' https:`
- `img-src 'self' data: https:`
- `connect-src 'self' https:`
- `frame-src https:`
- `object-src 'none'`
- `base-uri 'self'`
- `form-action 'self' https:`
- `frame-ancestors 'self'`

This is a monitoring policy, not an enforced browser restriction. Broad `https:` source expressions and `unsafe-inline` reduce the value of CSP if the policy is later enforced.

### Homepage meta CSP — enforced for this document
The fetched homepage source includes a meta CSP with more restrictive source expressions than the Cloudflare Report-Only policy:
- `default-src 'self'`
- `script-src 'self' https://www.googletagmanager.com https://static.cloudflareinsights.com <SHA-256 hash>`
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com`
- `font-src 'self'`
- `connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com`
- `object-src 'none'`
- `base-uri 'self'`
- `form-action 'self'`
- `upgrade-insecure-requests`

Homepage source also contains inline Google Analytics bootstrap code, JSON-LD blocks, and inline styles. The source CSP's script hash may be intended to authorize a specific inline script; verify the hash against exact script bytes before changing it. Meta CSP does not support every CSP directive (notably report-only reporting directives), so response headers remain the appropriate deployment control.

## Assessment
- **Positive:** Report-Only monitoring is in place and the public homepage source has a separate, narrower meta CSP.
- **Policy inconsistency:** Cloudflare Report-Only and homepage meta CSP are not aligned. Report-Only currently tests a much broader policy than the source's meta CSP.
- **Residual concern:** Inline styles are permitted. Avoid blanket removal until inline-style/script dependencies are inventoried and tested.
- **Scope limitation:** Only homepage response/source evidence was reviewed. Other routes, subdomains, APIs, embedded tools, and their third-party dependencies were not comprehensively tested.
- **No enforcement change:** This assessment is documentation-only. No CSP enforcement, API/CORS change, or product logic change was made.

## Recommended next steps (safe sequence)
1. Inventory external script, style, image, font, connect, and frame dependencies for representative pages/routes and embedded tools.
2. Compare live Report-Only violations with the inventory; establish report collection/monitoring availability.
3. Align Cloudflare Report-Only policy to an evidence-based source list, avoiding broad `https:` where possible.
4. Test representative pages and workflows (desktop/mobile), including existing calculators and interactive tools, without modifying their logic.
5. Remove `unsafe-inline` only after confirming a compatible nonce/hash strategy and regression tests.
6. Consider enforcing a stricter CSP only after monitoring and tests show no critical violations; maintain rollback.
7. Review `Access-Control-Allow-Origin: *` in context of each API/data endpoint; do not restrict public static assets without checking use cases.

## Status
CSP hardening is in the assessment/planning stage. Grade A is evidence of header configuration on the tested homepage, not a certification or comprehensive security assurance.
