# MUKUL original illustration plan

## Purpose
Reserve clear, consistent locations for original MUKUL illustrations. No third-party image, stock photo, copied illustration, or unlicensed asset is to be used. When image generation is available, create original artwork specifically for these slots and add optimized PNG files under `/mukul/assets/images/`.

## Asset rules
- Aim for one or two illustrations per public page; avoid decorative overload.
- Preferred formats: optimized PNG; target 100–220 KB per image where practical, without making labels or leaf details illegible.
- Hero / wide panels: 1200 × 800 px or 1200 × 675 px. Article and instructional panels: 900 × 900 px or 1000 × 800 px.
- Use responsive CSS (`width:100%; height:auto` or `object-fit:cover` within a fixed aspect-ratio frame), reserve dimensions/aspect ratio to prevent layout shift, and lazy-load images below the fold.
- Give each meaningful image concise, contextual alt text; use empty alt only for purely decorative artwork.
- No embedded text in artwork unless it is necessary and checked in every supported language.
- Keep generated source/prompt and a short asset note in the project so authorship and purpose remain traceable.
- Do not create medical-looking certainty in crop illustrations. Images are educational examples, not a validated diagnostic dataset.

## Reserved slots

| Page / section | Slot ID | Proposed filename | Purpose |
|---|---|---|---|
| MUKUL landing page hero | `hero-global-agriculture` | `hero-global-agriculture.png` | Original illustration of global agriculture, crops and landscape |
| Marketplace discovery | `market-crop-categories` | `market-crop-categories.png` | Grains, fruit, vegetables and farm supplies |
| Marketplace / regional learning | `global-crop-regions` | `global-crop-regions.png` | Different crops and climates across world regions |
| Free crop-help tool | `leaf-photo-assessment` | `leaf-photo-assessment.png` | A person photographing a leaf for cautious preliminary guidance |
| Free crop-help tool | `field-observation-guide` | `field-observation-guide.png` | Visual checklist: whole plant, leaf underside, stem and field context |
| Agricultural knowledge | `crop-growth-guide` | `crop-growth-guide.png` | Crop stages and healthy growth in an educational sequence |
| Agricultural knowledge | `healthy-and-stressed-leaf-guide` | `healthy-and-stressed-leaf-guide.png` | Illustrative healthy/stressed leaves; not a definitive disease chart |
| International trade readiness | `international-harvests` | `international-harvests.png` | Diverse harvests and responsible cross-border supply |
| International trade readiness | `produce-handling-and-storage` | `produce-handling-and-storage.png` | Safe handling, packing, storage and transport concepts |
| Reference sources | `global-agriculture-knowledge-network` | `global-agriculture-knowledge-network.png` | Abstract global research and agriculture knowledge illustration |

## Crop-photo assessment safeguards
- Explain that image-based output is a preliminary, uncertainty-aware suggestion—not a confirmed diagnosis.
- Request only relevant details and obtain user consent before any upload; explain retention, access and deletion practices before storing images.
- Do not infer location from image metadata without a clear reason and consent; strip unnecessary EXIF metadata on upload where feasible.
- Show confidence/uncertainty honestly; allow “not enough evidence” and recommend local extension services or a qualified plant-health professional when warranted.
- Never prescribe a pesticide or fertilizer dose from an image alone. Refer users to the destination country's official registration, product label, crop restrictions and applicable plant-health rules.
- Before public launch, review each target market's privacy, consumer-protection, plant-health, pesticide and AI-related requirements; test for false positives, crop diversity, lighting and image quality.
- Keep the image assessment disabled or clearly marked as a non-diagnostic prototype until an appropriate validated model, evaluation set, safety review and country-aware policy layer exist.

## Current implementation state
The HTML marks the intended slots using `data-image-slot` / `data-image-slots` attributes. Those attributes are planning markers, not live image URLs. No external images have been embedded. Replace the CSS hero art or add image elements only when original assets have been generated, compressed, reviewed and paired with alt text.
