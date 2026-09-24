# Audit remediation and verification

## Remediated in this package

- Knowledge and Insights now have real pages and unique URLs instead of dead-end on-page links.
- The three featured insight topics have article pages: `ai-ready-banking.html`, `tbml-over-invoicing.html` and `intelligent-supervision.html`.
- Blog, Regulatory Explainers, Frameworks & Toolkits, Publications and Contact each have their own page.
- Homepage anchor targets remain present, and mobile-menu behaviour is implemented in `script.js`. Article-page AI Assistant links are normalised to the homepage fallback section.
- Open Graph, Twitter/X card metadata, JSON-LD and favicon references are included.
- The Facebook link uses the stable page URL `https://www.facebook.com/regtechnexusai`.
- The PayScale 2026 Calculator is live inside the package at `/payscale-2026/`. It is intentionally rule-transparent: users enter the verified current pay, target pay and phase shares. It does not embed unverified official salary tables.
- TradeGuard is labelled as a public demo/MVP and rule-based review support. The homepage states that it uses synthetic or anonymised sample inputs and does not upload/store documents, call an AI API, connect to a bank or make a regulatory determination.
- The `TradeGuard™` mark is not used in the homepage package; naming/trademark clearance remains an external legal decision.
- The exact logo is rendered as a normal image with descriptive alt text rather than being hidden only in a CSS background.

## Requires production verification

These items cannot be proven from a static package alone:

- Confirm `http://regtechnexusai.com/` redirects to `https://regtechnexusai.com/`, enable GitHub Pages Enforce HTTPS, and confirm the `www` policy.
- Check HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy at the live origin. GitHub Pages does not provide arbitrary response headers; use a reverse proxy such as Cloudflare if those headers are required.
- Run Lighthouse/PageSpeed Insights for mobile Core Web Vitals, image weight, caching and the calculator route.
- Submit `https://regtechnexusai.com/sitemap.xml` in Google Search Console and inspect the homepage, Insights, article pages, calculator and `/tradeguard/` separately.
- Confirm the live `/tradeguard/`, `/privacy.html` and `/terms.html` routes and their own metadata after deployment.
- Run keyboard-only and screen-reader checks, including focus order, menu state, contrast and form error announcements.
- Scan repository history and the public repository for secrets before publishing; no credentials belong in this static package.
- Configure `contact@regtechnexusai.com` only after the mailbox exists and SPF, DKIM and DMARC are correctly published. Until then, the package keeps the verified Gmail fallback visible.
