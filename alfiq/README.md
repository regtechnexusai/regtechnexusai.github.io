# AlfiQ — Regulatory Change Impact Agent (Prototype 0.1)

## Purpose
An additive, browser-only prototype under /alfiq/ for comparing earlier and newer regulatory text, identifying exact paragraph additions/removals, surfacing transparent keyword-based obligation prompts, suggesting business areas for human triage, and producing preliminary review notes.

## Cost and deployment
- Static HTML, CSS and JavaScript; no paid API or hosting dependency.
- Uses existing GitHub Pages deployment and shared RegTech Nexus AI site shell.
- Contact email: regtechnexusai@gmail.com.
- No payment gateway, QR payment, subscription, authentication, server, database or email automation is enabled.

## Functional boundary
- Local text input and TXT/MD/CSV file reading in the browser.
- No file upload to a server and no PDF/OCR extraction.
- No live AI model, regulatory-source monitoring, source authentication or legal interpretation.
- Exact paragraph matching after whitespace normalisation; keyword prompts are heuristic only.
- Public documents and synthetic examples only. Do not use confidential bank/customer/KYC/transaction data.

## Production requirements
1. Secure backend and server-side AI provider credentials; never expose API keys in frontend code.
2. Authentication, role-based access, tenant isolation and secure document storage.
3. Document parsing with page/paragraph provenance and source/version tracking.
4. Source authenticity, legal status, publication/effective date and applicability verification.
5. Prompt-injection controls, malware scanning, file limits, rate/cost controls and audit logs.
6. Retention/deletion controls, privacy notice, terms, incident response and security testing.
7. Human approval workflow and clear distinction between verified facts, observations, inferences, assumptions and unverified items.
8. Legal, regulatory and data-protection review for each target jurisdiction.

## Regression / acceptance checklist
- [ ] Page loads at /alfiq/ on desktop and mobile.
- [ ] Shared header/footer appear once and navigation menu works.
- [ ] Existing homepage, calculators, algorithms, tables and other pages remain unchanged.
- [ ] Added and removed paragraph counts are correct for controlled sample inputs.
- [ ] Keyword prompts are labelled as potential signals, not determinations.
- [ ] Empty-input validation works.
- [ ] Clear workspace resets text, results and review checkboxes.
- [ ] TXT/MD/CSV file is read locally; no network upload is triggered.
- [ ] Downloaded review notes contain source notes, findings and limitations.
- [ ] Print layout is usable.
- [ ] No secrets, personal data or confidential banking data are committed.

## Release controls
This is a feature-branch proposal only. Do not merge to main or publish until the owner reviews the PR and explicitly approves. No existing file outside /alfiq/ should be modified by this feature.
