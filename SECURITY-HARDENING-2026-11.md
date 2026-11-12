# Security hardening — November 2026

## Scope and status

This change set hardens the static homepage CSP and removes a misleading CSP directive from the GaaS HTML. It does not claim that the live site or its infrastructure has passed a penetration test.

Hosting note: the repository deploys through GitHub Pages. GitHub Pages does not apply Cloudflare Pages `_headers` files. HTTP response headers therefore require configuration at the active Cloudflare proxy/edge layer (or a hosting platform that supports response-header configuration). Do not add a root `_headers` file and assume it is active.

## Implemented in this branch

1. The homepage CSP is now declared before analytics scripts, so it governs those scripts.
2. The existing inline Google Analytics bootstrap is explicitly authorised by a SHA-256 CSP hash.
3. `style-src 'unsafe-inline'` is retained for compatibility with the existing inline critical CSS and style attributes. This is a deliberate compatibility compromise, not the final strict-CSP target.
4. The GaaS page no longer declares `frame-ancestors` in a meta CSP. Browsers do not enforce that directive from a meta element; the HTML no longer implies that it does.

## Required Cloudflare edge response-header configuration

Confirm that `regtechnexusai.com` is proxied through the intended Cloudflare zone and apply response-header modification rules at the edge. Do not assume these controls are active until the deployed response is inspected.

Recommended baseline headers:

- `Strict-Transport-Security: max-age=31536000` (only after confirming HTTPS is available on every relevant hostname; do not add `includeSubDomains` until the complete subdomain inventory is verified).
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-Frame-Options: DENY` (confirm no legitimate framing use cases first).
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` (adjust if any page legitimately needs these capabilities).
- For the GaaS path specifically, add a separate CSP response header: `Content-Security-Policy: frame-ancestors 'none'`. A separate CSP policy is combined with the page's existing meta policy by browsers. Verify the effective headers on `/gaas/` and nested GaaS routes.

Avoid blindly applying a second full-site CSP: multiple CSP policies are enforced cumulatively and may break existing calculators, analytics, translation widgets or third-party integrations. Roll out any broader CSP as report-only first, inventory violations, then enforce with page-specific policies.

## Remaining security work — not completed by this PR

- Pin GitHub Actions to reviewed full commit SHAs; confirm each SHA against the official action repository and update dependabot/renovate policy.
- Pin external TradeGuard and PayScale source checkouts to approved commit SHAs rather than mutable `main` branches.
- Add and commit a reproducible dependency lockfile for `gaas/worker`; only then replace `npm install` with `npm ci`.
- Verify GitHub branch protection/rulesets, required status checks, secret scanning and push protection in repository settings.
- Verify Cloudflare WAF, bot controls, DNS proxy status, TLS mode, Worker secrets, Access policies, D1 permissions, Queue bindings and rate-limit configuration in the Cloudflare account.
- Perform authorised, non-destructive external checks of TLS, HTTP headers, exposed endpoints and subdomains.
- Conduct authenticated tenant-isolation and authorisation tests in a dedicated test environment; do not probe real customer data.
- Run dependency and secret-history scans. Rotate any credential if exposure is confirmed; do not put credentials in issues or reports.

## Safe verification after deployment

Inspect response headers for the homepage and GaaS page:

```sh
curl -sSI https://regtechnexusai.com/
curl -sSI https://regtechnexusai.com/gaas/
```

Confirm that the homepage CSP is present and analytics still works. Confirm that the GaaS response includes the edge-provided `frame-ancestors 'none'` policy and the baseline headers. Test core navigation, calculators, TradeGuard, ICMS, Student Hub and GaaS Turnstile/research flows after deployment.

## Release gate

Do not merge until the branch's automated checks pass and the CSP compatibility check is complete. Do not describe the platform as penetration-tested or fully secure until the outstanding infrastructure and application tests have been completed and independently reviewed.
