#!/usr/bin/env python3
"""Normalize shared-shell stylesheet cache URLs on assembled PayScale pages."""
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import re

LATEST_HREF = "/site-wide-shell.css?v=20261119-mobile-back-home-v5"
LINK_TAG_RE = re.compile(r"<link\b[^>]*>", re.IGNORECASE)
ATTR_RE = re.compile(r"\b([a-z_:][-a-z0-9_:.]*)\s*=\s*([\"'])(.*?)\2", re.IGNORECASE)
SHELL_SCRIPT_RE = re.compile(r"<script\b[^>]*\bsrc\s*=\s*([\"'])([^\"']*site-wide-shell\.js(?:\?[^\"']*)?)\1[^>]*>", re.IGNORECASE)


def attributes(tag: str) -> dict[str, str]:
    return {m.group(1).lower(): m.group(3) for m in ATTR_RE.finditer(tag)}


def is_shell_stylesheet(tag: str) -> bool:
    attrs = attributes(tag)
    rel = attrs.get("rel", "").lower().split()
    href = attrs.get("href", "")
    return "stylesheet" in rel and urlsplit(href).path.rstrip("/") == "/site-wide-shell.css"


def update_link(tag: str) -> str:
    href = re.search(r"\bhref\s*=\s*([\"'])(.*?)\1", tag, re.IGNORECASE)
    if not href:
        raise ValueError("Shell stylesheet link has no quoted href")
    tag = tag[:href.start()] + "href=" + href.group(1) + LATEST_HREF + href.group(1) + tag[href.end():]
    latest_attr = re.search(r"\bdata-rt-shell-latest\s*=\s*([\"'])(.*?)\1", tag, re.IGNORECASE)
    if latest_attr:
        tag = tag[:latest_attr.start()] + 'data-rt-shell-latest="true"' + tag[latest_attr.end():]
    else:
        closing = "/>" if tag.rstrip().endswith("/>") else ">"
        body = tag.rstrip()[:-2] if closing == "/>" else tag.rstrip()[:-1]
        tag = body.rstrip() + ' data-rt-shell-latest="true"' + closing
    return tag


def transform_html(html: str) -> str:
    if "</head>" not in html.lower() or "<body" not in html.lower():
        raise ValueError("PayScale HTML is missing head/body boundaries")
    if not SHELL_SCRIPT_RE.search(html):
        raise ValueError("PayScale HTML is missing the shared-shell script")
    tags = [m for m in LINK_TAG_RE.finditer(html) if is_shell_stylesheet(m.group(0))]
    if len(tags) != 1:
        raise ValueError(f"Expected exactly one shared-shell stylesheet link; found {len(tags)}")
    match = tags[0]
    updated_tag = update_link(match.group(0))
    updated = html[:match.start()] + updated_tag + html[match.end():]
    if updated.count(LATEST_HREF) != 1 or updated.count('data-rt-shell-latest="true"') != 1:
        raise ValueError("Normalized shell stylesheet markup is not unique")
    return updated


def self_test() -> None:
    synthetic = (
        '<!doctype html><html><head>'
        '<link rel="stylesheet" href="/site-wide-shell.css?v=20261017-v2" data-regtech-site-shell="true">'
        '<script src="/site-wide-shell.js?v=20261017-v2" defer></script>'
        '</head><body><main>synthetic</main></body></html>'
    )
    updated = transform_html(synthetic)
    assert LATEST_HREF in updated
    assert 'data-rt-shell-latest="true"' in updated
    assert 'data-regtech-site-shell="true"' in updated
    assert transform_html(updated) == updated, "Transformation must be idempotent"
    invalid_cases = (
        synthetic.replace("site-wide-shell.css?v=20261017-v2", "other.css"),
        synthetic.replace("</head>", '<link rel="stylesheet" href="/site-wide-shell.css?v=old"></head>'),
        synthetic.replace("/site-wide-shell.js?v=20261017-v2", "/unrelated.js"),
    )
    for bad in invalid_cases:
        try:
            transform_html(bad)
        except ValueError:
            pass
        else:
            raise AssertionError("Fail-closed synthetic test did not reject invalid input")
    print("PASS: PayScale shell stylesheet synthetic normalization, uniqueness, fail-closed and idempotency")


def transform_pages(page_dir: Path) -> None:
    for name in ("index.html", "pension.html"):
        page = page_dir / name
        if not page.is_file():
            raise SystemExit(f"Expected PayScale page missing: {page}")
        original = page.read_text(encoding="utf-8")
        transformed = transform_html(original)
        if transform_html(transformed) != transformed:
            raise SystemExit(f"Transformation is not idempotent: {page}")
        if transformed != original:
            page.write_text(transformed, encoding="utf-8")
        print(f"PASS: normalized shell stylesheet on {page}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--page-dir", type=Path)
    args = parser.parse_args()
    if args.self_test:
        self_test()
    if args.page_dir:
        transform_pages(args.page_dir)
    if not args.self_test and not args.page_dir:
        parser.error("Provide --self-test or --page-dir")
