# SEO management

This package includes a maintainable SEO baseline for `regtechnexusai.com`.

## Implemented

- Page-specific titles, meta descriptions, canonical URLs and crawl directives.
- Open Graph and Twitter card metadata for the homepage and Insights page.
- Organization, WebSite and CollectionPage JSON-LD structured data.
- `robots.txt` with the public sitemap location.
- `sitemap.xml` covering the known indexable root pages.
- `seo-config.json` as the editable source of truth for page metadata, topic clusters and social profiles.
- `Privacy` and `Terms` marked `noindex,follow` so thin utility pages do not compete with the main content.
- Real indexable content pages for Blog, Regulatory Explainers, Frameworks &amp; Toolkits, Publications and three insight topics.
- An on-domain `/payscale-2026/` calculator route with WebApplication metadata and an explicit non-official disclaimer.

## Approved positioning

Use this approved description when a consistent short SEO description is needed:

> AI platform for Banking Regulation, AML/CFT, Financial Crime, Basel III/IV, IFRS 9, Risk Management, Internal Audit, Compliance, and AI Governance.

## Ongoing management workflow

1. Add each new public article to `seo-config.json` with a unique title, description and canonical URL.
2. Add its canonical URL to `sitemap.xml` only after the page is live and internally linked.
3. Add one descriptive, search-friendly title and one clear summary before publishing; do not keyword-stuff.
4. Keep claims evidence-aware and consistent with the site's governance-first positioning.
5. Review Search Console coverage, sitemap status, Core Web Vitals, title/description duplication and broken canonical URLs after deployment.
6. Re-submit the sitemap after a material content release.

## Deployment note

This update is for the repository-root website package only. Preserve the existing `/tradeguard/` application and its deployment settings. If TradeGuard receives separate SEO metadata, add its verified canonical routes to the sitemap only after checking the current source and public URLs. The live calculator in this package is a transparent scenario tool; it does not claim to be an official government pay-fixation portal.
