# MUKUL Agricultural Quiz Database — Foundation Pack

**Owner:** RegTech Nexus AI  
**Product:** MUKUL Agriculture Hub — Knowledge, Crop Care & Agribusiness  
**Version:** 1.0  
**Prepared:** 2026-10-26  
**Status:** Implementation blueprint; not yet production-deployed

## 1. Objective

Build a source-traceable, bilingual (Bangla/English), globally extensible agricultural quiz bank for farmers, students, researchers, and agricultural professionals. The first pilot targets 1,000 canonical questions, each with English and Bangla content, subject to review capacity and source availability.

This pack adds database specifications and governance documents only. It does **not** replace or modify the current quiz pages, scoring logic, result sheet, header, footer, or other MUKUL functionality.

## 2. Architecture decision

- Use PostgreSQL as the system of record for topics, concepts, questions, language variants, options, answers, sources, reviews, and version history.
- Keep one canonical question identity and attach language variants to it; translated variants are not counted as separate canonical questions.
- Keep taxonomy IDs stable and allow optional mapping to external vocabularies such as FAO AGROVOC.
- Do not connect browser code directly to PostgreSQL. A server-side API or managed backend is required before database-backed production use.
- Keep the existing static GitHub Pages quiz operational during the pilot. Build and test the new system on a separate branch/environment; production integration requires a separate reviewed change.
- Do not commit credentials, database URLs containing secrets, API keys, or personal data.

## 3. Data model

The SQL schema is in `schema.sql`. Core entities:

| Table | Purpose |
|---|---|
| `languages` | Supported language codes |
| `topics`, `topic_translations` | Hierarchical subject taxonomy and localized labels |
| `concepts` | Agricultural concepts and optional external vocabulary URI |
| `crops`, `question_crops` | Crop registry and question-to-crop mapping |
| `sources`, `question_sources` | Source register, licensing and claim-level evidence notes |
| `questions` | Canonical question identity, scope, difficulty and lifecycle state |
| `question_translations` | Localized question stem and explanation |
| `question_options`, `correct_answers` | Language-specific options and one/multiple correct answers |
| `question_reviews` | Review decisions, roles and rationale |
| `question_versions` | Change history |
| `question_regions` | Country/region and date applicability |

### Required controls
1. Every published question must have at least one documented source or a recorded, approved rationale for a foundational fact.
2. A question must not be published until required review and language QA are complete.
3. Region-specific recommendations must carry geographic scope and applicable dates where relevant.
4. Any material change to the answer, explanation, or scientific claim must be versioned and re-reviewed.
5. Image/audio questions require asset provenance and license information before release.
6. Use the correct-answer table server-side; never expose answer keys in public page data before a quiz attempt is submitted if that would undermine assessment integrity.

## 4. Initial taxonomy

The pilot uses these ten top-level categories; IDs/slugs should remain stable:

1. Agronomy & Crop Science
2. Horticulture
3. Soil Science & Plant Nutrition
4. Plant Health, Pathology, Entomology & IPM
5. Agricultural Engineering & Digital Agriculture
6. Livestock & Veterinary Knowledge
7. Fisheries & Aquaculture
8. Agricultural Economics & Agribusiness
9. Climate-Smart & Sustainable Agriculture
10. Agricultural Research, Genetics & Biotechnology

Cross-cutting metadata: crop/species, farming system, geographic scope, country/region, season, audience, difficulty, question type, language, evidence source, review status, and validity dates. Taxonomy can reference AGROVOC concepts where a suitable concept exists; do not invent or guess external URIs.

## 5. Question quality and publication standard

### Content rules
- One clear learning objective per question.
- Avoid ambiguity, trick wording, double negatives, and answer options that overlap.
- For single-choice items, exactly one answer must be correct. Use multi-select when multiple answers are scientifically valid.
- Explanation must state why the answer is correct and, where useful, why common distractors are incorrect.
- Distinguish stable scientific facts from changing recommendations, local practice, and policy.
- Record source title, publisher, URL/identifier, publication date if available, access date, license/usage terms, and an evidence note.
- Do not copy protected exam banks, publications, images, or datasets without a valid reuse basis.
- Translation must preserve scientific meaning, units, species names, uncertainty and geographic qualifications. Use a glossary for consistent terms.
- AI-generated content is a draft, not evidence. Human reviewers remain accountable for approval.

### Review workflow
`draft → source_verified → subject_reviewed → language_qa → approved → published`

Additional terminal states: `rejected`, `retired`. The exact production workflow should be enforced in the API, not only by a front-end dropdown.

