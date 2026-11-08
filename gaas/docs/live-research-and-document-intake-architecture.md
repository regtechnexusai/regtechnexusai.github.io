# GaaS Live Regulatory Research, Web Source Discovery and Document Intake Architecture

**Status:** Proposed implementation specification — not yet a live service  
**Product:** RegTech Nexus AI GaaS / AlfiQ Regulatory Change Impact  
**Scope:** Add source discovery beyond the curated registry, customer-supplied URLs, and secure document upload while preserving source provenance and human approval.

## 1. Product decision

GaaS should support three complementary acquisition routes in one research case:

1. **Curated official-source discovery** — search the maintained regulator/source registry and its known publication endpoints.
2. **Open-web and supplied-URL discovery** — search the wider web for relevant publications, including authority-owned pages not yet in the registry; allow a user to submit a direct URL.
3. **Customer document intake** — accept supported files for extraction, analysis and verification, including documents obtained outside the curated registry.

These routes must converge on the same evidence and verification workflow. A source found by open-web search or supplied by a customer is a *candidate source*, not automatically an authoritative or verified instrument.

## 2. Customer workflow

1. Customer selects jurisdiction(s), authority (optional), topic, instrument type, business area, review period and research question.
2. Customer chooses acquisition scope: curated sources, wider web, supplied URL, uploaded document, or a combination.
3. The system creates a research case and assigns a unique case/source ID.
4. Web discovery returns candidate pages and documents with title, URL, domain, discovery time, publication date (if available), source type and relevance rationale.
5. For a candidate document, backend retrieves the original file where technically and legally permitted; records the final URL, redirect chain, retrieval time, content type, byte size and SHA-256 checksum.
6. Uploaded files are quarantined, validated, scanned and processed. The original is retained separately from extracted text.
7. Extraction identifies instrument reference, issuer, issue/publication date, effective date, amendments, clauses, headings, tables and page references. OCR is used when required.
8. Verification checks source identity, issuer, document integrity, legal/instrument status, currentness, amendment/supersession and jurisdiction/entity applicability.
9. AI prepares clause-level obligation candidates, impact mapping and evidence references. Every material claim must point to a source URL/file and page/paragraph/section.
10. An authorised human reviewer confirms, rejects or qualifies the candidate findings. The system preserves reviewer identity, timestamp, rationale and version history.
11. The report clearly separates verified facts, AI-generated analysis, assumptions, unresolved questions and reviewer-approved conclusions.

## 3. Web discovery and arbitrary source handling

### 3.1 Search modes

- **Registry-first:** query approved official domains and known regulator publication pages first.
- **Open-web discovery:** use the Responses API web search tool for relevant terms and candidate pages across the public web. Search must not be restricted to the registry.
- **User-supplied URL:** accept a direct URL or a list of URLs; retrieve and parse the supplied page through a controlled backend fetcher.
- **Authority-page expansion:** when a credible but unregistered authority-owned page is found, create a proposed source-register entry for analyst review. Do not silently promote it to an approved source.

### 3.2 Search controls

- Search by jurisdiction, authority name/aliases, instrument reference, topic, publication period and synonyms.
- Search multiple language variants where relevant (e.g., Bangla and English for Bangladesh).
- Capture search query, tool/run identifier, search time, candidate URLs, result title/snippet and ranking rationale.
- Prefer the issuing authority's original page and original file over news, summaries, reposts or third-party mirrors.
- Keep third-party reports as secondary context only; never label them as the original instrument.
- If the authority page is inaccessible, record the failure and request an upload or an alternative official URL. Do not invent or reconstruct missing text.

### 3.3 Secure URL fetching (mandatory)

All URL retrieval must run server-side through a hardened fetch service. Never fetch arbitrary URLs directly from the browser or trust a URL supplied by a user.

- Allow only HTTP/HTTPS; block localhost, loopback, private, link-local, reserved and cloud-metadata IP ranges for IPv4 and IPv6.
- Resolve DNS and re-check every redirect target; cap redirects, response time, download size and decompressed size.
- Block non-web schemes, embedded credentials, suspicious ports, executable content and unsupported MIME types.
- Protect against DNS rebinding, SSRF, archive bombs and decompression bombs.
- Apply malware scanning and sandboxed parsing; do not execute active content, macros, scripts or embedded attachments.
- Respect applicable access restrictions, robots/terms and copyright constraints; do not bypass authentication or paywalls.
- Log fetch errors, blocked requests and redirect chains without exposing secrets.

