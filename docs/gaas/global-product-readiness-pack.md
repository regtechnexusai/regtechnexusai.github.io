# RegTech Nexus AI — Global GaaS Product Readiness Pack

**Status:** Product-preview specification  
**Commercial model:** Global Agentic-as-a-Service (GaaS) + subscription software  
**Product family:** AlfiQ  
**Primary entry product:** Regulatory Intelligence & Change Impact  
**Billing state:** Dummy mode only; no provider accounts or live payment integration  
**Publication state:** Review branch; not yet published

## 1. Product purpose

RegTech Nexus AI GaaS is a proposed global service and software offering for compliance professionals, internal auditors, risk teams, independent consultants, fintechs and financial institutions.

The product is intended to help users organise public regulatory publications, structure potential regulatory changes, map candidate impacts to business processes and controls, and route assessments through accountable human review.

The product is decision-support. It does not provide legal advice, regulatory approval, a guarantee of regulatory completeness, an audit opinion or an automatic compliance determination.

## 2. Commercial positioning

**Positioning:** Regulatory intelligence that moves from change to accountable action.

**Brand architecture:**
- RegTech Nexus AI: global customer-facing brand and commercial platform.
- GaaS: Agentic-as-a-Service operating and distribution model.
- AlfiQ: specialist AI-agent product family and workflow engine.
- Circular Intelligence: initial commercial entry product.

## 3. Initial customer segments

1. Independent regulatory and compliance consultants.
2. Internal audit professionals and audit teams.
3. Compliance, AML/CFT and risk professionals.
4. Smaller fintechs and specialist advisory firms.
5. Banks and larger financial institutions after security and procurement readiness.

Initial go-to-market should prioritise individual professionals and consultants. Enterprise capability must not be implied by a public product preview.

## 4. Approved USD pricing baseline

| Plan | Display price | Intended customer |
|---|---:|---|
| Free Explorer | $0 | Product discovery |
| Professional | $12/month | Individual professionals |
| Professional Plus | $49/month | Consultants and auditors |
| Small Business | $99/month | Small fintechs and advisory firms |
| Business Plus | $299/month | Growing financial-services businesses |
| Enterprise | Custom | Banks and larger institutions |

The public preview shows these proposed prices. It does not create subscriptions or collect payments. Exact usage allowances, entitlements, tax presentation, refund rules and service limits must be finalised before live billing.

## 5. Product scope and release sequence

### Initial release candidate — Circular Intelligence
- Approved source register and source metadata.
- Manual or controlled ingestion of public regulatory publications.
- Document-type classification: law, regulation, rule, notice, circular, guidance, consultation, report, enforcement action and other.
- Source identity, issuer, publication date, effective date, version and jurisdiction fields.
- Candidate change summary with links to original source.
- Human verification and approval state.
- Correction, supersession and withdrawal handling.
- Exportable review record.

### Subsequent AlfiQ workflow
- Analyst-created control inventory.
- Candidate mappings between regulatory change records and controls.
- Transparent analyst-entered impact factors and rationale.
- Independent maker-checker review.
- Remediation owners, due dates, controlled status transitions and completion evidence.
- Tenant-scoped access and audit events.

### Later roadmap
- Jurisdiction-specific source packs.
- Policy and control gap workflows.
- Audit intelligence and control testing support.
- AML/CFT and financial-crime research workflows.
- AI governance and risk workflows.
- Enterprise integrations and contracted service levels.

## 6. Current AlfiQ implementation boundary

The separate private AlfiQ SaaS repository describes Phase 4 impact analysis/control mapping and Phase 5 human review/remediation as development implementation. The Phase 5.1 security-hardening PR was merged, but the repository README still states that the product is not production-ready.

The current AlfiQ documentation identifies these boundaries:
- Phase 3 source authenticity, binding status, chronology, effective date and applicability require human verification.
- Phase 4 mappings and impact scores are analyst-entered and remain unreviewed until human validation.
- Phase 5 maker-checker decisions and remediation actions require tenant membership, role checks and RLS.
- Production identity integration is not implemented.
- The Phase 5 frontend dashboard is not included.
- No paid API, external AI provider, crawler or production customer data is enabled in the documented development scope.

The public GaaS page therefore describes a product preview and planned capabilities. It must not be presented as a live production application.

