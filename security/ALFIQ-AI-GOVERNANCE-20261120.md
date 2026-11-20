# AlfiQ AI Governance Framework — Phase 2

**Version:** 0.1 (baseline framework)  
**Date:** 2026-11-20  
**Owner recommendation:** RegTech Nexus AI product owner, with designated security/privacy reviewer  
**Scope:** AlfiQ and GaaS AI-assisted research/preview capabilities only

## 1. Status boundary

Current public disclosures describe AlfiQ GaaS as a design-partner/public preview. The guided demo is simulated. The optional research preview is a staging mock workflow and does not perform live regulatory web searches or produce verified regulatory conclusions. This document is a governance baseline; it does not validate the deployed implementation, provider configuration, model behavior, or operational monitoring.

Capability labels must be used precisely:

- **Concept:** idea or design; no working capability implied.
- **Prototype:** limited implementation intended for exploration.
- **Experimental:** capability is being trialled; outputs are not dependable without review.
- **Tested:** defined test cases were executed and recorded for a specific version and environment.
- **Operational:** capability is deployed with owners, monitoring, incident handling, documented change control and acceptance evidence.

Do not describe AlfiQ as a production regulatory-monitoring engine, verified compliance engine, autonomous regulatory decision-maker, or certified AI system without evidence supporting that claim.

## 2. Intended use

Subject to actual capability verification, AlfiQ may support:

- Organizing regulatory and compliance research questions.
- Drafting summaries or structured analysis for professional review.
- Helping users identify questions, potential policy/control impacts, and follow-up research.
- Supporting human-led comparison of materials supplied or retrieved through an explicitly disclosed workflow.

Outputs are advisory work products and must be independently verified against authoritative sources, applicable law, institution-specific policies, and current facts.

## 3. Prohibited / unsupported use

AlfiQ must not be represented or used as:

- A substitute for a regulator, legal counsel, compliance officer, or accountable decision-maker.
- A guarantee of compliance, regulatory interpretation, or legal opinion.
- An autonomous SAR/STR filing, sanctions clearance, customer-risk decision, credit decision, transaction approval, or other high-impact institutional decision system.
- A verified continuous regulatory-monitoring service unless live source coverage, freshness, validation, monitoring and operational support have been demonstrated.
- A repository for confidential, personal, customer, transaction, employee, account, SAR/STR, credential, or restricted institutional data in the public preview/staging experience.

## 4. Data and provider dependencies

Before any capability is described as operational, maintain a versioned inventory recording:

| Item | Required record |
|---|---|
| Model/provider | Provider, model identifier/version, hosting mode and dependency owner |
| Retrieval/source dependencies | Source domains/types, coverage limitations, retrieval date, primary-source verification method |
| Input data | Fields collected, sensitive-data prohibition, validation and minimization |
| Output | Output type, user-facing limitations, confidence/uncertainty treatment, source links if applicable |
| Processing | Data path, service boundary, provider recipients, region, retention, logs, deletion |
| Security | Authentication/authorization, rate limits, abuse controls, secrets location, monitoring |
| Release | Version, change summary, test evidence, approval, rollback method |

For any provider or processing fact that is not verified, mark it **NOT EVIDENCED** rather than infer it.

## 5. Human oversight and output verification

- A user must review AI-generated content before relying on it.
- Regulatory assertions must be checked against primary sources (official regulator, gazette, statute, supervisory authority, or recognized standard setter).
- The reviewer should record material corrections, source conflicts, stale information, uncertainty, and decisions made using the output.
- AI output must not be automatically treated as a control pass, compliance finding, or regulatory obligation.
- The user must be able to reject, amend, or independently reperform the analysis.

## 6. Validation and testing

For each AI release or material change, define tests covering, as applicable:

- Correctness and factuality against a reference set.
- Source fidelity and citation accuracy.
- Jurisdiction and date handling.
- Hallucination, unsupported assertion, and uncertainty behaviour.
- Prompt-injection and instruction/data separation.
- Sensitive-input handling and data leakage.
- Bias/fairness where relevant to the intended use.
- Availability, abuse/rate limits, failure handling and fallback.
- Regression testing against previously accepted cases.

