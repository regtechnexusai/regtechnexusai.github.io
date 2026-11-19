#!/usr/bin/env python3
"""Guard the homepage LCP illustration against filter regressions."""
from html.parser import HTMLParser
import re
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "styles.css").read_text(encoding="utf-8")
svg = (ROOT / "assets/regulatory-intelligence-visual.svg").read_text(encoding="utf-8")

class ImageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
    def handle_starttag(self, tag, attrs):
        if tag.lower() == "img":
            self.images.append(dict(attrs))

parser = ImageParser()
parser.feed(html)
matches = [item for item in parser.images if item.get("src") == "assets/regulatory-intelligence-visual.svg"]
if len(matches) != 1:
    sys.exit("Expected exactly one homepage hero LCP image; found %d" % len(matches))
hero = matches[0]
expected = {"width": "900", "height": "620", "loading": "eager", "fetchpriority": "high"}
for key, value in expected.items():
    if hero.get(key) != value:
        sys.exit("Homepage LCP image %s must remain %s; found %r" % (key, value, hero.get(key)))

if "assets/regulatory-intelligence-visual.svg" not in html or "preload" not in html or "fetchpriority" not in html:
    sys.exit("Homepage LCP SVG must retain its high-priority image preload")

if "<filter" in svg.lower() or "filter=" in svg.lower():
    sys.exit("Homepage LCP SVG must not reintroduce SVG filter effects")

selector = "body.homepage-redesign .hero-visual img"
pos = css.find(selector)
if pos < 0:
    sys.exit("Homepage hero image CSS rule was not found")
rule = css[pos:css.find("}", pos)]
if "filter:" in rule.lower() and "filter:none!important" not in rule.lower():
    sys.exit("Homepage hero image CSS must not apply a filter effect")


logo_webp_sources = html.count('srcset="regtech-nexus-ai-logo-2026.webp"')
logo_png_fallbacks = html.count('src="regtech-nexus-ai-logo-2026.png"')
if logo_webp_sources != 2 or logo_png_fallbacks != 2:
    sys.exit("Homepage must retain two WebP logo sources and two PNG fallbacks")

# Keep the Cloudflare Web Analytics beacon narrowly allowlisted. The existing
# connect-src 'self' permits automatic-injection RUM posts to /cdn-cgi/rum.
if "https://static.cloudflareinsights.com" not in html:
    sys.exit("Homepage CSP must allow the Cloudflare Web Analytics beacon origin")
if "https://static.cloudflareinsights.com/beacon.min.js" in html:
    sys.exit("Homepage CSP must not restrict the versioned Cloudflare beacon to an incomplete script path")
if "connect-src 'self'" not in html:
    sys.exit("Homepage CSP must retain same-origin connection permission for automatic Cloudflare RUM")


# MD/CEO header and footer reuse the build-generated 460px WebP logo while retaining PNG fallback.
mdceo_html = (ROOT / "md-ceo-performance-calculator/index.html").read_text(encoding="utf-8")
mdceo_pictures = re.findall(r"<picture\b[^>]*>.*?</picture>", mdceo_html, flags=re.I | re.S)
if len(mdceo_pictures) != 2 or any('srcset="../regtech-nexus-ai-logo-2026.webp"' not in block or 'type="image/webp"' not in block or 'src="../regtech-nexus-ai-logo-2026.png"' not in block for block in mdceo_pictures):
    sys.exit("MD/CEO header and footer must use generated WebP sources with PNG fallbacks")

print("PASS: homepage LCP, generated WebP logo sources and Cloudflare Web Analytics CSP checks passed.")