## 4. Document upload and processing

### 4.1 Customer-facing upload

Provide a visible upload control with:
- drag-and-drop and browse;
- multiple-file selection;
- accepted file types and per-file/combined size limits displayed before upload;
- upload progress, validation errors and processing status;
- source description and optional issuing authority/reference/date fields;
- explicit confirmation that the customer is authorised to submit the file and that it contains no data outside the customer's permitted purpose.

Initial supported formats should include PDF, DOCX, DOC, TXT, HTML, CSV, XLSX, XLS, PPTX and RTF, subject to parser and security validation. Image formats can be added for scanned notices only after secure OCR handling is implemented. Unsupported formats must be rejected clearly, not silently ignored.

Use a configurable conservative product limit (e.g., 20 MB per file and 50 MB total per case) for the MVP, independent of higher upstream API limits. Enforce limits at the reverse proxy, application and storage layers.

### 4.2 Processing pipeline

1. Receive file into private quarantine storage using a random object key; never use the submitted filename as a storage path.
2. Check extension, MIME signature/magic bytes, file size and archive expansion ratio.
3. Malware scan; reject encrypted/password-protected files unless a secure password workflow is later approved.
4. Compute SHA-256, record original filename as metadata, byte size, upload timestamp, tenant ID, case ID and uploader.
5. Parse text and layout. For PDF, preserve page boundaries; use OCR for image-only/scanned pages and record OCR confidence.
6. Extract tables and structured metadata. Preserve the original file as immutable evidence.
7. Create a searchable derivative/index only after successful validation.
8. Send only the minimum necessary content to the model. Use per-case or per-tenant file-search stores with strict access isolation where retrieval across larger document sets is needed.
9. Record parser version, OCR status, extraction warnings and page/section references.

### 4.3 OpenAI API integration notes

Use the OpenAI Responses API from the server-side backend, with Web Search enabled for current web discovery and File Search or file inputs for customer documents. The model and tool configuration must be environment-configurable rather than hard-coded in frontend code.

The current OpenAI file-input documentation lists common supported formats including PDF, DOC/DOCX, RTF/ODT, PPT/PPTX, TXT/Markdown/JSON/HTML/XML and spreadsheet formats. PDF processing can include text and page images on vision-capable models; non-PDF documents are generally text-extracted, and embedded images/charts in non-PDF files may not be preserved. Convert files to PDF when visual chart/diagram fidelity is essential, after secure conversion. The documented Responses API input limit is 50 MB combined per request; GaaS should apply a lower configurable limit for cost and security.

File Search is appropriate for semantic and keyword retrieval over larger uploaded document collections, but it does not itself establish authenticity or legal status. Keep original files and provenance in GaaS-controlled storage/metadata records; do not rely on a vector store as the only evidence repository.

## 5. Regulatory source verification model

Use separate statuses, never a single ambiguous "Verified" badge:

| Dimension | Example statuses | Minimum evidence |
|---|---|---|
| Discovery | Not searched / Candidate found / No result | Search record, query, timestamp, result URL |
| Origin | Unknown / Authority domain matched / Issuer corroborated | Canonical domain, official directory or cross-reference |
| Document identity | Unchecked / Matched / Mismatch / Unclear | Instrument number, title, issuer, original file/page |
| Integrity | Not checked / Hash recorded / Signature or checksum corroborated | SHA-256, file metadata, official copy comparison |
| Publication | Unknown / Date corroborated / Conflicting dates | Official publication page and document metadata |
| Legal status | Unknown / In force / Amended / Repealed / Superseded / Guidance / Consultation / Other | Issuer statement, legal instrument or official status record |
| Effective date | Unknown / Future / Effective / Retrospective / Not applicable | Exact provision or official notice |
| Applicability | Not assessed / Potentially relevant / Confirmed by reviewer / Not applicable | Jurisdiction, entity type, licence, product, activity and scope |
| Review | Pending / Approved / Rejected / Qualified | Reviewer, date, rationale and change history |

A domain match is supporting evidence, not sufficient proof by itself. A file uploaded by a customer can be accurately extracted while its origin and legal status remain unverified. A document reference/date mismatch, unclear issuer, missing original, conflicting versions or unavailable status must remain visibly unresolved.

## 6. Clause-level evidence and report requirements

