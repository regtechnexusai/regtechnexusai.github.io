# External Dependency Inventory — CSP Monitoring Baseline
Date: 23 November 2026

## Scope and evidence
This is a preliminary source inventory to guide CSP Report-Only monitoring, based on inspection of the default-branch homepage source and repository file tree. The repository tree currently contains 123 HTML files. This inventory is **not** a complete route crawl, API inventory, browser-network capture, or proof that every listed dependency is used on every page.

## Homepage-observed external dependencies
| Source / host | Observed use in homepage source | CSP directive candidate | Verification status |
|---|---|---|---|
| `www.googletagmanager.com` | Google tag script and related bootstrap | `script-src`, `img-src`, `connect-src` | Source confirmed; live browser network not tested |
| `static.cloudflareinsights.com` | Allowed by homepage script CSP (Cloudflare Insights) | `script-src` | Allowlist confirmed; source execution not independently tested |
| `*.google-analytics.com` | Allowed for image/connect requests in homepage CSP | `img-src`, `connect-src` | Allowlist confirmed; request activity not independently tested |
| `*.google.com` | Allowed in homepage `connect-src` | `connect-src` | Allowlist confirmed; exact requests not independently tested |

## Homepage CSP controls observed
The homepage source contains a meta CSP with `default-src 'self'`, explicit script sources, `style-src 'self' 'unsafe-inline'`, explicit image/font/connect directives, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and `upgrade-insecure-requests`. A script SHA-256 hash is included in the meta policy. Verify it against the exact inline script bytes before relying on it as an authorization.

Cloudflare also returns a CSP Report-Only header (confirmed by user-provided Snyk/SecurityHeaders raw scan). The Report-Only policy includes broad `https:` allowances and `unsafe-inline` for script/style. Report-Only is monitoring and does not block execution.

## Site-wide route inventory starting point
Repository tree evidence: 123 HTML files, including calculators, AlfiQ/GaaS, FinTech Intelligence Hub, regulatory content, student pages, and MUKUL. Because the current security program explicitly excludes MUKUL, PayScale 2026, MD/CEO KPI, and all calculators from modification, those routes are listed for passive dependency observation only and must not be edited or altered as part of this CSP task.

## Recommended CSP monitoring / tightening process
1. Crawl representative pages by route family and record actual network requests (script, style, image, font, connect, frame).
2. Create a dependency list from actual observed requests, not solely from static allowlists.
3. Identify inline scripts/styles; preserve existing functional requirements and validate any hash against exact script content.
4. Align the Cloudflare Report-Only policy with a reviewed source list; remove generic `https:` source allowances only when the route test matrix shows no required dependency is blocked/reported.
5. Monitor CSP reports and test mobile + desktop flows for core tools and non-excluded routes.
6. Only propose enforcement after review, sufficient monitoring, and regression evidence. Use staged rollout and rollback.

## Risks / controls to keep in view
- `unsafe-inline` weakens CSP; evaluate script/style separately and do not remove without dependency/testing evidence.
- Broad `https:` sources are less restrictive than explicit origins.
- `Access-Control-Allow-Origin: *` on the homepage is not automatically a vulnerability; review endpoint-by-endpoint for API/data access, methods, credentials, and sensitive responses before recommending changes.
- CSP is not a substitute for input validation, secure application design, API authorization, or independent penetration testing.

## Current status
Documentation-only baseline. No Cloudflare settings, repository product code, calculator logic, algorithms, APIs, or workflows were changed. A comprehensive route/network inventory and browser regression testing remain outstanding.
