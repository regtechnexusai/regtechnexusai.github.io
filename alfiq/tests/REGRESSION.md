# AlfiQ 0.6 regression checklist

Run against the PR preview before merge. Use synthetic/public text only.

## Sample and comparison
- [ ] Load Sample Regulation fills earlier text, revised text and clearly labelled synthetic source notes.
- [ ] Analyse identifies the five-to-seven-year retention amendment as a candidate pair.
- [ ] Candidate paragraph similarity is at least 60%; lower-scoring paragraphs remain in added/removed lists.
- [ ] Reordered clauses are paired where the one-to-one Jaccard candidate score meets the threshold.
- [ ] Phrase-level differences show changed wording; no legal-equivalence conclusion is displayed.

## Mandatory sign-off and audit
- [ ] TXT and Print/PDF controls are disabled before analysis.
- [ ] Controls remain disabled with any of the six checks incomplete.
- [ ] Controls remain disabled when reviewer name or role is blank.
- [ ] Completing all six checks and reviewer details enables export only after fresh analysis.
- [ ] Editing either source text or source notes disables export until re-analysis.
- [ ] SHA-256 fingerprints are present for both exact source text values.
- [ ] Review timestamp is ISO 8601 and reviewer identity is included.
- [ ] Changing a triage status or comment is reflected in the exported audit record.
- [ ] Reset clears source inputs, report, reviewer fields and checklist state.

## Rule packs
- [ ] General Compliance JSON loads from the same-origin static path.
- [ ] Banking/AML JSON loads from the same-origin static path.
- [ ] Data Privacy JSON loads from the same-origin static path.
- [ ] Custom valid JSON pack loads locally and its signals appear after re-analysis.
- [ ] Invalid schema, duplicate IDs, invalid regular expressions and oversized packs are rejected.
- [ ] No imported pack can bypass the sign-off gate.

## Approved AlfiQ handoff
- [ ] Handoff button remains disabled until all six checks, reviewer details and fresh analysis are complete.
- [ ] Handoff opens the Policy Gap Analyzer on the same origin.
- [ ] Receiver consumes and deletes the one-time localStorage item.
- [ ] Expired, malformed and replayed identifiers are rejected.
- [ ] Receiver displays only summary metadata and triage states; no original source text or reviewer comments are transferred.
- [ ] Handoff summary is explicitly labelled context only and is not analysed as a policy excerpt.

## Mobile and privacy
- [ ] Layout remains usable at 360px viewport width.
- [ ] No source document text is sent to an external service.
- [ ] Built-in rule-pack requests remain same-origin.
- [ ] Browser refresh does not claim that unsaved work was persisted.

## Local document intake and synchronized panes
- [ ] Text/Markdown/CSV continues to load locally with its 2 MB limit.
- [ ] Valid PDF text is extracted locally using the self-hosted PDF.js build.
- [ ] PDF intake rejects files above 10 MB and documents above 200 pages.
- [ ] PDF extraction rejects extracted text above 2 MB.
- [ ] Scanned/image-only PDFs are clearly identified; no OCR or diagnosis is claimed.
- [ ] Valid DOCX text is extracted locally using the self-hosted Mammoth browser build.
- [ ] Invalid PDF headers and invalid DOCX ZIP signatures are rejected without replacing existing pane text.
- [ ] Extracted text dispatches the input event and invalidates any prior analysis/sign-off.
- [ ] Source-pane scroll position is synchronized proportionally when enabled.
- [ ] Scroll synchronization can be disabled and does not introduce horizontal overflow.
- [ ] Browser regression confirms no source document content is sent to an external origin.
- [ ] PDF.js and Mammoth licences are shipped with the self-hosted build assets.

## Deferred scope
OCR for scanned/image-only PDFs, exact visual fidelity for complex tables/footnotes, and semantic clause equivalence remain out of scope. The synchronized panes use proportional scroll position, not guaranteed clause-to-clause alignment. PDF/DOCX extraction is text extraction only; reviewers must validate layout and references against the original files.
