#!/usr/bin/env python3
"""Use the build-generated WebP logo with a PNG fallback on PayScale footer pages.

The source pages are assembled from a pinned upstream repository during deployment.
This transform is deliberately exact and fail-closed so source drift is reviewed.
"""
from pathlib import Path
import argparse

PNG_IMG = '<img src="/regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI" width="230" height="70">'
PICTURE = '<picture><source srcset="/regtech-nexus-ai-logo-2026.webp" type="image/webp"><img src="/regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI" width="230" height="70" loading="lazy" decoding="async"></picture>'
PAGES = ("payscale-2026/index.html", "payscale-2026/pension.html")
MAX_WEBP_BYTES = 120_000


def validate_picture(content: str) -> None:
    if content.count(PICTURE) != 1 or PNG_IMG in content:
        raise ValueError("Expected exactly one optimized footer picture with PNG fallback")
    marker = '<div class="rt-shell-footer-brand">'
    start = content.find(marker)
    end = content.find("</div>", start) if start >= 0 else -1
    if start < 0 or end < 0 or PICTURE not in content[start:end]:
        raise ValueError("Optimized logo picture is not inside the footer brand container")


def transform(content: str) -> str:
    if content.count(PICTURE) == 1 and PNG_IMG not in content:
        validate_picture(content)
        return content
    if content.count(PNG_IMG) != 1 or content.count(PICTURE) != 0:
        raise ValueError("Expected exactly one unoptimized PayScale footer logo, or one valid optimized picture")
    marker = '<div class="rt-shell-footer-brand">'
    start = content.find(marker)
    end = content.find("</div>", start) if start >= 0 else -1
    if start < 0 or end < 0 or PNG_IMG not in content[start:end]:
        raise ValueError("Expected logo image was not found inside the footer brand container")
    result = content.replace(PNG_IMG, PICTURE, 1)
    validate_picture(result)
    return result


def apply(site_dir: Path) -> None:
    webp = site_dir / "regtech-nexus-ai-logo-2026.webp"
    if not webp.is_file():
        raise SystemExit("Generated WebP logo is missing; refusing to rewrite PayScale pages")
    if webp.stat().st_size > MAX_WEBP_BYTES:
        raise SystemExit(f"Generated WebP logo exceeds {MAX_WEBP_BYTES} bytes: {webp.stat().st_size}")
    for rel in PAGES:
        page = site_dir / rel
        if not page.is_file():
            raise SystemExit(f"Expected PayScale page missing: {page}")
        before = page.read_text(encoding="utf-8")
        after = transform(before)
        if after != before:
            page.write_text(after, encoding="utf-8")
        validate_picture(after)
        print(f"PASS: WebP footer logo with PNG fallback on {page.relative_to(site_dir)}")


def self_test() -> None:
    fixture = '<!doctype html><footer><div class="rt-shell-footer-brand"><a href="/" aria-label="RegTech Nexus AI home">' + PNG_IMG + '</a><p>Footer text</p></div></footer>'
    optimized = transform(fixture)
    validate_picture(optimized)
    assert 'loading="lazy"' in optimized and 'decoding="async"' in optimized
    assert transform(optimized) == optimized, "Transform must be idempotent"
    for bad in (
        '<footer><div class="rt-shell-footer-brand">no image</div></footer>',
        '<footer><div class="rt-shell-footer-brand">' + PNG_IMG + PNG_IMG + '</div></footer>',
        '<footer>' + PNG_IMG + '</footer>',
    ):
        try:
            transform(bad)
        except ValueError:
            pass
        else:
            raise AssertionError("Malformed or duplicate source logo must fail closed")
    print("PASS: synthetic footer transform, WebP source, PNG fallback, lazy-load, idempotency and fail-closed checks")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--site-dir", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
    if args.site_dir:
        apply(args.site_dir)
    if not args.self_test and not args.site_dir:
        parser.error("Provide --self-test or --site-dir")
