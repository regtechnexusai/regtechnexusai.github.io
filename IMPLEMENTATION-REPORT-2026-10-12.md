# RegTech Nexus AI — Implementation & QA Report
**Report date:** 12 October 2026  
**Repository:** `regtechnexusai/regtechnexusai.github.io`  
**Implementation branch:** `feature/xai-language-learning-2026-10`  
**Pull request:** [#17 — Add XAI assurance lab and Bengali-based Asian language learning](https://github.com/regtechnexusai/regtechnexusai.github.io/pull/17)

## 1. Executive summary
Implemented an additive update package for the Explainable AI page and Student Knowledge Hub. The change set is designed to preserve existing pages, tools, calculators, routes and learning content. Three static QA passes were performed; corrections were applied where checks identified missing navigation and accessibility improvements.

## 2. Delivered
### Explainable AI
- Added an Explainable AI Assurance Lab.
- Added practical guidance on SHAP and LIME, including limitations and the distinction between feature attribution and causation.
- Added model explanation fidelity, stability, sensitivity, bias/fairness, human-review and evidence checks.
- Added a synthetic transaction-monitoring example and reusable control-testing evidence fields.
- Added direct links to SHAP documentation and the LIME reference implementation.
- Added the Assurance Lab anchor to the page navigation and refreshed the page's `dateModified` metadata to 12 October 2026.

### Student Knowledge Hub
- Added a Bengali-based Asian Language Learning Centre at `/student/languages/`.
- Added separate beginner course pages:
  - `/student/languages/chinese/`
  - `/student/languages/korean/`
  - `/student/languages/japanese/`
- Chinese covers Pinyin, tones, characters/stroke order, basic phrases, sentence structure, listening practice and a working two-question quiz.
- Korean covers Hangul, syllable blocks, pronunciation/batchim, spelling, phrases, sentence structure, listening practice and a working two-question quiz.
- Japanese covers Hiragana, Katakana/Kanji foundations, pronunciation/rhythm, phrases, particles, listening practice and a working two-question quiz.
- Added browser speech playback with graceful fallback when speech synthesis or a compatible voice is unavailable. This is a practice aid, not a substitute for reviewed native-speaker audio.
- Added skip-to-content keyboard navigation and focus-visible styles to the new pages and Student Knowledge Hub.

## 3. Recheck log
| Pass | Scope | Result |
|---|---|---|
| Initial test | HTML shell, titles, file sizes and key section presence | Found missing XAI nav link to the new Assurance Lab; browser speech practice was not yet present. |
| Recheck 1 | HTML shell closure, internal anchors, feature presence | Corrected XAI navigation; added listening controls to all three language lessons. |
| Recheck 2 | Required curriculum content, SHAP/LIME references, quiz handlers, baseline comparison | Required content checks passed. Confirmed three duplicate IDs on Student Knowledge Hub already existed on `main`; not changed because shared JavaScript dependencies require separate regression-safe remediation. |
| Recheck 3 | Keyboard accessibility, internal route targets, language metadata, broken anchors, course/listening/quiz presence | All six changed files passed the checked shell, language attribute and anchor checks. New course routes resolve to matching `index.html` files in the repository. |

## 4. Known limitations / follow-up
- The GitHub repository has no PR-triggered workflow run or combined commit status available for this branch; static repository checks are not equivalent to browser-based end-to-end testing.
- Live-domain rendering and mobile visual checks must be performed after deployment.
- Speech output depends on browser/device speech synthesis and installed Chinese, Korean or Japanese voices. The pages display a fallback message when playback is unsupported or fails.
- Existing Student Knowledge Hub duplicate IDs remain: `toolResult`, `quizResult`, and `student-hub-progress-pwa`. These were verified on the base `main` branch before the changes and are outside this change set.
- Course content is an independent beginner learning resource, not official HSK, TOPIK or JLPT exam preparation. Future course-level alignment should be reviewed against current official guidance.

## 5. Scope and safety
No login/authentication, server-side learner tracking, or sensitive-data collection was added. No calculator logic, architecture content, existing learning topics or established URLs were intentionally removed or replaced. The changes are additive.

## 6. Deployment status
- **Repository integration:** PR [#17](https://github.com/regtechnexusai/regtechnexusai.github.io/pull/17) was merged successfully using squash merge. Merge commit: `5bab43e396cedaf6475f43eb02e4db3119cfa2a1`.
- **Main-branch verification:** all six implementation pages plus this report were fetched successfully from the repository's `main` branch after merge; the XAI assurance module and all three language course files are present.
- **Live-domain verification:** **NOT CONFIRMED — VERIFICATION REQUIRED.** The external website could not be fetched from this execution environment because DNS resolution failed. This does not prove the site is down; it means production rendering and GitHub Pages publication could not be independently confirmed here.
- **Next production check:** open the five public URLs below in a browser and test on mobile/desktop:
  - https://regtechnexusai.com/explainable-ai.html#xai-assurance-lab
  - https://regtechnexusai.com/student/languages/
  - https://regtechnexusai.com/student/languages/chinese/
  - https://regtechnexusai.com/student/languages/korean/
  - https://regtechnexusai.com/student/languages/japanese/
- Do not treat repository merge alone as proof of live deployment.
