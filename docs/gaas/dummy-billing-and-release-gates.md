# GaaS Dummy Billing Configuration and Release Gates

**Current state:** DEMO / DUMMY ONLY  
**Primary provider planned:** Paddle  
**Secondary institutional collection channel planned:** Payoneer  
**Live accounts:** Not created or connected  
**Live credentials:** None stored  
**Live checkout:** Disabled

## 1. Approved USD pricing

| Plan | Price | Billing cadence |
|---|---:|---|
| Free Explorer | $0 | No charge |
| Professional | $12 | Monthly |
| Professional Plus | $49 | Monthly |
| Small Business | $99 | Monthly |
| Business Plus | $299 | Monthly |
| Enterprise | Custom | Contract-specific |

These prices are the approved commercial planning baseline. Final taxes, payment fees, renewal terms, cancellation rules, refunds and local-currency availability must be displayed or agreed before a live transaction.

## 2. Dummy-mode behaviour

The public /gaas/ preview:
- Displays the proposed plan prices.
- Opens a local plan-preview dialog when a paid-plan button is selected.
- Does not load Paddle.js or Payoneer scripts.
- Does not call an external payment endpoint.
- Does not collect card, bank, billing-address or payment credentials.
- Does not create a customer, subscription, invoice or entitlement.
- Does not persist plan selection or personal information.
- Does not claim a payment has succeeded.

The front-end demo constant is billingMode = DEMO. This is a display/demo control, not a secure production billing feature flag. A production backend must enforce billing state server-side.

## 3. Provider separation

### Paddle — planned primary SaaS Merchant of Record
Intended use:
- Self-service recurring subscriptions.
- Checkout and subscription lifecycle.
- Eligible enterprise invoices / bank-transfer billing where supported.

Required before live:
- Supplier and domain approval.
- Payout route confirmation with provider and AD bank.
- Live product and price IDs.
- Server-side API credential storage.
- Webhook signature verification.
- Idempotent event processing.
- Subscription status and entitlement reconciliation.
- Refund, cancellation, dispute and failed-payment handling.

### Payoneer — planned institutional collection channel
Intended use:
- Direct institutional invoices for separately scoped services where permitted by the account and payment route.
- Potential eligible payout route only after provider and bank confirmation.

Not intended as:
- A subscription entitlement engine.
- A substitute for Paddle's recurring billing.
- A universal ACH/SEPA/SWIFT collection guarantee.

Required before live:
- Business profile and account approval.
- Permitted transaction types and payer eligibility confirmed.
- Receiving account details and fees confirmed.
- AD-bank treatment and repatriation process confirmed.
- Invoice, contract and settlement reconciliation process.

## 4. Secret and configuration policy

Never commit:
- Paddle API keys or client tokens.
- Paddle webhook secrets.
- Payoneer credentials or account tokens.
- Bank account details.
- Customer payment information.
- Live or sandbox credentials.

Production configuration must be held in the backend deployment's secret manager/environment configuration. Public GitHub Pages may contain only non-secret public identifiers if the provider's integration requires them and the live domain is approved.

Recommended server-side configuration names (unset until approved):
- BILLING_MODE
- PADDLE_ENVIRONMENT
- PADDLE_API_KEY
- PADDLE_WEBHOOK_SECRET
- PADDLE_CLIENT_TOKEN
- PADDLE_PRICE_ID_PROFESSIONAL
- PADDLE_PRICE_ID_PROFESSIONAL_PLUS
- PADDLE_PRICE_ID_SMALL_BUSINESS
- PADDLE_PRICE_ID_BUSINESS_PLUS

No values are to be committed in this repository. Do not create fake secrets that resemble valid credentials.

## 5. Subscription entitlement controls

- Browser redirects must never activate a subscription.
- Only verified server-side provider events may change entitlement state.
- Verify webhook signatures against the raw request body.
- Enforce event idempotency and replay protection.
- Store provider customer/subscription IDs securely.
- Reconcile local entitlement state with provider subscription state.
- Define grace period, failed payment, cancellation, refund, dispute and expiry rules.
- Keep enterprise contract entitlements separate from self-service subscriptions.
- Do not grant production access in demo mode.

## 6. Financial controls

- Reconcile provider gross sales, taxes, fees, refunds, chargebacks and net payouts.
- Maintain invoice and payout statements.
- Track currency conversion and bank charges.
- Distinguish MoR sales from direct institutional service invoices.
- Confirm tax and foreign-exchange treatment with qualified advisers and the authorised dealer bank.
- Measure actual AI/API and human-review cost per plan before finalising usage allowances.

## 7. Release gates

Live billing must remain disabled until:
1. Provider approves the business and website.
2. AD bank confirms the settlement route and documentation.
3. Backend secrets and webhook verification are configured.
4. Test transactions, renewals, cancellations and refunds pass in provider sandbox.
5. Subscription entitlements and revocation tests pass.
6. Privacy, terms, refund and cancellation policies are reviewed.
7. Security testing and operational monitoring are complete.
8. Product features and monthly usage limits match the checkout descriptions.
9. Customer support and incident-handling processes are ready.
10. Explicit release approval is recorded.

## 8. Current publication statement

The GaaS product preview can be published only as a transparent pre-launch / early-access preview. The pricing is indicative commercial presentation; no live purchase is possible. Do not state that Paddle or Payoneer accounts are connected, approved or operational.
