# RegTech Nexus AI — Implementation & QA Report
**Report date:** 12 October 2026  
**Repository:** `regtechnexusai/regtechnexusai.github.io`  
**Original implementation branch:** `feature/xai-language-learning-2026-10`  
**Duplicate-ID fix branch:** `fix/student-hub-duplicate-ids-2026-10-12`  
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
| Recheck 2 | Required curriculum content, SHAP/LIME references, quiz handlers, baseline comparison | Required content checks passed. Confirmed three duplicate-ID patterns on Student Knowledge Hub already existed on `main`; logged for a separate regression-safe fix. |
| Recheck 3 | Keyboard accessibility, internal route targets, language metadata, broken anchors, course/listening/quiz presence | All six changed files passed the checked shell, language attribute and anchor checks. New course routes resolve to matching `index.html` files in the repository. |

## 4. Known limitations / follow-up
- The GitHub repository has no PR-triggered workflow run or combined commit status available for this branch; static repository checks are not equivalent to browser-based end-to-end testing.
- Live-domain rendering and mobile visual checks must be performed after deployment.
- Speech output depends on browser/device speech synthesis and installed Chinese, Korean or Japanese voices. The pages display a fallback message when playback is unsupported or fails.
- **Duplicate-ID remediation (12 October 2026):** fixed in the follow-up patch. Tool result outputs now use a scoped `.mini-output` selector rather than a repeated `toolResult` ID; the two quiz result targets are explicitly namespaced (`quizResult-legacy` and `quizResult-adaptive`) with matching references; the PWA style and script IDs are now distinct (`student-hub-progress-pwa` and `student-hub-progress-pwa-script`). Static duplicate-ID scan of the updated Student Knowledge Hub file returns zero duplicate IDs.
- Course content is an independent beginner learning resource, not official HSK, TOPIK or JLPT exam preparation. Future course-level alignment should be reviewed against current official guidance.

## 5. Scope and safety
No login/authentication, server-side learner tracking, or sensitive-data collection was added. No calculator logic, architecture content, existing learning topics or established URLs were intentionally removed or replaced. The changes are additive.

## 6. Follow-up duplicate-ID fix — QA
- Updated `student/index.html` in a separate fix branch, preserving the existing page content and tool behaviour.
- Recheck A: static ID inventory — **PASS**, no repeated literal HTML IDs remain.
- Recheck B: quiz target references — **PASS**, both namespaced result targets have matching JavaScript references; no old `quizResult` target remains.
- Recheck C: study-tool output handling and PWA IDs — **PASS**, all 12 study tools use the shared scoped output selector, no generated `toolResult` IDs remain, and style/script IDs are distinct.
- Browser-based end-to-end interaction testing remains pending; static checks cannot prove every browser runtime path.

## 7. Deployment status
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


## 8. Language-course expansion — 12 October 2026
- Reworked only the three existing course pages and added the shared course interaction script at `/student/languages/language-learning.js`. Existing public routes remain unchanged.
- Added a searchable character/letter inventory with common romanisation and Bengali pronunciation guidance. Coverage is language-appropriate: Mandarin Pinyin initials/finals plus common Hanzi; Hangul consonants, vowels, compound vowels, syllable examples and batchim clusters; Japanese Hiragana, Katakana, voiced/contracted kana and beginner Kanji examples.
- Added 50 or more vocabulary/phrase entries per course, with target-script form, romanisation, approximate Bengali pronunciation and Bengali meaning. The same full vocabulary list populates each course's Listen dropdown, and each item has a one-tap speech control.
- Added bilingual practice in both directions: each vocabulary item creates a target-language-to-Bengali question and a Bengali-to-target-language question, resulting in at least 100 question/answer items per course. Learners can search questions and reveal/hide answers.
- Added a character/word click interaction that opens a large visual glyph and touch/mouse trace board. **Limitation:** this is a trace/practice guide with general writing notes, not verified animated per-stroke order data for every character; users should consult a specialist stroke-order reference for authoritative stroke sequencing.
- Added a direct fallback link to the official JLPT page at `https://jlpt.jp/sp/e/index.cgi`. During web verification on 12 October 2026, opening `https://jlpt.jp/sp/e/index.cgi` succeeded and identified itself as the official worldwide JLPT site operated by the Japan Foundation and Japan Educational Exchanges and Services. Fetching the root domain and `https://www.jlpt.jp/e/` timed out in the web-check environment. This indicates an access/fetch issue on those routes in that check, not proof of a global outage.
- Static repository checks: all three course pages contain the expected shared script and required interaction targets; no duplicate literal IDs were found in the three page shells. Vocabulary dataset inspection confirmed at least 50 entries per language. The Q&A bank is generated as two translation directions per vocabulary entry.
- **Still pending:** browser-based end-to-end tests, touch/mouse tracing tests, voice availability checks on actual Android/desktop devices, and live production verification after deployment. Static checks do not prove runtime behavior on every device.


## 9. Language-page site-shell harmonisation — 12 October 2026
- Updated only `student/languages/index.html` and the three existing Chinese, Korean and Japanese course pages to use the main homepage's shared `/styles.css`, branded logo/header navigation, mobile menu behavior, five-column footer information architecture, legal links and responsible-use note.
- Header/footer links that refer to homepage sections now point to root anchors (for example `/#solutions`) rather than broken paths relative to the language subdirectory. All external links and official language-test links remain intact.
- Added short native-language starter phrases with romanisation and Bengali meanings to each course page; the Language Centre includes a few starter words for all three languages.
- CSS loading order keeps the existing language-course-specific styling and learning content while applying main-site header/footer presentation.
- Static checks: four language-related HTML pages contain the shared stylesheet, standard branded footer, mobile menu handler, language phrase examples, no duplicate literal IDs and no known broken homepage-anchor paths.
- Browser visual/responsive checks and live production verification remain pending; repository inspection alone cannot confirm rendered behavior or deployment.
