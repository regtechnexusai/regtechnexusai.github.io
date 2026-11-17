# MUKUL 1,000-question bilingual agricultural bank — draft

**Status:** Draft seed bank; not approved for public release.  
**Canonical count:** 1,000 (100 per category). Each canonical record has English and Bangla variants; language variants do not double the canonical count.  
**Live site:** Unchanged. These files are not wired into the current quiz page or deployed as a live quiz.

## Files

- `bank/01-agronomy-crop-science.json`
- `bank/02-horticulture.json`
- `bank/03-soil-plant-nutrition.json`
- `bank/04-plant-health-ipm.json`
- `bank/05-agricultural-engineering-digital.json`
- `bank/06-livestock-veterinary.json`
- `bank/07-fisheries-aquaculture.json`
- `bank/08-agricultural-economics-agribusiness.json`
- `bank/09-climate-smart-sustainable.json`
- `bank/10-research-genetics-biotechnology.json`

## Allocation

| Category | Canonical questions |
|---|---:|
| Agronomy & Crop Science | 100 |
| Horticulture | 100 |
| Soil Science & Plant Nutrition | 100 |
| Plant Health & IPM | 100 |
| Agricultural Engineering & Digital Agriculture | 100 |
| Livestock & Veterinary Knowledge | 100 |
| Fisheries & Aquaculture | 100 |
| Agricultural Economics & Agribusiness | 100 |
| Climate-Smart & Sustainable Agriculture | 100 |
| Research, Genetics & Biotechnology | 100 |
| **Total** | **1,000** |

## Important quality limitation

This is a **draft seed bank**, not a finished expert-verified assessment bank. Questions use reusable prompt archetypes and general principles; some are semantically repetitive. Each item remains `draft`. Its linked FAO page is a starting point, not proof that the exact claim is supported. Exact passage-level source verification, scientific and regional review, duplicate review, bilingual terminology review, answer-key checks and reuse/licensing review are still required. Do not publish or connect these records to production until those gates pass.

No pesticide or fertilizer application rates, definitive crop-disease diagnoses, veterinary treatment prescriptions, or other high-risk instructions are included. Safety-sensitive content should be authored only with current jurisdiction-specific sources and qualified review.

## Next validation steps

1. Parse every file and verify 100 records per category, 1,000 unique IDs and both language variants.
2. Check four options per language, answer-key consistency, schema constraints and duplicate/similarity candidates.
3. Verify each claim against an exact authoritative source passage and record the evidence note.
4. Complete qualified subject-matter review and independent Bangla/English language review.
5. Import to a staging database; run publication-gate tests and quiz UX regression tests before any live integration.
