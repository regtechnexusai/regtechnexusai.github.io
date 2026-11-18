# Phase 2 assurance-pack correction — v0.2

The AHR worked example in v0.1 contained an arithmetic typo. The stated formula is Financial × 40% + ICMS × 35% + Reputation × 25%. For inputs 100, 80 and 60, the correct result is:

`(100 × 0.40) + (80 × 0.35) + (60 × 0.25) = 40 + 28 + 15 = 83.0`.

The ICMS production calculator's displayed result of **83.0 / 100** is consistent with the stated weights. This correction changes documentation and test expectations only; it does not change calculator logic, weights, thresholds or outputs.

The v0.1 record remains in the repository for traceability; use this correction when referring to the AHR worked example.