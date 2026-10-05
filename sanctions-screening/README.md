# Sanctions Screening Module

This is an isolated RegTech Nexus AI module. It does not import or modify TradeGuard, ICMS, PayScale, MD/CEO, Architecture, Student Hub, Mathematics or shared calculator logic.

## Current repository implementation
- Public route: /sanctions-screening/
- Browser demo uses synthetic records only.
- No customer/PII data is transmitted or stored by this demo.
- Authoritative source families are documented but live ingestion is intentionally not embedded in the static GitHub Pages site.
- Methodology separates similarity scoring from human sanctions disposition.

## Production boundary
For live screening, deploy a separate API-first application (for example screening.regtechnexusai.com) with Next.js, NestJS, PostgreSQL, Redis/workers and object storage. Connect the static front end only through a controlled API contract after privacy, security, retention, access control, evidence integrity and source-validation controls are implemented.

## Non-negotiable controls
1. Raw -> Validated -> Normalized -> Published ingestion.
2. Never replace the last valid source version with corrupt data.
3. Preserve source version and engine/parser version with every result.
4. Source unavailable/stale = Screening Incomplete.
5. Potential match != confirmed match.
6. PEP is separate from sanctions.
7. Human review is mandatory for final disposition.
8. Do not describe algorithmic score as legal certainty.
