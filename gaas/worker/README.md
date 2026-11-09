# GaaS Phase 1 — Live Regulatory Research API

**Status:** Staging MVP implemented; final release acceptance remains pending. The public health endpoint and browser Turnstile challenge have previously been observed working. Live research completion is not verified; the provider has previously returned a quota/capacity error. This service is not production-approved.

## Implemented

- Cloudflare Worker endpoint: `POST /api/research`
- OpenAI Responses API integration using hosted `web_search`
- Required web search tool selection for each research request
- Citation extraction from Responses API URL annotations
- Exact-origin CORS allowlist, request-size limits and input validation
- Cloudflare Turnstile server-side verification
- Safe provider-error classification for credit exhaustion, spend/usage limits, temporary rate limits, authentication, permissions, model availability and overload
- Sanitised diagnostic codes and provider request IDs; raw provider messages, prompts and secrets are not returned or logged
- No automatic retry or credit purchase on quota/billing errors
- Public `GET /health` endpoint
- GaaS page staging panel with explicit user action, Turnstile challenge, status display and source-link rendering

The Worker does not store customer research requests or documents. The first phase uses public-web research only. Document upload, user authentication, tenant isolation, report history and billing are out of scope until their respective phases.

## Safety and cost controls

- Do not make a live `POST /api/research` request unless paid OpenAI API usage is separately authorised.
- A health check, local unit test, static test or staging deployment does not invoke the OpenAI Responses API.
- No automatic retries, credit purchases or billing changes are permitted.
- Never put OpenAI or Turnstile secret keys in GitHub Pages files, browser JavaScript, commits, issue comments or chat messages.
- Do not submit customer PII, account details, transaction records, SAR/STR information or confidential institutional material.

## Cloudflare staging configuration

The staging service is named `gaas-research-api-staging`. Use only the dedicated staging config:

```bash
cd gaas/worker
npx wrangler@latest deploy --config wrangler.staging.toml
```

Authenticate Wrangler to the intended Cloudflare account and confirm the target Worker name before deployment. The staging config keeps secrets in encrypted Cloudflare Worker secret storage. Do not paste secret values into commands, repository files or chat.

After deployment, verify:
1. Cloudflare Deployments shows an active version for `gaas-research-api-staging`.
2. `GET /health` returns HTTP 200 and the expected Phase 1 JSON.
3. Observability records the health request under the active version ID.
4. Do not call `POST /api/research` unless paid API usage has been separately authorised.

This staging deployment does not deploy the production Worker and does not itself invoke OpenAI.

## Local tests

Requires Node.js 20+.

```bash
cd gaas/worker
npm install
npm test
```

The automated suite covers health response, CORS preflight, origin rejection, unsupported paths/methods, oversized requests, unconfigured service behaviour, citation extraction and provider diagnostic classification. These tests do not make network requests to OpenAI.

## API contract

The request is JSON and must include a valid Turnstile token:

```json
{
  "plan": "Free Explorer",
  "jurisdiction": "Bangladesh",
  "topic": "AML/CFT",
  "question": "Find current official AML/CFT requirements relevant to licensed financial institutions.",
  "authority": "Bangladesh Bank / BFIU",
  "businessArea": "Commercial banking",
  "process": "Customer onboarding and periodic KYC review",
  "language": "English",
  "turnstileToken": "<fresh Turnstile response token>"
}
```

Successful response includes `status: research_complete_pending_human_review`, `researchDate`, `report`, `citations[]` and a human-review disclaimer.

The endpoint currently recognises the six existing plan names but does not enforce plan entitlements. Paid plans must not be activated until authenticated server-side subscription and entitlement controls are implemented and tested.

## Phase 1 acceptance gates

| Gate | Evidence required | Current disposition |
|---|---|---|
| Backend implementation | Source review and unit tests | Implemented; CI result required on this branch |
| Staging configuration | Dedicated staging Wrangler config | Implemented |
| Staging health | HTTP 200 plus Cloudflare active-version evidence | Previously observed; recheck after latest deployment |
| Frontend integration | GaaS page panel, Turnstile and response rendering | Implemented in source; browser UAT evidence still required |
| Live API smoke test | Valid source-led research response and citations | Not run; requires separate explicit paid-usage authorisation |
| Browser/mobile UAT | Desktop and mobile challenge, request state, error state and citation links | Pending |
| Security acceptance | WAF rate limiting, secret review, privacy/logging review and independent security review | Pending |

A successful health check is not evidence that live research works. A successful unit-test run is not evidence of browser UAT or production security acceptance.

## Phase 2 entry criteria

Begin Phase 2 development in a separate branch while preserving the Phase 1 release gates. Phase 2 must initially remain a non-production, human-reviewed workflow and must not depend on paid API calls unless separately authorised.

Proposed Phase 2 deliverable: a Regulatory Change Impact Pack workflow with:
- original source register and source-status fields;
- clause-wise requirement register;
- applicability assessment by entity, jurisdiction, product and process;
- requirement-to-control and evidence mapping;
- evidence request list and audit test programme;
- risk-rated gap and remediation register;
- reviewer decisions, version history and management summary.

Every item must distinguish verified source facts, analyst assessment, assumptions and unverified matters. No legal status, obligation, institution applicability or control effectiveness may be fabricated.
