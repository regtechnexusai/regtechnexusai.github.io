# MUKUL plant-assessment pilot: model, licence and field-evaluation gate

**Review date:** 2026-10-18  
**Status:** Model not approved; field evaluation not yet performed; inference remains disabled; no website integration.

## 1. Backend test result

The backend test suite was executed locally against the branch's API and test logic after adding MIME/content-format consistency validation and a fail-closed feature-flag test.

- Result: **7 passed**
- Coverage includes health status, inference disabled by default, missing consent, unsupported crop, invalid image, declared MIME vs decoded image-format mismatch, and the guarantee that setting the feature flag alone does not enable a model.
- This is a local run; the GitHub Actions workflow file has been added, but no completed GitHub Actions run for that workflow has been confirmed yet.
- These tests validate API guardrails, not disease-model accuracy, deployment security, camera behavior, or privacy compliance.

## 2. Candidate model and licence review

### Candidate reviewed: LishaV01/agriculture-crop-disease-detection

- Model card lists Apache-2.0 and a ViT/LoRA image-classification model.
- Listed crop classes include sugarcane, maize, potato, rice and wheat. **Tomato is absent**, so the model cannot meet MUKUL's five-crop pilot scope as a single model.
- The model card describes its training data only broadly as RGB images of those crops; this review did not establish a fully traceable dataset manifest, per-class counts, Bangladesh field coverage, independently reproducible evaluation, calibrated uncertainty, or performance on the proposed Bangladesh field datasets.
- The model is therefore **not approved for the pilot**. Apache-2.0 is a favourable code/model licence indicator, but the card's licence label alone does not resolve the provenance and licence status of every training-data source or establish fitness for use.
- Source: https://huggingface.co/LishaV01/agriculture-crop-disease-detection

No model weights were loaded, no predictions were generated, and no disease-accuracy claims are made.

## 3. Bangladesh field-data sources found for evaluation planning

These sources can support a later controlled evaluation, subject to downloading the actual data, checking current dataset terms/metadata, preserving attribution, and checking that labels/splits are suitable. Finding a dataset is not equivalent to evaluating a model.

| Crop | Candidate field dataset | Published licence / note |
|---|---|---|
| Rice | RiceLeafDiseaseBD, Version 3 — https://data.mendeley.com/datasets/86s4jzj2m4/3 | CC BY 4.0; 9,769 field images from Gazipur, six classes, expert-validated annotations described by the dataset authors |
| Tomato | Tomato leaf dataset — https://huggingface.co/datasets/Project-AgML/tomato_leaf_disease_detection | CC BY 4.0; 689 field images from Bangladesh, seven categories; verify source split and class definitions before use |
| Potato | Potato Leaf Disease Dataset — https://data.mendeley.com/datasets/d5b3fzpw3g/1 | CC BY 4.0; 804 original field images from BARI's Khulshi research station, six classes; augmented images must not be counted as independent field samples |
| Maize | MLD: A Multi-Class Maize Leaf Disease Image Dataset from Bangladesh — https://data.mendeley.com/datasets/3myfctrgk3/1 | CC BY 4.0; 1,996 images from Jhenaidah, four classes; review the mix of disease/pest labels and capture conditions |
| Wheat | No sufficiently verified Bangladesh field-disease dataset was established in this review | A documented, appropriately licensed Bangladesh field set is still needed before a five-crop release claim |

The sources above are proposed evaluation material, not evidence that the candidate model recognises those classes. Class names differ across datasets, and some include pests, nutrient/environmental stress, or healthy leaves alongside diseases.

## 4. Required evaluation protocol

Before any model can be approved:

1. Obtain dataset files and review the complete licence, attribution, redistribution, and model-training terms.
2. Have crop specialists validate or adjudicate labels; define the supported crop/disease taxonomy before scoring.
3. Deduplicate images and split by source plant/field/session where possible to prevent leakage. Keep a locked test set unseen during training and model selection.
4. Report per-crop and per-class precision, recall, F1, confusion matrix, calibration, abstention/coverage, and confidence intervals; include an explicit “unknown/insufficient evidence” outcome.
5. Evaluate field variation: cultivar, growth stage, lighting, background, device, severity, mixed symptoms, pests, nutrient/environmental stress, and healthy look-alikes.
6. Compare the candidate with a baseline and require independent agronomist review. Do not use overall accuracy alone as a release criterion.
7. Document model and dataset versions, class mapping, preprocessing, hardware, and exact reproducible commands.

## 5. Security and privacy review status

Implemented in the scaffold: explicit consent field, allow-listed crop/language, size limit, image decoding, allowed media types, no intentional raw-image persistence, exact-origin CORS defaults, and fail-closed 503 responses.

Additional safeguard added: declared MIME type must match the decoded image format.

Still required before integration/deployment: infrastructure request-body limits and timeouts; HTTPS and host/region/vendor review; rate limiting and abuse protection; log/telemetry inspection to ensure no image bytes or personal metadata are recorded; EXIF/GPS stripping; retention/deletion verification; security testing; bilingual consent/privacy copy; mobile browser and camera-permission/stop/error tests; and written pilot sign-off.

## 6. Decision

**Do not connect the website media intake to this backend yet.** The endpoint intentionally returns 503 even if `MUKUL_INFERENCE_ENABLED=true`, because there is no model adapter. A suitable model for all five crops has not been approved, the complete Bangladesh field-image evaluation has not been run, and production privacy/security gates remain open. Keep the site intake as local preview/capture only and do not describe it as active disease diagnosis.
