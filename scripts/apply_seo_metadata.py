#!/usr/bin/env python3
"""Apply and validate seo-config.json metadata in a static HTML site."""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse

TAG_RE = re.compile(r"<meta\b[^>]*>", re.I)
ATTR_RE = re.compile(r"""([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))""", re.I)
TITLE_RE = re.compile(r"<title\b[^>]*>.*?</title\s*>", re.I | re.S)
HEAD_CLOSE_RE = re.compile(r"</head\s*>", re.I)
CANONICAL_RE = re.compile(r"<link\b(?=[^>]*\brel\s*=\s*(['\"])canonical\1)[^>]*>", re.I)

def attrs(tag: str) -> dict[str, str]:
    return {m.group(1).lower(): next(v for v in m.groups()[1:] if v is not None) for m in ATTR_RE.finditer(tag)}

def meta_key(tag: str) -> tuple[str, str] | None:
    a = attrs(tag)
    if "name" in a:
        return ("name", a["name"].lower())
    if "property" in a:
        return ("property", a["property"].lower())
    return None

def replace_meta(document: str, desired: dict[tuple[str, str], str]) -> str:
    seen: set[tuple[str, str]] = set()
    def repl(match: re.Match[str]) -> str:
        tag = match.group(0)
        key = meta_key(tag)
        if key not in desired:
            return tag
        if key in seen:
            return ""
        seen.add(key)
        kind, name = key
        return f'<meta {kind}="{html.escape(name, quote=True)}" content="{html.escape(desired[key], quote=True)}">'
    document = TAG_RE.sub(repl, document)
    missing = []
    for (kind, name), value in desired.items():
        if (kind, name) not in seen:
            missing.append(f'<meta {kind}="{html.escape(name, quote=True)}" content="{html.escape(value, quote=True)}">')
    if missing:
        close = HEAD_CLOSE_RE.search(document)
        if not close:
            raise ValueError("HTML document has no closing </head> tag")
        document = document[:close.start()] + "\n" + "\n".join(missing) + "\n" + document[close.start():]
    return document

def apply_page(path: Path, record: dict, site: dict, check: bool) -> list[str]:
    original = path.read_text(encoding="utf-8")
    updated = original
    title = record.get("title")
    if title:
        title_tag = f"<title>{html.escape(title)}</title>"
        if TITLE_RE.search(updated):
            first = True
            def title_replacer(_: re.Match[str]) -> str:
                nonlocal first
                if first:
                    first = False
                    return title_tag
                return ""
            updated = TITLE_RE.sub(title_replacer, updated)
        else:
            close = HEAD_CLOSE_RE.search(updated)
            if not close:
                raise ValueError(f"{path}: missing </head>")
            updated = updated[:close.start()] + title_tag + "\n" + updated[close.start():]

    desired: dict[tuple[str, str], str] = {}
    description = record.get("description")
    canonical = record.get("canonical")
    robots = record.get("robots")
    if description:
        desired[("name", "description")] = description
    if canonical:
        parsed = urlparse(canonical)
        if parsed.scheme != "https" or not parsed.netloc:
            raise ValueError(f"{path}: canonical must be an absolute HTTPS URL: {canonical}")
        desired[("property", "og:url")] = canonical
        desired[("name", "twitter:card")] = "summary_large_image"
        desired[("name", "twitter:image")] = site.get("logo", "")
        desired[("property", "og:image")] = site.get("logo", "")
    if robots:
        desired[("name", "robots")] = robots
    if title:
        desired[("property", "og:title")] = title
        desired[("name", "twitter:title")] = title
    if description:
        desired[("property", "og:description")] = description
        desired[("name", "twitter:description")] = description
    if site.get("name") and (title or description):
        desired[("property", "og:site_name")] = site["name"]
        desired[("property", "og:type")] = "website"

    if desired:
        updated = replace_meta(updated, desired)

    # Canonical links are handled separately from meta tags.
    if canonical:
        canonical_tag = f'<link rel="canonical" href="{html.escape(canonical, quote=True)}">'
        matches = list(CANONICAL_RE.finditer(updated))
        if matches:
            first = matches[0]
            updated = updated[:first.start()] + canonical_tag + updated[first.end():]
            updated = CANONICAL_RE.sub("", updated)
            # The first replacement was removed by the duplicate cleanup above; insert exactly one.
            close = HEAD_CLOSE_RE.search(updated)
            updated = updated[:close.start()] + canonical_tag + "\n" + updated[close.start():]
        else:
            close = HEAD_CLOSE_RE.search(updated)
            if not close:
                raise ValueError(f"{path}: missing </head>")
            updated = updated[:close.start()] + canonical_tag + "\n" + updated[close.start():]

    if check:
        problems = []
        if title:
            titles = TITLE_RE.findall(original)
            actual_title = html.unescape(re.sub(r"<[^>]+>", "", titles[0])).strip() if titles else ""
            if len(titles) != 1 or actual_title != title:
                problems.append("title")
        for key, expected in desired.items():
            found = [attrs(tag).get("content", "") for tag in TAG_RE.findall(original) if meta_key(tag) == key]
            if len(found) != 1 or html.unescape(found[0]) != expected:
                problems.append(f"{key[0]}:{key[1]}")
        if canonical:
            links = [attrs(match.group(0)).get("href", "") for match in CANONICAL_RE.finditer(original)]
            if len(links) != 1 or html.unescape(links[0]) != canonical:
                problems.append("canonical")
        if problems:
            raise ValueError(f"{path}: metadata does not match seo-config.json: {', '.join(problems)}")
    elif updated != original:
        path.write_text(updated, encoding="utf-8")
    return [str(path)]

def validate_sitemap(site_dir: Path) -> None:
    sitemap = site_dir / "sitemap.xml"
    if not sitemap.exists():
        return
    root = ET.parse(sitemap).getroot()
    locs = [el.text.strip() for el in root.iter() if el.tag.endswith("loc") and el.text]
    if len(locs) != len(set(locs)):
        raise ValueError("sitemap.xml contains duplicate <loc> URLs")

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--site-dir", required=True, type=Path)
    parser.add_argument("--config", required=True, type=Path)
    parser.add_argument("--check", action="store_true", help="validate without writing")
    args = parser.parse_args()
    config = json.loads(args.config.read_text(encoding="utf-8"))
    site = config.get("site", {})
    pages = config.get("pages", {})
    if not pages:
        raise ValueError("seo-config.json contains no page records")
    touched = []
    for relative, record in pages.items():
        path = args.site_dir / relative
        if not path.is_file():
            raise ValueError(f"SEO page is missing from site build: {relative}")
        touched.extend(apply_page(path, record, site, args.check))
    validate_sitemap(args.site_dir)
    action = "Validated" if args.check else "Applied"
    print(f"{action} SEO metadata for {len(touched)} configured pages.")
    return 0

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"SEO metadata validation failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
