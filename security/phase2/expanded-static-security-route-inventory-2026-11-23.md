# Phase 2 — Expanded Static Security Route Inventory
Date: 23 November 2026

## Scope and methodology
Source-only review of representative pages and external URL strings in GitHub main branch. This inventory identifies browser/API security test candidates; it is not a complete site crawl, dynamic test, penetration test, or vulnerability report. External hyperlinks are distinguished from executable/network dependencies wherever the source context can be inferred.

## Newly reviewed route groups
- Agentic AI Governance
- AI Banking Playbook
- Digital Trade Finance learning hub
- Derivatives
- Sanctions Screening
- Vendor Due Diligence
- Privacy
- Contact
- Stablecoins AML/CFT Risk
- Tool Assurance

## Higher-priority runtime test candidates
| Route | Source observation | Next test |
|---|---|---|
| `/contact.html` | Cloudflare Turnstile JS; social links | Test Turnstile load, token validation, form submit, failure modes, spam controls and privacy disclosure in browser |
| `/gaas/` | Turnstile plus staging Workers API URL | Confirm intended staging exposure, API authentication/rate limits, CORS, input validation, error handling, data minimization and secrets not client-side |
| `/fintech-intelligence-hub/` | Google Translate widget/script | Test widget loading and outbound requests; verify optional behavior and CSP impact |
| Analytics-bearing routes | Google Tag Manager / Analytics script observed in source on multiple routes | Verify consent behavior, opt-out and network calls; no analytics source should be allowlisted without confirming actual use |
| `/ai-banking-playbook.html` | Gumroad/public-file links and social links | Confirm links are navigation only; do not add them to script/connect CSP unless runtime behavior shows fetch/embed |
| `/sanctions-screening/` | Multiple official sanctions-list/reference links | Verify link destinations and freshness; treat as navigational references, not CSP resource origins unless embedded/fetched |
| `/digital-trade-finance/` | Bangladesh Bank, legislation, ICC rules and other reference links | Verify source links, no unexpected embedded resources, link integrity |
| `/privacy.html`, `/contact.html` | Analytics and contact challenge dependencies | Review privacy disclosure consistency with observed analytics/Turnstile behavior |

## External resource classes observed in source
- Analytics: Google Tag Manager / Google Analytics host family
- Cloudflare: Insights and Turnstile
- GaaS research API: staging Worker hostname
- Google Translate: translation widget
- External commerce/download links: Gumroad public files and product pages
- Social/navigation: LinkedIn, Facebook, YouTube, ChatGPT GPT page
- Regulatory/reference sources: Bangladesh Bank, BFIU, FATF, BIS, World Bank, NIST, MAS, UAE, AUSTRAC, OFAC, EU, UK, Canada, India, Malaysia, Indonesia and other government/official sources

## Recommended validation sequence
1. Browser functional and negative tests for `contact.html` Turnstile (valid, invalid, expired token, script blocked, duplicate submission).
2. GaaS API boundary review: staging endpoint inventory; confirm authentication/authorization; rate limiting; request schema and size; injection handling; CORS; error response; logging; data retention; key/secret exposure. No active attack tests performed.
3. Mobile/desktop tests for Google Translate widget and CSP Report-Only violations.
4. Analytics privacy/consent and opt-out verification across routes that load tags.
5. External-link validation for regulatory pages; detect broken links without treating destinations as embedded CSP dependencies.
6. Route-wide browser network capture to replace source-string inventory with verified runtime dependency evidence.
7. Reassess CSP Report-Only policy only after observations; maintain Report-Only and avoid enforcement until compatibility evidence is complete.

## Safety and scope boundaries
- Static source review only; no automated crawler, browser network capture, API probing, vulnerability scanning, or penetration testing was performed.
- This review did not change product code, live Cloudflare settings, API behavior, calculators/formulas, PayScale, MD/CEO KPI logic, or MUKUL.
- Do not treat public official source hyperlinks as required CSP script/connect/frame origins by default.
- Findings are candidates for controlled validation, not confirmed vulnerabilities.
