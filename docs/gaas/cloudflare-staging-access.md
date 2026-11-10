# GaaS staging deployment access

This repository uses a GitHub Actions deployment bridge for the existing Cloudflare Worker `gaas-research-api-staging`. Do not paste Cloudflare tokens, account IDs, OpenAI keys or Turnstile secrets into chat, commits, issues or pull requests.

## One-time Cloudflare access setup

Create a dedicated **Account API Token** for this deployment workflow. The correct Cloudflare dashboard location is **Manage Account → Account API Tokens** (not My Profile → API Tokens).

1. Select **Create Token**, then **Start from scratch**.
2. Name it `gaas-research-api-staging`.
3. Add one permission policy for the **Workers** product.
4. Set the resource scope to **Specified Workers** / **Individual Workers**.
5. Select only the existing Worker `gaas-research-api-staging`.
6. Assign the **Editor** role for that Worker.
7. Do not add any other policy. In particular, do not add DNS, Workers Routes, KV, R2, billing, Account Settings, User Details, Memberships, API Tokens, or account-wide Administrator permissions.
8. Set a short, operationally appropriate expiry (90 days is suitable for initial staging setup) and restrict client IPs only if the GitHub-hosted runner IP range can be maintained safely; do not guess an IP allowlist.
9. Review the summary before creating the token. Copy the token directly into the GitHub Environment secret described below. Never paste it into ChatGPT, a repository file, a commit, an issue, or a screenshot.

**Important:** Do not use the legacy **Edit Cloudflare Workers** token template shown under My Profile. That template can include broad account-level permissions and zone-level Workers Routes Write. The GaaS staging deployment uses the existing `workers.dev` hostname and does not change routes or custom domains, so those additional permissions are unnecessary. If a token was created with broader permissions, revoke it and create the narrowly scoped Account API Token above.

Cloudflare documents individual-Worker roles and scopes here:
- https://developers.cloudflare.com/workers/authorization/workers/
- https://developers.cloudflare.com/changelog/post/2026-09-15-granular-worker-permissions/

The **Editor** role scoped to this one existing Worker permits reading, updating and deploying that Worker, but not deleting it or accessing other Workers. Do not grant product-wide or account-wide access.

## One-time GitHub configuration

In the repository, open **Settings → Environments → New environment** and create `gaas-staging`.

Add these two environment values:

1. **Secret** `CF_API_TOKEN`: the dedicated, single-Worker Account API Token.
2. **Variable** `CF_ACCOUNT_ID`: the Cloudflare Account ID that contains the Worker. This is an identifier, not a secret; obtain it from the Cloudflare account overview or account URL.

Do not add `OPENAI_API_KEY` or `TURNSTILE_SECRET_KEY` to GitHub for this deployment workflow. They must remain encrypted Cloudflare Worker secrets. Do not reveal or rotate them as part of routine deployment.

The staging Worker must already have the encrypted secrets `OPENAI_API_KEY` and `TURNSTILE_SECRET_KEY` configured in Cloudflare. If they are absent, configure them through the Cloudflare Worker secret interface; never put their values in GitHub Pages, source control, plain-text Worker variables, screenshots or chat.

## What the workflow does

On changes to `gaas/worker/**` merged into `main`, or when manually dispatched:

1. Installs the Worker test dependencies.
2. Audits Worker test dependencies.
3. Runs the Worker regression suite.
4. Deploys only `wrangler.staging.toml` to the existing staging Worker.
5. Calls the public `/health` endpoint and validates the expected Phase 1 JSON response.

The workflow does **not** call the OpenAI Responses API, purchase credits, change billing, deploy the production Worker, change routes/custom domains, alter GaaS pricing, or enable checkout.

A passing health check proves only that the Worker responds. It does not prove that OpenAI research requests succeed. Live research acceptance remains a separately controlled test requiring explicit approval of paid API usage.

## Current release gate

The GitHub Actions staging deployment is blocked until both `CF_API_TOKEN` and `CF_ACCOUNT_ID` are populated in the `gaas-staging` GitHub Environment. The CI workflow checks for these values and stops before deployment if either is missing. Do not bypass this check or place credentials in source code.

After the environment is configured, rerun the staging deployment workflow and verify:
- Worker deployment completes against `gaas-research-api-staging`.
- `GET /health` returns HTTP 200 with the expected JSON.
- Cloudflare Deployments shows the active version.
- Worker observability records the health request.

Do not call `POST /api/research` until paid API usage is separately authorised. Browser/mobile UAT, WAF/rate-limit configuration, privacy/logging review and independent security review remain separate acceptance gates.

## Revocation

After the work is complete, revoke the dedicated API token in Cloudflare and remove the GitHub environment secret if ongoing automated staging deployment is no longer required.
