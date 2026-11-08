# Global Regulatory Source Register — Initial Candidate Set

**Purpose:** Establish a source-led, jurisdiction-aware foundation for RegTech Nexus AI GaaS and AlfiQ Circular Intelligence.  
**Status:** Initial candidate register. URLs below are official publication or reference pages identified during desk research; no automated feed, API, crawler or licence has been activated.  
**Rule:** Every source must be validated for authority, document type, terms of use, retrieval method, update frequency and technical stability before ingestion.

## 1. Initial verified source pages

| Jurisdiction / standard setter | Authority | Official source page | Source types / notes |
|---|---|---|---|
| United Kingdom | Financial Conduct Authority (FCA) | https://www.fca.org.uk/what-we-publish | Consultations, policy papers, final notices, guidance, research, publications and news. FCA distinguishes consultation proposals from final policy and Handbook rules. |
| United Kingdom | FCA Handbook | https://handbook.fca.org.uk/en | Consolidated FCA rules and guidance; use the legal instrument / Handbook record for rule-state verification. |
| European Union | European Banking Authority (EBA) | https://www.eba.europa.eu/publications-and-media | Guidelines, technical standards, reports, opinions and announcements. |
| European Union | EBA Consultations | https://www.eba.europa.eu/publications-and-media/consultations | Consultation-stage material must not be represented as final binding rules. |
| Singapore | Monetary Authority of Singapore (MAS) | https://www.mas.gov.sg/regulation/regulations-and-guidance | Regulations, notices, circulars, guidelines, consultations and other content types. Classify legal effect by instrument type and underlying law. |
| United States | Office of the Comptroller of the Currency (OCC) | https://www.occ.treas.gov/topics/laws-and-regulations/occ-regulations/index-occ-regulations.html | OCC regulations, bulletins, interpretations, proposed issuances and final issuances. |
| United States | Federal Deposit Insurance Corporation (FDIC) | https://www.fdic.gov/laws-and-regulations/fdic-law-regulations-related-acts | FDIC law and regulation reference; the page notes it is not an exhaustive display of every applicable law or regulation. |
| International | Financial Action Task Force (FATF) | https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html | International standards and interpretive notes; implementation occurs through jurisdiction-specific legal frameworks. |
| International | Basel Committee on Banking Supervision / BIS | https://www.bis.org/bcbs/basel-framework.htm | Basel Framework and updates, including past and future effective dates. National implementation must be checked separately. |
| UAE / ADGM | ADGM Financial Services Regulatory Authority | https://www.adgm.com/operating-in-adgm/additional-obligations-of-financial-services-entities/supervision/circulars | FSRA supervisory circulars and thematic communications. |
| UAE / ADGM | ADGM Financial & Cyber Crime Prevention | https://www.adgm.com/operating-in-adgm/financial-and-cyber-crime-prevention/notices-and-circulars | FSRA financial and cybercrime prevention notices and circulars. |

## 2. Next-wave candidate authorities — endpoint validation pending

The following authorities are candidates for subsequent source onboarding. Their official publication endpoints, feed availability, API terms, document identifiers and retrieval controls must be validated before activation.

| Jurisdiction | Candidate authorities |
|---|---|
| United States | Federal Reserve, FinCEN, SEC, Federal Register, eCFR |
| United Kingdom | Prudential Regulation Authority (PRA), Bank of England |
| European Union | European Central Bank (ECB), European Securities and Markets Authority (ESMA), European Commission |
| United Arab Emirates | Central Bank of the UAE (CBUAE), Dubai Financial Services Authority (DFSA), ADGM FSRA |
| Singapore | MAS |
| Hong Kong | Hong Kong Monetary Authority (HKMA), Securities and Futures Commission (SFC) |
| Australia | Australian Prudential Regulation Authority (APRA), Australian Securities and Investments Commission (ASIC), AUSTRAC |
| International | Financial Stability Board (FSB), International Organization of Securities Commissions (IOSCO) |

## 3. Source onboarding record