### Risk-based review
- **Low risk:** basic definitions and stable scientific concepts; editorial and source checks.
- **Medium risk:** crop practices, soil, irrigation, yield, and region-dependent content; subject-matter review recommended/required by policy.
- **High risk:** pesticide use, fertilizer rates, plant/animal disease response, veterinary treatment, food safety or other safety-sensitive recommendations; relevant qualified review and current jurisdiction-specific source required. Do not turn an image classifier result into a definitive diagnosis or treatment recommendation.

## 6. Pilot content allocation

Planning target only; not a claim that these questions already exist.

| Top-level category | Canonical questions |
|---|---:|
| Agronomy & Crop Science | 200 |
| Horticulture | 120 |
| Soil Science & Plant Nutrition | 120 |
| Plant Health & IPM | 150 |
| Agricultural Engineering & Digital Agriculture | 90 |
| Livestock & Veterinary Knowledge | 80 |
| Fisheries & Aquaculture | 70 |
| Agricultural Economics & Agribusiness | 60 |
| Climate-Smart & Sustainable Agriculture | 60 |
| Research, Genetics & Biotechnology | 50 |
| **Total** | **1,000** |

Suggested initial difficulty mix: 40% basic, 40% intermediate, 20% advanced. Rebalance based on pilot results. Prepare Bangla and English variants for each canonical question; this is 1,000 canonical questions, not 2,000 unique questions.

## 7. 90-day implementation plan

- **Days 1–15 — Foundation:** baseline audit of current quiz pages, confirm taxonomy/schema, source policy, review workflow, backup and regression checklist.
- **Days 16–30 — Prototype:** create a non-production database, test imports/exports, bilingual linking, source register and workflow.
- **Days 31–60 — Content pilot:** draft and verify the 1,000-question target; complete bilingual QA and subject review according to risk.
- **Days 61–75 — Integration QA:** implement the API in a staging environment; test filters, answer checking, scoring, results, mobile layout, accessibility and security.
- **Days 76–90 — Controlled pilot:** user test, log issues, resolve critical defects, run regression suite and produce a pilot evaluation report.

Schedule is an estimate, not a guarantee; expert review capacity and backend selection can affect delivery.

## 8. Acceptance criteria

- All published questions have complete required metadata and review records.
- All pilot questions have Bangla and English variants or are explicitly held from bilingual release.
- Source provenance and license/usage basis are recorded.
- No unresolved critical scientific error is known at release.
- Duplicate candidates are reviewed before publication.
- Question scoring and answer checking pass all defined test cases.
- Existing quiz page, PDF/result output, header/footer, navigation and mobile layout pass regression tests.
- No production rollout until staging approval and rollback procedure are verified.

## 9. Non-regression and deployment rules

1. Preserve current `mukul/knowledge/quiz.html` and `mukul/knowledge/crop-quizzes.html` behavior unless a separate change is explicitly reviewed.
2. Do not deploy the database/API as part of this documentation-only change.
3. Keep schema, API and integration work on feature branches and staging.
4. Take a known-good backup before production changes.
5. Test desktop and mobile, Bangla glyph rendering, scoring, explanations, source links and PDF/export output.
6. Document rollback and verify that the previous version can be restored.
7. Never place database credentials or privileged answer keys in static JavaScript.

## 10. Pilot KPIs

- 1,000 canonical questions targeted.
- 100% bilingual coverage for questions approved for release.
- 100% of published questions with required source/review metadata.
- Zero known unresolved critical errors at release.
- Zero unresolved critical regression defects.
- Track duplicate rate, reviewer turnaround, question abandonment, score distribution, report rate and correction time.

## 11. Source starting points

Use authoritative sources appropriate to the claim and jurisdiction. Examples include FAO, IRRI, national agricultural research/extension agencies, recognized universities, and peer-reviewed research. AGROVOC may help map concepts and terms; it is not, by itself, evidence that a particular factual answer is correct. Verify source currency, applicability and reuse/licensing terms before publication.

- FAO AGROVOC: https://www.fao.org/agrovoc/
- IRRI knowledge platforms: https://education.irri.org/knowledge-platforms/
- Bangladesh Rice Knowledge Bank: https://knowledgebank-brri.org/about-brkb/

## 12. Next technical gates

1. Review this schema and taxonomy.
2. Run `schema.sql` in a disposable PostgreSQL database and validate constraints.
3. Create import validation and question linting scripts.
4. Establish reviewer roles and secure API authorization.
5. Integrate only after staging and non-regression tests pass.
