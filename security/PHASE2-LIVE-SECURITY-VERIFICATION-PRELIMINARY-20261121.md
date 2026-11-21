# Phase 2 — Live Security Verification (Preliminary) — 2026-11-21

## Scope
Preliminary public endpoint inspection. This is not a TLS/header scan, penetration test, or security certification.

## Observations
- The public homepage `https://regtechnexusai.com/` was retrieved successfully by the browsing tool. The page content rendered and exposed the site's navigation and public tool descriptions.
- A request to retrieve `https://regtechnexusai.com/gaas/` through the browsing tool returned an internal fetch error. This does **not** establish that the endpoint is down or insecure; its response headers and content remain unverified.
- A request to retrieve `https://regtechnexusai.com/.well-known/security.txt` through the browsing tool returned a disabled/error response. This does **not** establish that the file is missing; direct HTTP response verification remains pending.
- Repository `.well-known/security.txt` file was inspected. It contains Contact, Expires (2027-10-01), Preferred-Languages, Canonical, and Policy fields. Public endpoint serving and response status are not verified.

## Live verification required
Use an authorized environment with direct HTTP/TLS inspection to verify:
1. HTTPS redirect behavior from HTTP and alternate hostname (www) where applicable.
2. TLS certificate chain, hostname, validity and protocol/cipher configuration.
3. Response headers on homepage, GaaS route, contact/privacy and relevant tool pages: HSTS (only after hostname inventory), nosniff, Referrer-Policy, X-Frame-Options or equivalent CSP frame policy, Permissions-Policy, CSP.
4. GaaS effective CSP response policy including `frame-ancestors 'none'`; verify it does not break existing scripts, challenge or research flow.
5. `/.well-known/security.txt` status, content, canonical URL and expiry.
6. Cloudflare proxy/DNS/WAF/rate-limit/Worker/Access/secret configuration from the account dashboard; external observation alone cannot verify these settings.
7. Browser console, navigation, analytics and functional regression across the existing tools, preserving calculator logic.

## Evidence capture template
For each endpoint, capture timestamp (UTC), requested URL, final URL, status, response headers (redact cookies/tokens), TLS summary, tool and version, and result. Record blocked/unsupported checks separately; never treat a tool error as a security finding.

## Preliminary status
- Homepage reachability: observed reachable through browsing tool.
- GaaS endpoint: not verified by this tool.
- security.txt public serving: not verified by this tool.
- TLS/header checks: not run.
- Cloudflare account settings: not inspected.
- Browser functional regression: not run.
- Penetration test: not performed.

This report records preliminary observations and outstanding verification requirements only; it makes no security certification or production-readiness claim.