Test results must identify version, date, environment, tester, sample selection, expected/actual result, pass/fail criteria, limitations and approval. This framework does not assert that such tests have been performed.

## 7. Risk ownership and escalation

Recommended accountability:

- **Product owner:** intended use, release approval, user-facing claims, capability status.
- **Security owner:** threat assessment, access, secrets, vulnerability handling, incident response.
- **Privacy owner:** data minimization, lawful basis/consent where applicable, disclosures, retention, provider due diligence.
- **AI reviewer:** validation set, source quality, output review, known limitations, change evaluation.
- **User/institution:** independent verification and final decisions.

Escalate immediately for suspected data exposure, credential leakage, prompt injection affecting system behavior, material incorrect regulatory output, unsafe automation, service abuse, or provider/model changes that invalidate prior testing. Preserve evidence, contain exposure, notify the designated owner, assess legal/contractual obligations, and document corrective action. A response time or 24/7 capability must not be promised unless formally staffed and tested.

## 8. Privacy and data minimization

Public preview and staging users must not submit confidential or personal information. The UI and privacy notice should remain aligned with actual request fields and service behavior.

For the staging research workflow, verify before operational claims:

- Request payload and fields transmitted.
- Turnstile token and technical signals.
- Worker logs, observability and error logging.
- AI/research provider chain.
- Processing locations and transfer arrangements.
- Retention and deletion settings.
- Access to logs and incident response.
- Third-party terms and contractual safeguards.

Do not invent retention periods, provider regions, certifications, or deletion guarantees.

## 9. Monitoring, incident response, and change control

Maintain a release record for:

- Model/provider/model-version changes.
- Prompt/system-instruction changes.
- Retrieval sources and coverage changes.
- Tool or API permission changes.
- Data schema, logging, retention, and hosting changes.
- Material user-facing claims and capability labels.
- Test results, approval, deployment, rollback and incident references.

Monitor only where operational telemetry and an accountable owner are actually in place. Mark unavailable monitoring as **NOT EVIDENCED**.

## 10. International control-mapping starter

Use this mapping only as an organizing crosswalk. Applicability and implementation status must be validated against evidence; this is not a certification or conformity statement.

| Framework | Relevant governance areas | Evidence needed | Initial status |
|---|---|---|---|
| NIST AI RMF | Govern, Map, Measure, Manage | Governance owner; context/intended-use record; risk assessment; test/measurement evidence; risk treatment and monitoring | MAPPED (framework identified); implementation NOT EVIDENCED |
| NIST CSF 2.0 | Govern, Identify, Protect, Detect, Respond, Recover | Policies/roles; asset and data inventory; safeguards; monitoring; response plans; recovery evidence | MAPPED (framework identified); implementation NOT EVIDENCED |
| ISO/IEC 27001 | ISMS scope, risk assessment/treatment, controls, internal audit, management review, continual improvement | Scope; risk register; Statement of Applicability; records; audit and review evidence | MAPPED (framework identified); conformity NOT EVIDENCED |
| ISO/IEC 42001 | AI management system, AI risk assessment/treatment, lifecycle controls, monitoring, continual improvement | AI system inventory; impact/risk assessment; lifecycle governance; validation; operational monitoring; review records | MAPPED (framework identified); conformity NOT EVIDENCED |

## 11. Release acceptance gates

Do not label a capability **TESTED** until the test record exists. Do not label **OPERATIONAL** until release approval, ownership, support, security/privacy controls, monitoring, incident response and change-management evidence are present.

Before widening the preview or accepting institutional/customer data, require a documented security/privacy assessment, verified provider/data-flow evidence, authorized testing, and an approved release decision.

## 12. Review cadence

Recommended: review this framework quarterly and at each material model/provider, source, tool, data-flow, or capability change. Review incidents and user-reported errors before the next release. The cadence is a recommendation; no recurring review is claimed to have occurred.

## 13. Related baseline

See [Phase 2 Security & International Assurance Evidence Baseline](PHASE2-EVIDENCE-BASELINE-20261120.md) for source-review evidence, findings, test limitations and remediation priorities.