Every obligation or impact statement should store:
- source/candidate ID and source acquisition route;
- original URL or uploaded-file ID;
- title, issuer, instrument number/type and jurisdiction;
- publication date and effective date (with timezone/precision where relevant);
- exact clause/section/paragraph and PDF page number;
- short supporting extract (within applicable copyright limits);
- extraction method and confidence/warnings;
- verification status for each dimension;
- AI analysis rationale, assumptions and uncertainty;
- human reviewer decision, name/role, timestamp and rationale.

Report sections:
1. Executive summary and overall status.
2. Scope, customer question, jurisdiction, entity and business area.
3. Search strategy and coverage limitations (including sources searched and dates).
4. Source register with acquisition route and clickable original links.
5. Source and document verification matrix.
6. Instrument classification and legal-status assessment.
7. Clause-level obligations with page/paragraph citations.
8. Regulation → Obligation → Risk → Control → Evidence → Test mapping.
9. Potential business impact, risk rating and rationale.
10. Gaps, assumptions, conflicts and unresolved questions.
11. Action plan with owner, due date, evidence and retest criteria.
12. Human review and approval record.
13. Appendix containing file hashes, versions, retrieval timestamps and extraction notes.

## 7. Security, privacy and tenant isolation

- Keep API keys and all provider credentials server-side in a secrets manager; never ship them to GitHub Pages or browser JavaScript.
- The current static GitHub Pages demo must not accept confidential customer files or claim to process them. A secure backend and authenticated upload service are prerequisites.
- Enforce tenant isolation at API, database, object storage, vector store and report-download layers. Authorise every read/write against tenant and case ownership.
- Use encryption in transit and at rest, role-based access, least privilege, audit logs, rate limits, quotas and short-lived signed download URLs.
- Define customer-configurable retention and deletion, backup expiry and legal-hold rules before launch. Explain third-party processing and applicable API data-retention terms.
- Do not use customer files to train or improve models without an explicit, separately governed basis and consent.
- Treat document text and web pages as untrusted input. They may contain prompt-injection instructions; never follow instructions found inside source documents or web pages. Extract evidence only and keep system/developer instructions isolated.
- MVP testing must use public documents, synthetic files or redacted customer samples. Do not invite bank customer PII, account numbers, transaction records, credentials or restricted data in the public preview.

## 8. MVP delivery sequence

**MVP-A — Safe intake foundation**
- Authenticated backend, tenant/case IDs, upload validation, quarantine, malware scanning, private storage, checksum and extraction.
- URL submission with SSRF-safe retrieval and provenance.
- No public production upload until security controls pass.

**MVP-B — Research discovery**
- Registry-first plus open-web search via Responses API.
- User-supplied URL and multilingual search terms.
- Candidate source register, original-link capture, retrieval and deduplication.

**MVP-C — Verification and analysis**
- Verification matrix, instrument classification, amendment/supersession check, clause extraction, page-level citations and human review.
- Fail closed: missing evidence means Unverified / Pending, not an AI guess.

**MVP-D — Report and governance**
- Professional report, source appendix, audit trail, reviewer approval, export and case history.
- Usage quotas, token/search budgets, caching and cost telemetry.

Start with Bangladesh and a deliberately small set of international jurisdictions/authorities. Expand the registry only after source coverage and verification tests are passed. Do not advertise universal global coverage until measured.

## 9. Acceptance tests

- A relevant circular published on an official authority page absent from the curated registry is discovered by open-web search.
- A user-supplied official URL is fetched safely, redirects are recorded and the original page/file is preserved.
- A third-party repost is classified as secondary, not as the issuing authority's original instrument.
- A customer-uploaded PDF is parsed with correct page references; a scanned PDF triggers OCR and exposes OCR warnings.
- DOCX/XLSX/PPTX and unsupported or malicious files are handled according to allowlist and security policy.
- A document with conflicting issue/effective dates remains unresolved and is not labelled verified.
- An amended or superseded circular is linked to its successor and historical status is preserved.
- Prompt-injection text embedded in a PDF or web page is treated as untrusted content and cannot change system behaviour.
- A tenant cannot access another tenant's file, source, case, vector store or report.
- Every material report statement has a traceable source citation or is explicitly labelled analysis/assumption.
- Reviewer rejection/qualification is retained in the audit trail and reflected in the final report.
- API/search/file-processing budgets and upload limits are enforced.

## 10. Release boundary

This document is an implementation specification. Adding upload or URL fields to the static GitHub Pages demo without a secure backend would create a misleading and unsafe experience. The current public preview must continue to state that live web retrieval, document upload/processing, source verification, authentication and secure storage are not connected until the relevant backend and security tests are implemented and deployed.