## 7. Global regulatory coverage model

Use one common product engine with jurisdiction-specific source packs. Do not hardcode one jurisdiction's regulatory taxonomy into the core product.

Minimum metadata:
- Jurisdiction and sub-jurisdiction.
- Issuing authority and official source URL.
- Instrument identifier and title.
- Instrument type and legal/status classification.
- Publication, effective, expiry and supersession dates where applicable.
- Version and amendment relationship.
- Regulated entity type and applicability notes.
- Topic, business function and control domain.
- Source verification status and reviewer identity.
- Ingestion timestamp, content hash and correction history.

A document's publication by an authority does not by itself establish that it is binding, current, applicable to every institution or effective immediately. Consultations, discussion papers, final rules, guidance and enforcement actions must remain distinguishable.

## 8. Operating controls

### Source controls
- Use official regulator/standard-setter sources as primary evidence.
- Preserve original source references and retrieval metadata.
- Record source verification separately from content extraction.
- Detect duplicate, amended, superseded and withdrawn instruments.
- Do not silently overwrite prior versions.
- Require human approval before a regulatory item is marked verified or distributed as a conclusion.

### AI controls
- Treat model outputs as candidate extraction and analysis.
- Require evidence references for material claims.
- Flag missing, ambiguous and conflicting information.
- Do not allow a model to create legal applicability or compliance conclusions without accountable review.
- Maintain model/version and prompt/workflow change records when AI is later enabled.

### Data controls
- Initial public demo uses synthetic content only.
- No customer PII, account data, transactions, SAR/STRs or confidential institutional documents in public demo.
- Do not send user-submitted text to a model until privacy, security, contractual and retention controls are implemented.
- Production requires server-side tenant isolation, authentication, authorisation, encryption, audit logging, backup and incident-response arrangements.

### Human governance
- Separate preparer and reviewer for consequential assessments.
- Record reviewer identity, decision, rationale and timestamp.
- Remediation closure requires completion evidence.
- A human approval records internal review only; it does not certify legal compliance or supervisory acceptance.

## 9. Public preview acceptance criteria

- Responsive page at /gaas/ using existing RegTech Nexus AI branding.
- Six USD price points match the approved pricing baseline.
- Product status clearly says preview / in development where applicable.
- Local demo uses a fictional instrument and fixed pre-authored output.
- Demo makes no network request and collects no user data.
- Plan buttons run in dummy mode and never collect card or bank details.
- Paddle and Payoneer are described as planned/not connected.
- No credentials, tokens, provider price IDs or real account identifiers in the repository.
- Privacy and data-protection warnings are visible.
- Legal and regulatory limitations are clear.
- Keyboard navigation and mobile layout are tested.
- Public home navigation is not changed until the product preview is approved.

## 10. Production release gates

Do not activate live billing or customer onboarding until all applicable gates pass:

1. Business and payment-provider onboarding approved.
2. Bank settlement and foreign-exchange treatment confirmed.
3. Production identity and tenant isolation tested.
4. Data-processing, privacy, retention and deletion controls reviewed.
5. Source ingestion and verification workflow tested.
6. Model output accuracy and adversarial testing completed for each enabled AI workflow.
7. Maker-checker and remediation workflow integrated into the user interface.
8. Audit and evidence export tested.
9. Security review and vulnerability remediation completed.
10. Billing webhooks, idempotency, refunds, cancellations and entitlement lifecycle tested.
11. Terms, privacy, refund policy and service descriptions reviewed by qualified advisers.
12. Operational support, incident response and service availability arrangements defined.

## 11. Initial 90-day execution measures

- 20–30 qualified professional/consultant prospects identified.
- 10–15 discovery conversations.
- 5 guided product demonstrations.
- 3 scoped pilot proposals.
- 2–3 paid pilot engagements targeted.
- Source accuracy, review time and direct cost measured for each pilot.
- No public claim of production AI or global regulatory coverage before evidence exists.

These are management targets, not forecasts.

## 12. Publication statement

The current /gaas/ page is a public-facing product preview. It may be published as a transparent product-development and early-access page after review of the page, demo, legal notices, accessibility and links. It must not be described as a live SaaS subscription service until the production release gates are satisfied.