Every onboarded source should have a controlled record with at least:

- **source_id**
- **jurisdiction_code**
- **authority_name**
- **official_domain**
- **publication_landing_url**
- **retrieval_method** (manual, RSS, API, sitemap or other approved method)
- **terms_review_status**
- **document_types_supported**
- **source_owner**
- **last_checked_at**
- **expected_update_frequency**
- **technical_health_status**
- **verification_status**
- **reviewer**
- **notes**

No endpoint should be described as an API or RSS feed until that exact endpoint has been technically verified and its use is permitted.

## 4. Regulatory instrument classification

Use separate categories; do not collapse all publications into “regulations”.

1. Primary legislation / Act.
2. Regulation / delegated or implementing legislation.
3. Binding rule / rulebook instrument.
4. Supervisory notice, direction or circular — legal effect must be verified in its jurisdiction.
5. Guidance / supervisory expectation.
6. Consultation / discussion paper / proposal.
7. Enforcement action / final notice / consent order.
8. Supervisory review / thematic report.
9. International standard / recommendation.
10. Speech / press release / explanatory publication.

A consultation is not a final rule. A guidance document may have a different legal effect from a rule. An international standard is not automatically domestic law. Enforcement actions are evidence of supervisory or enforcement activity, not necessarily generally applicable rules.

## 5. Minimum source-verification sequence

1. Confirm the domain and authority are official.
2. Open the publication landing page and original document.
3. Capture title, instrument number, issuing body and publication date.
4. Identify the instrument type and legal status.
5. Capture effective date, transition period, expiry or supersession where stated.
6. Check whether a later amendment, correction or withdrawal exists.
7. Identify regulated entities and jurisdictional scope from the source.
8. Preserve the original URL and retrieval timestamp.
9. Record content hash/version to support duplicate and change detection.
10. Obtain human reviewer approval before distributing a material interpretation.

## 6. Automation design

Recommended sequence after source onboarding:

Approved source register → scheduled check → candidate discovery → document retrieval → metadata extraction → duplicate/version check → source validation queue → AI-assisted candidate summary → human review → approved publication/notification.

Controls:
- No autonomous classification of legal effect or applicability.
- No auto-publication of unreviewed regulatory conclusions.
- Do not bypass rate limits, access controls, robots rules, terms or licensing conditions.
- Retain source provenance and previous versions.
- Alert on failed retrieval and stale sources.
- Treat source website redesigns and broken feeds as control exceptions.
- Keep public and tenant-specific analysis separate.

## 7. Desk-research references

The initial verified source pages were reviewed for the following specific features:

- FCA describes its publication categories and distinguishes consultation papers, policy statements, finalised guidance and Handbook rules: https://www.fca.org.uk/what-we-publish
- EBA lists publications and consultations, including guidelines and technical standards: https://www.eba.europa.eu/publications-and-media
- MAS categorises regulatory materials by type, including notices, circulars, consultations, guidelines and regulations: https://www.mas.gov.sg/regulation/regulations-and-guidance
- OCC describes regulations, bulletins, proposed issuances and final issuances: https://www.occ.treas.gov/topics/laws-and-regulations/occ-regulations/index-occ-regulations.html
- FDIC's law and regulation reference warns it is not exhaustive: https://www.fdic.gov/laws-and-regulations/fdic-law-regulations-related-acts
- FATF explains its Recommendations as international standards implemented through different national frameworks: https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html
- BIS describes the Basel Framework and its past/future effective-date updates: https://www.bis.org/bcbs/basel-framework.htm
- ADGM FSRA publishes supervision circulars and financial-crime notices: https://www.adgm.com/operating-in-adgm/additional-obligations-of-financial-services-entities/supervision/circulars and https://www.adgm.com/operating-in-adgm/financial-and-cyber-crime-prevention/notices-and-circulars

**Status limitation:** This is a curated initial register, not a complete global database and not evidence of continuous monitoring. Each source requires technical onboarding and ongoing verification.
