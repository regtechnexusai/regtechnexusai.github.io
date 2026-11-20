#!/usr/bin/env python3
"""Fail-closed correction for PayScale third-party-service privacy disclosures."""
from pathlib import Path
import argparse
import tempfile

INDEX_OLD_UPSTREAM = (
    "এই static app-এর হিসাব browser-এ সম্পন্ন হয়। আপনার salary input এই app কোনো server-এ পাঠায় বা সংরক্ষণ করে না; "
    "analytics বা third-party script ব্যবহার করা হয়নি। “ফলাফল কপি করুন” কেবল আপনার device-এর clipboard-এ লেখা কপি করে। "
    "GitHub Pages-এর স্বাভাবিক web request আলাদা বিষয়।"
)
INDEX_OLD_LOCAL = (
    "এই static app-এর হিসাব browser-এই সম্পন্ন হয়। আপনার salary input এই app কোনো server-এ পাঠায় বা সংরক্ষণ করে না; "
    "analytics বা third-party script ব্যবহার করা হয়নি। “ফলাফল কপি করুন” কেবল আপনার device-এর clipboard-এ লেখা কপি করে। "
    "GitHub Pages-এর স্বাভাবিক web request আলাদা বিষয়।"
)
PRIVACY_OLD = (
    "এই static calculator-এর salary এবং pension input browser-এর JavaScript-এ locally process হয়। "
    "এই tool salary input কোনো backend database-এ পাঠায় বা সংরক্ষণ করে না এবং analytics বা third-party script ব্যবহার করে না।"
)
INDEX_DISCLOSURE = (
    "এই static app-এর salary input browser-এর JavaScript-এ locally process হয়; calculator code salary input RegTech Nexus AI-এর "
    "backend-এ পাঠায় বা সংরক্ষণ করে না। তবে PayScale পেজে Google Analytics 4 (GA4) ও Cloudflare Insights এবং calculator pages-এ "
    "Google Translate widget লোড হয়। এসব third-party service তাদের নিজস্ব নীতিমালা অনুযায়ী browsing, device ও interaction data "
    "প্রক্রিয়া করতে পারে। Third-party script উপস্থিত থাকায় confidential salary বা personal data না দেওয়াই ভালো। “ফলাফল কপি করুন” "
    "কেবল আপনার device-এর clipboard-এ লেখা কপি করে। GitHub Pages hosting-এর স্বাভাবিক web request আলাদা বিষয়।"
)
PRIVACY_DISCLOSURE = (
    "এই static calculator-এর salary ও pension input browser-এর JavaScript-এ locally process হয়; calculator code এগুলো RegTech Nexus AI-এর "
    "backend-এ পাঠায় বা সংরক্ষণ করে না। তবে PayScale pages-এ Google Analytics 4 (GA4) ও Cloudflare Insights এবং calculator pages-এ "
    "Google Translate widget লোড হয়। এসব third-party service তাদের নিজস্ব নীতিমালা অনুযায়ী browsing, device ও interaction data "
    "প্রক্রিয়া করতে পারে। Third-party script উপস্থিত থাকায় confidential salary/pension বা personal data না দেওয়াই ভালো।"
)
SPECS = {
    "index.html": ([INDEX_OLD_UPSTREAM, INDEX_OLD_LOCAL], INDEX_DISCLOSURE),
    "privacy.html": ([PRIVACY_OLD], PRIVACY_DISCLOSURE),
}

def transform_html(page_name: str, html: str) -> str:
    if page_name not in SPECS:
        raise ValueError(f"Unsupported PayScale disclosure target: {page_name}")
    old_texts, new_text = SPECS[page_name]
    old_hits = sum(html.count(old) for old in old_texts)
    new_hits = html.count(new_text)
    if new_hits == 1 and old_hits == 0:
        return html
    if new_hits != 0 or old_hits != 1:
        raise ValueError(f"Expected exactly one outdated or updated disclosure in {page_name}; old={old_hits}, new={new_hits}")
    old_text = next(old for old in old_texts if html.count(old) == 1)
    updated = html.replace(old_text, new_text, 1)
    if updated.count(new_text) != 1 or any(updated.count(old) for old in old_texts):
        raise ValueError(f"Disclosure replacement did not verify uniquely in {page_name}")
    return updated

def transform_pages(site_dir: Path) -> None:
    for name in SPECS:
        page = site_dir / name
        if not page.is_file():
            raise SystemExit(f"Expected PayScale disclosure page missing: {page}")
        original = page.read_text(encoding="utf-8")
        updated = transform_html(name, original)
        if transform_html(name, updated) != updated:
            raise SystemExit(f"Disclosure transformation is not idempotent: {page}")
        if updated != original:
            page.write_text(updated, encoding="utf-8")
        print(f"PASS: truthful third-party disclosure verified on {page}")

def self_test() -> None:
    for old_index in (INDEX_OLD_UPSTREAM, INDEX_OLD_LOCAL):
        synthetic = f"<section><p>{old_index}</p></section>"
        updated = transform_html("index.html", synthetic)
        assert INDEX_DISCLOSURE in updated
        assert transform_html("index.html", updated) == updated
    synthetic_privacy = f"<section><p>{PRIVACY_OLD}</p><p>Clipboard details preserved.</p></section>"
    updated_privacy = transform_html("privacy.html", synthetic_privacy)
    assert PRIVACY_DISCLOSURE in updated_privacy and "Clipboard details preserved." in updated_privacy
    assert transform_html("privacy.html", updated_privacy) == updated_privacy
    for name, invalid in (
        ("index.html", "<p>no expected disclosure</p>"),
        ("privacy.html", f"<p>{PRIVACY_OLD}</p><p>{PRIVACY_OLD}</p>"),
    ):
        try:
            transform_html(name, invalid)
        except ValueError:
            pass
        else:
            raise AssertionError(f"Fail-closed disclosure test did not reject {name}")
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        (root / "index.html").write_text(f"<p>{INDEX_OLD_UPSTREAM}</p>", encoding="utf-8")
        (root / "privacy.html").write_text(f"<p>{PRIVACY_OLD}</p>", encoding="utf-8")
        transform_pages(root)
        after_first = [(root / name).read_text(encoding="utf-8") for name in SPECS]
        transform_pages(root)
        after_second = [(root / name).read_text(encoding="utf-8") for name in SPECS]
        assert after_first == after_second
    print("PASS: PayScale disclosure self-test (exact replacement, fail-closed, preservation and idempotency)")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--site-dir", type=Path)
    args = parser.parse_args()
    if args.self_test:
        self_test()
    if args.site_dir:
        transform_pages(args.site_dir)
    if not args.self_test and not args.site_dir:
        parser.error("Provide --self-test or --site-dir")
