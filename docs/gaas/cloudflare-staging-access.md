# GaaS staging deployment access

This repository uses a GitHub Actions deployment bridge for the existing Cloudflare Worker `gaas-research-api-staging`. Do not paste Cloudflare tokens, account IDs, OpenAI keys or Turnstile secrets into chat, commits, issues or pull requests.

## One-time Cloudflare access setup

Create a dedicated Cloudflare API token for this deployment workflow. Use the narrowest available scope:

- Resource: the existing Worker `gaas-research-api-staging` only.
- Workers role: **Editor** for that Worker. This permits reading, updating and deploying the existing Worker and inspecting its observability data; it does not grant permission to delete the Worker.
- Do not grant account-wide Administrator, DNS, billing, zone-edit, or unrelated product permissions.
- The workflow deploys the existing `workers.dev` Worker and does not change routes or custom domains.

Cloudflare documents the Worker-scoped roles and Wrangler permissions here:
https://developers.cloudflare.com/workers/authorization/workers/

If Cloudflare does not offer a Worker-specific scope in the token creation screen, stop and do not substitute an account-wide administrator token. Use a Cloudflare member role scoped to this Worker or ask the account administrator to create the least-privilege token.

## One-time GitHub configuration

In the repository, open **Settings → Environments → New environment** and create `gaas-staging`.

Add the following environment values:

1. **Secret** `CF_API_TOKEN`: the dedicated, Worker-scoped Cloudflare API token.
2. **Variable** `CF_ACCOUNT_ID`: the Cloudflare Account ID containing the Worker.

Do not add `OPENAI_API_KEY` or `TURNSTILE_SECRET_KEY` to GitHub for this workflow. They must remain encrypted Cloudflare Worker secrets. Do not reveal or rotate them as part of routine deployment.

## What the workflow does

On changes to `gaas/worker/**` merged into `main`, or when manually dispatched:

1. Installs the Worker test dependencies.
2. Runs the local Vitest regression suite.
3. Deploys only `wrangler.staging.toml` to the existing staging Worker.
4. Calls the public `/health` endpoint and validates the JSON response.

The workflow does **not** call the OpenAI Responses API, purchase credits, change billing, deploy the production Worker, alter the GaaS pricing page, or enable checkout.

A passing health check proves only that the Worker responds. It does not prove that OpenAI research requests succeed. Live research acceptance remains a separately controlled test requiring explicit approval of paid API usage.

## Revocation

After the work is complete, revoke the dedicated API token in Cloudflare and remove the GitHub environment secret if ongoing automated staging deployment is no longer required.
