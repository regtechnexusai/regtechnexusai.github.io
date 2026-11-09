# GaaS Phase 1 — Live Regulatory Research API

**Status:** Staging MVP. Worker health and the browser Turnstile challenge have been observed working; live OpenAI research remains unverified and currently returns a provider-capacity/quota error. Not production-approved.

## What this adds

- Cloudflare Worker endpoint: `POST /api/research`
- OpenAI Responses API integration using hosted `web_search`
- Required web search tool selection for each research request
- Citation extraction from Responses API URL annotations
- CORS origin allowlist, request-size limits and input validation
- Cloudflare Turnstile server-side verification
- Safe provider-error classification (credit exhaustion, spend/usage limits, temporary rate limits, authentication, permissions, model availability and overload)
- Sanitised diagnostic codes and provider request IDs; raw provider messages, prompts and secrets are not returned or logged
- No automatic retry or credit purchase on quota/billing errors
- Health endpoint: `GET /health`

The worker does not store customer research requests or documents. The first phase uses public-web research only. Document upload, user authentication, tenant isolation, report history and billing are out of scope until their respective phases.

## Required Cloudflare setup

1. Create a Cloudflare Worker named `gaas-research-api`.
2. Create a Turnstile widget for the exact GaaS production/staging hostname(s). Configure its action as `gaas_research`.
3. Set Worker secrets:
   - `OPENAI_API_KEY` — a dedicated OpenAI project service-account key.
   - `TURNSTILE_SECRET_KEY` — the Turnstile secret.
4. Set the non-secret Worker variables in `wrangler.toml`:
   - `ALLOWED_ORIGIN` — exact comma-separated frontend origins.
   - `OPENAI_MODEL` — a model enabled for the OpenAI project.
5. Configure Cloudflare WAF rate limiting for `/api/research` (initial staging suggestion: no more than 5 requests per IP per 15 minutes, with a separate daily ceiling). Tune after observing legitimate usage.
6. Deploy the Worker to a staging hostname first. The current GaaS staging panel is integrated, but keep it labelled staging until live API and browser acceptance tests pass.

Never put OpenAI or Turnstile secret keys in GitHub Pages files, browser JavaScript, commits, issue comments or chat messages.

## Local tests

Requires Node.js 20+.

```bash
cd gaas/worker
npm install
npm test
```

## Deploy

Install Wrangler and authenticate to the intended Cloudflare account. From this directory:

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler deploy
```

Do not commit a populated `.dev.vars` file. Use local secret injection for development.

## API contract

The request is JSON and must include a valid Turnstile token:

```json
{
  "plan": "Free Explorer",
  "jurisdiction": "Bangladesh",
  "topic": "AML/CFT",
  "question": "Find current official AML/CFT requirements relevant to licensed financial institutions. Include official circulars and authority publication pages, including sources not in a curated source list.",
  "authority": "Bangladesh Bank / BFIU",
  "businessArea": "Commercial banking",
  "process": "Customer onboarding and periodic KYC review",
  "language": "English",
  "turnstileToken": "<fresh Turnstile response token>"
}
```

Successful response includes:
- `status: research_complete_pending_human_review`
- `researchDate`
- `report`
- `citations[]` containing source title and URL
- human-review disclaimer

The endpoint currently allows the six existing plan names but does not yet enforce plan entitlements. That must be implemented with authenticated server-side subscription data before paid plans are activated.

## Release gates still outstanding

- Frontend integration and visible Turnstile challenge.
- Cloudflare Worker staging deployment and secrets.
- Real API smoke test against Bangladesh AML/CFT research.
- Confirm citations render as prominent clickable links in GaaS.
- Add rate-limit and spend-limit monitoring.
- Add integration tests for Turnstile rejection, invalid payloads, provider errors, citation extraction and request timeouts.
- Independent security review before production.


## Deploy the staging Worker safely

**Important:** the default `wrangler.toml` names `gaas-research-api`; do not use that config to deploy the staging service. The staging service is `gaas-research-api-staging`.

Use the dedicated staging config only:

```bash
cd gaas/worker
npx wrangler@latest deploy --config wrangler.staging.toml
```

The staging config targets only `gaas-research-api-staging` and keeps the existing encrypted Worker secrets out of source control. Authenticate Wrangler to the same Cloudflare account and confirm the target Worker name before approving deployment. Do not paste API keys or Turnstile secrets into the command, repository, or chat.

After deployment, verify:
1. Cloudflare Deployments shows a new active version for `gaas-research-api-staging`.
2. `GET /health` returns HTTP 200 and the expected Phase 1 JSON.
3. Observability records the health request under the new version ID.
4. Do not call `POST /api/research` unless paid OpenAI usage has been separately authorised.

This procedure does not deploy `gaas-research-api` and does not trigger OpenAI API usage by itself.
