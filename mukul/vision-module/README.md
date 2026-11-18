# MUKUL Vision module — portable deployment contract

## Current status

The Gemini Vision integration is intentionally **locked and inactive** on the current MUKUL website. The configuration template at `config.example.json` contains no credentials. The browser must not accept, store, transmit, or expose a provider API key. The existing local photo preview, ONNX experiment, crop-assistance workflow, and farmer guidance are separate and remain available.

This directory preserves the integration contract so it can be deployed later on a different, explicitly approved website or domain. It is not a working API proxy and does not activate the feature.

## Future activation gates

Do not enable the UI until all gates below are completed and reviewed:

1. **Domain approval:** record the exact HTTPS production origin(s) in a server-side allowlist. Update the privacy notice and user-facing disclosure for that deployment.
2. **Server-side proxy:** route browser requests to a controlled backend (for example, a Cloudflare Worker). The backend calls the provider; the browser never calls Gemini directly.
3. **Secret management:** store the provider credential as a platform secret (for Cloudflare Workers, for example, `wrangler secret put GEMINI_API_KEY`). Never commit it, put it in static JSON/HTML/JavaScript, expose it in source maps, localStorage, sessionStorage, URLs, logs, or client-visible responses.
4. **Abuse controls:** verify Turnstile server-side; enforce strict request and image size/MIME limits, rate limits, timeouts, concurrency limits, and provider spend/usage alerts.
5. **Origin and request validation:** validate the expected Origin server-side and use an explicit CORS allowlist. CORS alone is not authentication; require abuse controls and server-side validation.
6. **Privacy and retention:** document what image/prompt data is sent, provider and processing locations, retention/deletion terms, logging, cross-border processing, and the user's explicit consent. Avoid retaining raw images unless a separately approved purpose requires it.
7. **Safe operations:** return sanitised errors; never log credentials or image contents; monitor usage and failures; provide a kill switch and tested rollback.
8. **Validation:** run security review, privacy review, mobile/desktop functional tests, negative tests (unauthorised origin, missing/invalid challenge, oversized file, invalid MIME, rate-limit breach), and a live smoke test before activation.

## Non-secret configuration

See `config.example.json`. Keep `enabled: false` until the gates are signed off. Set the future endpoint and authorised origins only in the deployment environment/configuration appropriate to the approved domain. Do not place credentials in this file.

## Portability

For a future domain:
- deploy a separate backend endpoint for that domain;
- add only the exact approved HTTPS origin to the backend allowlist;
- configure the provider secret in that backend's secret manager;
- configure Turnstile for the new hostname and verify tokens server-side;
- update privacy disclosures and consent language;
- complete the activation gates above.

Do not copy a production secret from one domain to another. Provision a new secret and rotate/revoke credentials as appropriate.

## Scope protection

This module must remain isolated from MUKUL's farmer guidance, local media preview, ONNX model path, and other crop-assistance features. Do not change crop guidance, model algorithms, calculators, TradeGuard, or site architecture as part of future Vision integration work. The classifier and any future Vision output are research aids only—not disease diagnosis or treatment, pesticide, or fertiliser recommendations.
