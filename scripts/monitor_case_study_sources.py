#!/usr/bin/env python3
"""Discover candidate regulatory publications from official source pages.

This script deliberately does not generate legal conclusions or publish case content.
It produces a review queue for human verification.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from html import unescape
from urllib.error import URLError, HTTPError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

SOURCES = [
    {
        "name": "BFIU Annual Reports",
        "url": "https://www.bfiu.org.bd/index.php/publication/index/0/1",
        "allowed_hosts": {"www.bfiu.org.bd", "bfiu.org.bd"},
    },
    {
        "name": "BFIU Circulars",
        "url": "https://bfiu.org.bd/index.php/legislation/circular",
        "allowed_hosts": {"www.bfiu.org.bd", "bfiu.org.bd"},
    },
    {
        "name": "Bangladesh Bank Publications",
        "url": "https://www.bb.org.bd/en/index.php/publication/puball",
        "allowed_hosts": {"www.bb.org.bd", "bb.org.bd"},
    },
    {
        "name": "Bangladesh Bank FICSD Report",
        "url": "https://www.bb.org.bd/pub/annual/ficsd/annual_report_19_21.pdf",
        "allowed_hosts": {"www.bb.org.bd", "bb.org.bd"},
    },
    {
        "name": "FATF Publications",
        "url": "https://www.fatf-gafi.org/en/publications.html",
        "allowed_hosts": {"www.fatf-gafi.org", "fatf-gafi.org"},
    },
]

KEYWORDS = re.compile(
    r"annual report|case stud|typolog|money laundering|terrorist financ|"
    r"trade.?based|financial crime|financial integrity|supervisory|"
    r"guidance|risk assessment|beneficial ownership|virtual asset|"
    r"fraud|sanction|payment|aml.?cft|proliferation financ",
    re.IGNORECASE,
)
TAG_RE = re.compile(r"<[^>]+>")
ATTR_RE = re.compile(r"""href\s*=\s*(['"])(.*?)\1""", re.IGNORECASE)


def fetch(url: str) -> str:
    request = Request(
        url,
        headers={"User-Agent": "RegTechNexusAI-OfficialSourceMonitor/1.0 (publication discovery; contact: regtechnexusai.com)"},
    )
    with urlopen(request, timeout=25) as response:
        content_type = response.headers.get("Content-Type", "").lower()
        if "pdf" in content_type or url.lower().endswith(".pdf"):
            return ""
        return response.read(3_000_000).decode("utf-8", errors="replace")


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(TAG_RE.sub(" ", value))).strip()


def discover(source: dict) -> tuple[list[dict], str | None]:
    try:
        html = fetch(source["url"])
    except (HTTPError, URLError, TimeoutError, OSError) as exc:
        return [], f"{type(exc).__name__}: {exc}"

    candidates = []
    for match in re.finditer(r"<a\b[^>]*>(.*?)</a\s*>", html, re.IGNORECASE | re.DOTALL):
        anchor = match.group(0)
        href_match = ATTR_RE.search(anchor)
        if not href_match:
            continue
        href = unescape(href_match.group(2)).strip()
        title = clean_text(match.group(1))
        if not href or href.startswith(("javascript:", "mailto:", "#")):
            continue
        absolute = urljoin(source["url"], href)
        parsed = urlparse(absolute)
        if parsed.scheme != "https" or parsed.hostname not in source["allowed_hosts"]:
            continue
        combined = f"{title} {absolute}"
        if not KEYWORDS.search(combined):
            continue
        candidates.append({
            "source": source["name"],
            "title": title[:300] or "(title not exposed in link text)",
            "url": absolute,
            "review_status": "pending_source_review",
            "notes": "Candidate discovered by keyword matching; not yet confirmed to contain a case study.",
        })

    unique = {}
    for item in candidates:
        unique[item["url"]] = item
    return list(unique.values()), None


def main() -> int:
    all_candidates = []
    source_status = []
    for source in SOURCES:
        found, error = discover(source)
        all_candidates.extend(found)
        source_status.append({
            "source": source["name"],
            "index_url": source["url"],
            "candidate_links": len(found),
            "status": "ok" if error is None else "needs_attention",
            "error": error,
        })

    unique = {}
    for item in all_candidates:
        unique[item["url"]] = item

    payload = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "purpose": "Official-source publication discovery; not automated legal analysis or website publication.",
        "source_status": source_status,
        "candidate_count": len(unique),
        "candidates": sorted(unique.values(), key=lambda x: (x["source"], x["title"].lower())),
        "review_requirements": [
            "Open the original source and confirm the document is official and accessible.",
            "Record report date, page number, case identifier and exact source reference.",
            "Separate documented facts from editorial inference and assumptions.",
            "Verify jurisdiction and the version/date of any cited legal requirement.",
            "Check copyright, privacy, duplicate content and any anonymisation conditions.",
            "Obtain human approval before publishing a case or linking it to a decision-support tool.",
        ],
    }
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    return 0 if any(s["status"] == "ok" for s in source_status) else 1


if __name__ == "__main__":
    sys.exit(main())
