# Phase 2 — Route-Family Static Dependency Review
Date: 23 November 2026

## Purpose and scope
This is a static source review of selected route-family HTML pages on the main branch. It identifies explicit external hosts/URLs in source as candidates for CSP Report-Only validation. It is not a dynamic browser test, complete site/API scan, vulnerability assessment, or proof that these sources are loaded at runtime.

## Pages inspected
- `index.html` — Homepage
- `gaas/index.html` — GaaS
- `alfiq/index.html` — AlfiQ
- `fintech-intelligence-hub/index.html` — FinTech Intelligence Hub
- `icms-2026/index.html` — ICMS
- `bank-use-review.html` — Bank-use Review
- `trust/index.html` — Trust
- `regulatory-gap-analyzer/index.html` — Regulatory Gap Analyzer

## External dependency candidates found in source
| Host / origin | Route(s) | Purpose candidate | CSP directives to review |
|---|---|---|---|
| `www.googletagmanager.com` | Homepage, ICMS, Bank-use Review, Regulatory Gap Analyzer | Google Tag Manager / Analytics script | script-src, connect-src |
| `static.cloudflareinsights.com` | Homepage | Cloudflare Insights | script-src, connect-src |
| `*.google-analytics.com`, `*.google.com` | Homepage, ICMS, Regulatory Gap Analyzer | Analytics-related sources | connect-src, img-src |
| `challenges.cloudflare.com` | GaaS | Cloudflare Turnstile | script-src, frame-src, connect-src |
| `gaas-research-api-staging.regtechnexusai.workers.dev` | GaaS | Staging research API | connect-src |
| `translate.google.com` | FinTech Intelligence Hub | Google Translate widget | script-src, connect-src |
| `www.fatf-gafi.org`, `www.bis.org`, `www.worldbank.org` | FinTech Intelligence Hub | External reference links | Navigation links; generally not fetch directives unless embedded/fetched |
| `www.bb.org.bd`, `www.bfiu.org.bd`, `www.mas.gov.sg`, `rulebook.centralbank.ae`, `www.austrac.gov.au`, `www.nist.gov` | Regulatory Gap Analyzer, Trust, ICMS | Official reference links | Review frame-src only if embedded; navigation links do not require script/connect allowlisting |
| `www.linkedin.com`, `www.facebook.com`, `youtube.com`, `chatgpt.com` | Several inspected pages | Social links / GPT link | Usually navigation only; allow CSP only if embedded or fetched |

## Static-source observations
- GaaS source includes Turnstile and a staging Worker API URL; validate intended environment, authentication, CORS, data sensitivity, and whether staging endpoint should be exposed before tightening CSP.
- FinTech Intelligence Hub source includes a Google Translate external script.
- Homepage, ICMS, Bank-use Review, and Regulatory Gap Analyzer include analytics-related references.
- Social and official-source URLs largely appear as hyperlinks; hyperlinks alone do not mean CSP must allow their origins in script-src, connect-src, or frame-src.
- Extracted URLs also include self-links, canonical/SEO references, schema.org strings, and SVG/W3C references; these were excluded from the external fetch-source list.

## Prioritized validation
1. **High:** GaaS route — test Turnstile loading/interaction, form flows, and staging API calls; confirm staging endpoint and data boundaries.
2. **High:** FinTech Intelligence Hub — test Google Translate widget on mobile and desktop; determine whether it is optional and if it can be removed or locally isolated.
3. **Medium:** Homepage / ICMS / Bank-use Review / Regulatory Gap Analyzer — inspect analytics behavior, consent/opt-out handling, and network calls.
4. **Medium:** Trust and regulatory pages — verify links remain navigational and are not embedded/fetched.
5. Crawl other route families and capture real browser network requests to build a complete source inventory before any CSP tightening.

## CSP strategy
- Keep CSP in Report-Only during discovery.
- Replace generic source allowances such as `https:` with explicit origins only after route-family tests.
- `unsafe-inline` in script/style policies remains a risk-reducing priority; evaluate script and style independently and use exact hashes/nonces where feasible. Do not remove inline allowances without tests because functionality may break.
- Preserve `object-src 'none'`, `base-uri 'self'`, and restrictive `frame-ancestors` if verified compatible.
- Do not promote Report-Only to enforced CSP solely because SecurityHeaders grades A.

## Boundaries and status
Documentation-only static review. No product files, application code, APIs, Cloudflare configuration, calculators, PayScale, MD/CEO KPI tools, or MUKUL were changed. No browser runtime tests, API security tests, penetration tests, or route-wide crawling were executed. Findings are source-derived candidates for validation, not vulnerability findings.
