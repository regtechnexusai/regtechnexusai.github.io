# Phase 2 Synthetic Assurance Pack — v0.1

**Repository:** regtechnexusai/regtechnexusai.github.io  
**Parent programme:** [Issue #416](https://github.com/regtechnexusai/regtechnexusai.github.io/issues/416)  
**Execution tracker:** [Issue #436](https://github.com/regtechnexusai/regtechnexusai.github.io/issues/436)  
**Branch:** feat/phase2-synthetic-assurance-packs  
**Status:** Draft test design; execution and independent review are pending  
**Data classification:** Synthetic/public information only

## 1. Evidence and status conventions

- **Source-observed:** directly visible in the current repository source.
- **Expected:** proposed acceptance behaviour for a test; not an observed result.
- **Not run:** no browser execution or test output has yet been captured.
- **Blocked:** implementation path/source could not be located reliably; no behaviour is inferred.
- Do not report accuracy, precision, recall, regulatory compliance or production readiness from this design pack.

## 2. Product capability inventory (source review)

| Product | Source inspected | Observed implementation boundary | Assurance status |
|---|---|---|---|
| AlfiQ browser prototype | `alfiq/index.html`, `alfiq/assets/document-intake.js` | Earlier/revised document intake; local PDF/DOCX/text extraction; two text inputs gate analysis; file extraction has size/page/text limits; OCR is not included. Page describes prototype and human review. | Source inspection only; runtime tests not run |
| ICMS Toolkit | `icms-2026/index.html`, `icms-2026/icms.js` | Browser assessment with 24 questions, six sections, score bands; additional business-unit, AHR weighted composite and Shariah score calculators; indicative, not official rating. | Source inspection only; runtime tests not run |
| TradeGuard | Homepage, GaaS and sitemap references | Homepage/GaaS link to `/tradeguard/`; direct expected source paths `tradeguard/index.html` and `tradeguard.html` were not found in repository content lookup. | Blocked pending exact deployed/source path; no feature claims or tests inferred |

### Important source observations

**AlfiQ document intake**
- Accepted extensions in the inspected intake script: `.txt`, `.md`, `.csv`, `.pdf`, `.docx`.
- PDF/DOCX file limit: 10 MB; PDF maximum: 200 pages; extracted text maximum: 2 MB.
- Text/CSV/Markdown limit: 2 MB.
- PDF extraction is selectable text only; OCR is explicitly not included.
- Extracted text is placed in the matching earlier/revised field locally. The user is instructed to verify headings, tables, footnotes and paragraph order against the original.
- The analysis button is enabled only when both earlier and revised text fields contain content.

**ICMS Toolkit**
- Core questionnaire count: 24; six named sections; four questions per section.
- A full result is blocked while any question remains unanswered.
- The six-section total is summed and grouped into bands: below 18, below 36, below 54, and 54 or above.
- Additional calculations in the inspected script:
  - Business-unit score: 0–100; bands split at 40, 60 and 80.
  - AHR composite: Financial × 40% + ICMS × 35% + Reputation × 25%; each input bounded 0–100.
  - Shariah score: 0–100; categories split at 15, 30 and 50.
- These are implementation observations, not confirmation that the source methodology is legally or regulatorily current. Validate against the exact official guideline and applicable annexures before asserting regulatory correctness.

## 3. AlfiQ synthetic test cases

All inputs below are fictional and contain no customer, bank or personal data. Expected outcomes are acceptance criteria, not observed outputs.

| ID | Scenario / synthetic input | Expected result | Observed result | Status |
|---|---|---|---|---|
| ALF-DOC-01 | Earlier text: “Policy requires annual review.” Revised text: “Policy requires review every six months.” | Both versions populate their matching fields; analysis becomes enabled; comparison identifies the changed review frequency for human assessment. | Not captured | Not run |
| ALF-DOC-02 | Earlier version supplied; revised version empty. | Analysis remains disabled until both versions contain non-empty text. | Not captured | Not run |
| ALF-DOC-03 | Select a zero-byte file. | Intake rejects it and reports that the file is empty; existing text is not silently overwritten. | Not captured | Not run |
| ALF-DOC-04 | Select a PDF within 10 MB and 200 pages containing selectable text. | Text extracts locally with page markers; user is warned to verify ordering and formatting against the original. | Not captured | Not run |
| ALF-DOC-05 | Select an image-only/scanned PDF. | Intake reports no selectable text / OCR is not included; no legal or regulatory interpretation is generated from absent text. | Not captured | Not run |
| ALF-DOC-06 | Select a PDF exceeding 200 pages or 10 MB, or text extraction exceeding 2 MB. | Intake rejects the unsupported size/page volume with a clear error; no partial result is represented as complete. | Not captured | Not run |
| ALF-DOC-07 | Use a text file with invalid UTF-8 or binary NUL bytes. | Intake rejects the file as invalid UTF-8/binary and preserves existing text. | Not captured | Not run |
| ALF-REV-01 | Synthetic change statement has no issuer, instrument number, publication date or official URL. | Reviewer must mark source verification incomplete; no verified obligation or legal conclusion may be accepted. | Not captured | Not run |

**AlfiQ review record required for each executed case:** browser/device, commit SHA, input fixture ID, output capture, extraction warning, reviewer decision, defects and retest result.

## 4. ICMS synthetic test cases

The expected arithmetic below is derived from the inspected JavaScript implementation. It is not a substitute for validating the scoring method against the official Bangladesh Bank ICMS Guideline, July 2026, and its annexures.

| ID | Scenario / synthetic input | Expected result | Observed result | Status |
|---|---|---|---|---|
| ICMS-01 | Leave all 24 question fields blank and submit. | No score is generated; validation reports 24 unanswered and focuses the first unanswered field. | Not captured | Not run |
| ICMS-02 | Answer 23 questions; leave one blank. | Full result is blocked; exactly one unanswered item is reported. | Not captured | Not run |
| ICMS-03 | All 24 answers set to 0. | Total = 0/72; band = Foundation required. | Not captured | Not run |
| ICMS-04 | All 24 answers set to 1. | Total = 24/72; band = Developing. | Not captured | Not run |
| ICMS-05 | All 24 answers set to 2. | Total = 48/72; band = Progressing. | Not captured | Not run |
| ICMS-06 | All 24 answers set to 3. | Total = 72/72; band = Ready for validation. | Not captured | Not run |
| ICMS-07 | Business-unit score = 40, 60, 80 and 80.01 in separate runs. | Expected bands: Low, Moderate, Above Average, High respectively; frequencies: Yearly, Yearly, Half-yearly, Quarterly. | Not captured | Not run |
| ICMS-08 | AHR inputs: Financial 100, ICMS 80, Reputation 60. | Composite = 100×0.40 + 80×0.35 + 60×0.25 = 82.0/100; band = Very Good. | Not captured | Not run |
| ICMS-09 | AHR inputs: 100, 100, 100. | Composite = 100.0/100; band = Excellent. | Not captured | Not run |
| ICMS-10 | Shariah score = 14.99, 15, 30, 50. | Expected categories respectively: Low, Moderate, Above Average, High Shariah non-compliance risk. | Not captured | Not run |
| ICMS-11 | Enter negative, above-100 or non-numeric values in bounded score inputs. | Invalid values are rejected and no score band is presented as valid. | Not captured | Not run |
| ICMS-12 | Generate report after a complete synthetic questionnaire. | Report matches the on-screen total, band and six section scores; “not official” / independent review boundary remains visible. | Not captured | Not run |

**ICMS calculation checks**
- Core total range: 0–72 if each of 24 questions has the intended 0–3 scale. Confirm option values in the HTML form before executing the full set.
- Section totals: four responses per section; six sections.
- AHR test arithmetic: ((100×0.40)+(80×0.35)+(60×0.25)=82.0).
- Do not change the existing calculator formulas during testing. Raise a separate defect if observed behaviour differs from the source-defined expected arithmetic.

## 5. TradeGuard assurance status and intake requirements

**Blocked — implementation source path not yet established.** The homepage and GaaS page link to `/tradeguard/`, and the sitemap lists that route. Repository content lookup did not resolve `tradeguard/index.html` or `tradeguard.html`. No TradeGuard form fields, scoring logic, rules or capabilities are assumed in this pack.

Before drafting executable test cases:
1. Resolve the exact repository path and current deployed asset bundle for `/tradeguard/`.
2. Inspect HTML, JavaScript, rule/configuration files and any referenced source register.
3. Record whether processing is browser-local, server-side or simulated.
4. Identify actual input fields, risk indicators, outputs, export/storage behaviour and user warnings.
5. Only then define expected outcomes from the implemented logic and documented methodology.

Candidate synthetic scenario classes—**not yet executable tests**:
- Documentary inconsistency across synthetic invoice, transport and payment records.
- Unit-price / quantity / total-value mismatch.
- Country-of-origin, routing or counterparty mismatch.
- Missing or contradictory trade documents.
- Legitimate explanation / mitigating evidence to challenge a potential red flag.
- Insufficient data: output should remain inconclusive rather than infer wrongdoing.

A red flag is not proof of TBML or criminal conduct. Human investigation and source/document verification remain mandatory.

## 6. Regulatory-source evidence schema

For each regulatory assertion used in any test, record:

| Field | Required evidence |
|---|---|
| Jurisdiction | Country / territory / cross-border framework |
| Issuer | Official regulator / standard setter |
| Instrument identity | Exact title, circular / rule / standard number |
| Instrument type | Binding law / regulation / circular / guidance / standard / consultation |
| Publication date | Official date |
| Effective date | Official date or “not stated” |
| Official source | Direct issuer URL |
| Status | Current / amended / superseded / repealed / unclear |
| Supersession | Replacing or amending instrument, if verified |
| Applicability | Entity / activity / product / jurisdiction basis |
| Last verified | Date and reviewer |
| Review note | Unresolved legal interpretation or applicability issue |

Do not use secondary commentary as the sole evidence for a binding obligation. Do not assume international standards automatically constitute domestic law.

## 7. Execution log

| Date (UTC) | Commit / build | Test IDs executed | Passed | Failed | Blocked | Reviewer | Evidence |
|---|---|---|---:|---:|---:|---|---|
| Pending | Pending | None | — | — | — | Pending | No browser execution evidence captured |

## 8. Release / acceptance gates

- [ ] Exact TradeGuard source path and implementation boundary resolved.
- [ ] AlfiQ test cases executed in supported browsers; output evidence attached.
- [ ] ICMS test cases executed; boundary and report consistency verified.
- [ ] Official source/methodology checks completed for regulatory claims and score references.
- [ ] Observed outputs reviewed independently; defects triaged.
- [ ] Retests pass on a recorded commit.
- [ ] Public descriptions match the actual implemented scope.
- [ ] No live bank/customer data used; no paid services or production activation.

**Current conclusion:** This pack is a versioned test design and source-inspection record only. It is not product validation, independent assurance, regulatory approval or a production-readiness opinion.
