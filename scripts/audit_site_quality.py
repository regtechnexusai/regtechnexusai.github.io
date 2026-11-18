#!/usr/bin/env python3
"""Generate a dependency-free structural quality report for configured public pages.

This is a static smoke test, not a WCAG conformance audit or browser test.
"""
from __future__ import annotations

import argparse
import html
import json
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


class PageAudit(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.lang = ""
        self.viewport = 0
        self.titles = 0
        self.descriptions = 0
        self.robots = ""
        self.canonicals = 0
        self.h1_count = 0
        self.images_without_alt = 0
        self.unnamed_links = 0
        self.ids: Counter[str] = Counter()
        self._title_depth = 0
        self._title_text = []
        self._links: list[dict[str, object]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        a = dict(attrs)
        if tag == "html":
            self.lang = (a.get("lang") or "").strip()
        elif tag == "meta":
            name = (a.get("name") or "").lower()
            if name == "viewport":
                self.viewport += 1
            elif name == "description":
                self.descriptions += 1
            elif name == "robots":
                self.robots = (a.get("content") or "").lower()
        elif tag == "link" and "canonical" in (a.get("rel") or "").lower().split():
            self.canonicals += 1
        elif tag == "title":
            self.titles += 1
            self._title_depth += 1
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "img":
            if "alt" not in a:
                self.images_without_alt += 1
            elif self._links and (a.get("alt") or "").strip():
                self._links[-1]["text"] = str(self._links[-1]["text"]) + str(a.get("alt"))
        elif tag == "a":
            has_name = bool((a.get("aria-label") or "").strip() or (a.get("title") or "").strip())
            self._links.append({"named": has_name or bool(a.get("href") is None), "text": ""})
        if a.get("id"):
            self.ids[a["id"]] += 1

    def handle_endtag(self, tag: str) -> None:
        if tag == "title" and self._title_depth:
            self._title_depth -= 1
        elif tag == "a" and self._links:
            link = self._links.pop()
            if not link["named"] and not str(link["text"]).strip():
                self.unnamed_links += 1

    def handle_data(self, data: str) -> None:
        if self._title_depth:
            self._title_text.append(data)
        for link in self._links:
            link["text"] = str(link["text"]) + data


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site-dir", required=True, type=Path)
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    config = json.loads(args.config.read_text(encoding="utf-8"))
    records = config.get("pages", {})
    if not records:
        raise SystemExit("No configured pages found in SEO configuration.")

    rows: list[tuple[str, list[str]]] = []
    totals: Counter[str] = Counter()
    for relative in records:
        path = args.site_dir / relative
        if not path.is_file():
            raise SystemExit(f"Configured page missing from assembled site: {relative}")
        audit = PageAudit()
        audit.feed(path.read_text(encoding="utf-8"))
        issues = []
        checks = {
            "missing html lang": not audit.lang,
            "missing viewport": audit.viewport == 0,
            "duplicate viewport": audit.viewport > 1,
            "missing/duplicate title": audit.titles != 1,
            "missing/duplicate meta description": "noindex" not in audit.robots.split(",") and audit.descriptions != 1,
            "missing/duplicate canonical": audit.canonicals != 1,
            "missing/multiple h1": audit.h1_count != 1,
            "images without alt attribute": audit.images_without_alt > 0,
            "unnamed links": audit.unnamed_links > 0,
            "duplicate id attributes": any(count > 1 for count in audit.ids.values()),
        }
        for label, failed in checks.items():
            if failed:
                issues.append(label)
                totals[label] += 1
        rows.append((relative, issues))

    lines = [
        "# Static site quality smoke test",
        "",
        f"- Configured pages audited: **{len(rows)}**",
        f"- Pages with no detected structural warnings: **{sum(not issues for _, issues in rows)}**",
        f"- Pages with one or more warnings: **{sum(bool(issues) for _, issues in rows)}**",
        "",
        "| Configured page | Result | Findings |",
        "|---|---|---|",
    ]
    for page, issues in rows:
        lines.append(f"| `{page}` | {'Review' if issues else 'No warning'} | {html.escape('; '.join(issues) if issues else '—')} |")
    lines += [
        "",
        "## Finding counts",
        "",
        "| Finding | Pages affected |",
        "|---|---:|",
    ]
    if totals:
        for label, count in sorted(totals.items()):
            lines.append(f"| {label} | {count} |")
    else:
        lines.append("| No structural warnings detected | 0 |")
    lines += [
        "",
        "> Scope limitation: this dependency-free HTML scan is a structural smoke test only. It does not establish WCAG conformance, keyboard usability, colour contrast, screen-reader behaviour, Core Web Vitals, runtime link availability, security posture or production response headers. Those require browser-based and live-endpoint testing.",
        "",
    ]
    report = "\n".join(lines)
    print(report)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(report, encoding="utf-8")
    return 0


if __name__ == "__main__":
    main()
