# Phase B isolated Cloudflare D1 runtime test Worker

## Safety model

This test Worker is separate from `gaas-research-api` and does not alter the existing synchronous `POST /api/research` route. It has no AI provider integration, Turnstile integration, production route, Queue binding or scheduled trigger.

The Worker refuses to run unless all of the following are true:

- `PHASEB_RUNTIME_TEST_ENABLED=true`.
- A one-time `PHASEB_RUNTIME_TEST_TOKEN` secret of at least 32 characters is configured and supplied in the request header.
- `ASSURANCE_DB` is bound.
- Both `assurance_jobs` and `assurance_job_events` are empty before the test begins.

The test uses synthetic tenant IDs and generic public test prompts. It cleans up test jobs in a `finally` block. Do not use real customer, account, SAR/STR, transaction or confidential banking data.

## Configure locally

1. Copy `wrangler.phaseb-test.toml.example` to `wrangler.phaseb-test.toml`.
2. Replace the placeholder database ID with the complete ID of the database named `gaas-phaseb-disposable-20261111`. Confirm the full name and ID in the Cloudflare D1 database list before proceeding.
3. Confirm that this database is not `gaas-assurance-staging` and not used by any live Worker.
4. Do not commit the local config containing the real database ID.
5. Set a random one-time token using a password manager. Never paste the token into GitHub, chat, screenshots or source files.

## Deploy only the isolated Worker

From `gaas/worker`:

```bash
cp wrangler.phaseb-test.toml.example wrangler.phaseb-test.toml
# Edit the local file and replace the database ID placeholder.
npx wrangler deploy --config wrangler.phaseb-test.toml
npx wrangler secret put PHASEB_RUNTIME_TEST_TOKEN --config wrangler.phaseb-test.toml
```

The config deliberately starts with `PHASEB_RUNTIME_TEST_ENABLED = "false"`. Deploying it does not make the test endpoint usable. Before enabling it, verify the Worker name, D1 binding name and complete D1 database ID in Cloudflare.

After confirming the isolated Worker and binding, set the variable to true in the isolated config and deploy that Worker only. Do not change the main `wrangler.toml`, staging Worker bindings or production routes.

## Run acceptance

Send one POST request to the isolated Worker URL:

```bash
curl -X POST "https://gaas-phaseb-runtime-test.<your-workers-subdomain>.workers.dev/__phaseb/run" \
  -H "x-phaseb-test-token: <one-time-token>" \
  -H "content-type: application/json" \
  --data '{}'
```

Do not share the token. Capture only the sanitized JSON response and the Worker name. The handler checks schema, empty-database precondition, tenant separation, idempotency, stale-version rejection, concurrent idempotency, batch rollback, foreign-key enforcement and expiry/cascade cleanup. Runtime create-event trigger injection (D1-06) remains deferred; the SQLite integration suite covers it. Queue/DLQ acceptance is a separate gate and is not performed by this Worker.

## After the test

1. Disable the endpoint by setting `PHASEB_RUNTIME_TEST_ENABLED = "false"` and redeploy the isolated Worker.
2. Delete the one-time test secret or delete the isolated Worker.
3. Verify both test tables contain zero rows.
4. Keep the disposable D1 until the acceptance evidence is reviewed; then delete it only after explicit owner confirmation.
5. Do not merge PR #275 or deploy the production Worker solely because this test passes.
