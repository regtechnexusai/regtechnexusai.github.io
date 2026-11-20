#!/usr/bin/env python3
"""Report-only static regression checks for RegTech Nexus AI GitHub Pages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import argparse, datetime, json, re, sys
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
ROOT=Path(__file__).resolve().parents[2]
CRITICAL=["index.html","alfiq/index.html","alfiq/services/index.html","creations/index.html","tool-assurance/index.html","regulatory-source-register/index.html","bank-use-review.html","regulatory-gap-analyzer/index.html","icms-2026/index.html","international-regulatory-calculators.html","payscale-2026/index.html","md-ceo-performance-calculator/index.html","explainable-ai.html","derivatives/index.html","engagement-policy/index.html","trust/index.html","vendor-due-diligence/index.html"]
class Parser(HTMLParser):
 def __init__(self):
  super().__init__(convert_charrefs=True); self.ids=[]; self.links=[]; self.in_title=False; self.title_text=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if "id" in a:self.ids.append(a["id"])
  if tag in ("a","link") and "href" in a:self.links.append(("href",a["href"]))
  if tag in ("img","script","source","iframe") and "src" in a:self.links.append(("src",a["src"]))
  if tag=="title":self.in_title=True
 def handle_endtag(self,tag):
  if tag=="title":self.in_title=False
 def handle_data(self,data):
  if self.in_title and data.strip():self.title_text=True
findings=[]; checked=[]
def add(sev,path,detail):findings.append((sev,path,detail))
def target_for(source,raw):
 u=urlsplit(raw.strip())
 if u.scheme or u.netloc or raw.startswith(("#","mailto:","tel:","data:","javascript:")):return None,u.fragment
 path=unquote(u.path)
 if not path:return source,u.fragment
 p=(ROOT/path.lstrip("/")) if path.startswith("/") else ((ROOT/source).parent/path)
 try:rel=p.resolve().relative_to(ROOT.resolve()).as_posix()
 except ValueError:return None,u.fragment
 if p.is_dir() or path.endswith("/"):rel=rel.rstrip("/")+"/index.html"
 elif not p.suffix and (p/"index.html").is_file():rel=(p/"index.html").resolve().relative_to(ROOT.resolve()).as_posix()
 return rel,u.fragment
for rel in CRITICAL:
 p=ROOT/rel
 if not p.is_file():add("HIGH",rel,"Required critical page missing from repository.");continue
 content=p.read_text(encoding="utf-8",errors="replace"); parser=Parser()
 try:parser.feed(content)
 except Exception as exc:add("MEDIUM",rel,"HTML parser exception: "+str(exc))
 checked.append(rel)
 if not parser.title_text:add("MEDIUM",rel,"Missing or empty title.")
 if 'name="viewport"' not in content.lower():add("MEDIUM",rel,"Missing viewport metadata.")
 if 'rel="canonical"' not in content.lower():add("LOW",rel,"Canonical link metadata not found.")
 for dup in sorted({x for x in parser.ids if parser.ids.count(x)>1}):add("MEDIUM",rel,"Duplicate id: "+dup)
 for kind,raw in parser.links:
  raw=(raw or "").strip()
  if not raw or raw=="#":add("LOW",rel,"Empty/placeholder "+kind+" attribute.");continue
  if re.match(r"^(#|mailto:|tel:|data:|javascript:)",raw,re.I):continue
  target,fragment=target_for(rel,raw)
  if target is None:continue
  dest=ROOT/target
  if not dest.is_file():
   if target == "tradeguard/index.html":
    continue  # TradeGuard is routed live but not represented as a file in this repository; smoke-test public URL below.
   add("HIGH" if raw.startswith("/") else "MEDIUM",rel,"Local "+kind+" target not found: "+raw+" (resolved as "+target+")");continue
  if target == "global-financial-systems.html" and fragment in ("singapore","dubai","australia"):
   continue  # These are hash-driven JavaScript panel routes, not static HTML IDs.
  if fragment and dest.suffix.lower() in (".html",".htm"):
   other=Parser()
   try:other.feed(dest.read_text(encoding="utf-8",errors="replace"))
   except Exception:pass
   if fragment not in other.ids:add("MEDIUM",rel,"Fragment target not found: "+raw)
# MUKUL favicon: avoid implicit /favicon.ico request and its observed 404.
mukul_favicon_page=ROOT/"mukul"/"index.html"
if not mukul_favicon_page.is_file():
 add("HIGH","mukul/index.html","MUKUL page missing; favicon cannot be verified.")
else:
 mukul_favicon_source=mukul_favicon_page.read_text(encoding="utf-8",errors="replace")
 expected_mukul_favicon='<link rel="icon" type="image/png" href="/regtech-nexus-ai-favicon-128.png">'
 if expected_mukul_favicon not in mukul_favicon_source:
  add("MEDIUM","mukul/index.html","MUKUL should explicitly reference the generated optimized site favicon to prevent implicit /favicon.ico requests.")

# Shared-header logo optimization: require WebP with PNG fallback in both injection branches.
shell_source=""
workflow_source=""
shell_script=ROOT/"site-wide-shell.js"
if not shell_script.is_file():
 add("HIGH","site-wide-shell.js","Shared site-shell script missing; optimized header logo cannot be verified.")
else:
 shell_source=shell_script.read_text(encoding="utf-8",errors="replace")
 expected_picture='<picture><source srcset="/regtech-nexus-ai-logo-2026.webp" type="image/webp"><img class="brand-logo" src="/regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI" width="190" height="62"></picture>'
 if shell_source.count(expected_picture)!=2:
  add("HIGH","site-wide-shell.js","Both shared-header insertion branches must use the generated WebP source and PNG fallback.")
 deploy_workflow=ROOT/".github/workflows/deploy-pages.yml"
 workflow_source=deploy_workflow.read_text(encoding="utf-8",errors="replace") if deploy_workflow.is_file() else ""
 if "site/regtech-nexus-ai-logo-2026.webp" not in workflow_source or "resize({ width: 460" not in workflow_source or "bytes > 120000" not in workflow_source:
  add("HIGH",".github/workflows/deploy-pages.yml","The shared-header WebP must be generated, resized and size-gated during Pages assembly.")

# PayScale shared-shell stylesheet: avoid a runtime cache-version rewrite and duplicate CSS fetch.
payscale_shell_css_script=ROOT/".github/scripts/payscale_shell_css.py"
if not payscale_shell_css_script.is_file():
 add("HIGH",".github/scripts/payscale_shell_css.py","PayScale shell stylesheet normalizer is missing.")
else:
 payscale_shell_css_source=payscale_shell_css_script.read_text(encoding="utf-8",errors="replace")
 for token in (
  'LATEST_HREF = "/site-wide-shell.css?v=20261119-mobile-back-home-v5"',
  'def transform_html(html: str)',
  'def self_test()',
  'transform_html(updated) == updated',
  'Expected exactly one shared-shell stylesheet link',
 ):
  if token not in payscale_shell_css_source:
   add("HIGH",".github/scripts/payscale_shell_css.py","Shell stylesheet normalizer missing required fail-closed or idempotency guard: "+token)
 if "payscale_shell_css.py --self-test" not in workflow_source or "payscale_shell_css.py --page-dir site/payscale-2026" not in workflow_source:
  add("HIGH",".github/workflows/deploy-pages.yml","Pages assembly must test and normalize both PayScale shell stylesheet links.")
 if 'href="/site-wide-shell.css?v=20261119-mobile-back-home-v5"' not in workflow_source or 'data-rt-shell-latest="true"' not in workflow_source:
  add("HIGH",".github/workflows/deploy-pages.yml","Shared-shell stylesheet injection must use the latest cache URL and mark it current.")
 if "20261119-mobile-back-home-v5" not in shell_source:
  add("HIGH","site-wide-shell.js","Shared-shell stylesheet cache version is out of sync with Pages assembly.")
 static_workflow=ROOT/".github/workflows/regulatory-source-regression.yml"
 static_workflow_source=static_workflow.read_text(encoding="utf-8",errors="replace") if static_workflow.is_file() else ""
 if "payscale_shell_css.py --self-test" not in static_workflow_source or "payscale_shell_css.py --page-dir payscale-source" not in static_workflow_source:
  add("HIGH",".github/workflows/regulatory-source-regression.yml","PR static CI must self-test the shell stylesheet transform and run it against the pinned PayScale source.")

# AlfiQ GaaS logo: generate a bounded WebP while preserving transparent PNG source.
gaas_logo_optimizer=ROOT/".github/scripts/gaas_logo_webp.js"
if not gaas_logo_optimizer.is_file():
 add("HIGH",".github/scripts/gaas_logo_webp.js","GaaS logo WebP optimizer missing; source-image delivery cannot be verified.")
else:
 gaas_logo_source=gaas_logo_optimizer.read_text(encoding="utf-8",errors="replace")
 for token in (
  'const SOURCE_REL = "gaas/alfiq-gaas-logo.png";',
  'const OUTPUT_REL = "gaas/alfiq-gaas-logo.webp";',
  'const SOURCE_WIDTH = 2172;',
  'const SOURCE_HEIGHT = 724;',
  'const OUTPUT_WIDTH = 460;',
  'const OUTPUT_HEIGHT = 153;',
  'const MAX_BYTES = 120000;',
  '.webp({ quality: 90, effort: 5, alphaQuality: 100 })',
  'async function selfTest()',
  'Buffer.compare(fs.readFileSync(firstPath), fs.readFileSync(secondPath))',
 ):
  if token not in gaas_logo_source:
   add("HIGH",".github/scripts/gaas_logo_webp.js","GaaS logo optimizer missing a required dimension, alpha, size or deterministic self-test guard: "+token)
 gaas_workflow=ROOT/".github/workflows/deploy-pages.yml"
 gaas_workflow_source=gaas_workflow.read_text(encoding="utf-8",errors="replace") if gaas_workflow.is_file() else ""
 if "gaas_logo_webp.js --self-test" not in gaas_workflow_source or "gaas_logo_webp.js --site-dir site" not in gaas_workflow_source:
  add("HIGH",".github/workflows/deploy-pages.yml","Pages assembly must run the GaaS logo synthetic test and size-gated WebP generation.")

# Require optimized logo source and original PNG fallback on the affected audited pages.
optimized_logo_pages={
 "gaas/index.html":('srcset="alfiq-gaas-logo.webp"','src="alfiq-gaas-logo.png"',2),
 "icms-2026/index.html":('srcset="../regtech-nexus-ai-logo-2026.webp"','src="../regtech-nexus-ai-logo-2026.png"',2),
 "regulatory-gap-analyzer/index.html":('srcset="../regtech-nexus-ai-logo-2026.webp"','src="../regtech-nexus-ai-logo-2026.png"',2),
 "trust/index.html":('srcset="/regtech-nexus-ai-logo-2026.webp"','src="/regtech-nexus-ai-logo-2026.png"',1),
}
for rel,(source,fallback,count) in optimized_logo_pages.items():
 page=ROOT/rel
 if not page.is_file():
  add("HIGH",rel,"Audited page missing; optimized logo delivery cannot be verified.")
  continue
 content=page.read_text(encoding="utf-8",errors="replace")
 pictures=re.findall(r"<picture\b[^>]*>.*?</picture>",content,flags=re.I|re.S)
 if len(pictures)!=count or any(source not in picture or fallback not in picture for picture in pictures):
  add("HIGH",rel,"Expected "+str(count)+" WebP logo picture(s) with original PNG fallback.")
 if count==2 and rel in ("gaas/index.html","icms-2026/index.html","regulatory-gap-analyzer/index.html"):
  if 'loading="lazy"' not in pictures[1] or 'decoding="async"' not in pictures[1]:
   add("MEDIUM",rel,"Footer logo should remain lazy-loaded and asynchronously decoded.")
# Shared shell footer: use generated WebP, retain original PNG and lazy/async attributes.
expected_shell_footer_picture='<picture><source srcset="/regtech-nexus-ai-logo-2026.webp" type="image/webp"><img src="/regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI" loading="lazy" decoding="async" width="230" height="70"></picture>'
shell_footer_script=ROOT/"site-wide-shell.js"
shell_footer_source=shell_footer_script.read_text(encoding="utf-8",errors="replace") if shell_footer_script.is_file() else ""
if shell_footer_source.count(expected_shell_footer_picture)!=1:
 add("HIGH","site-wide-shell.js","Standard injected footer must use the generated WebP source with PNG fallback and preserve lazy/async/dimensions.")

# PayScale favicon: preserve source artwork while generating a small PNG favicon in Pages assembly.
payscale_favicon_script=ROOT/".github/scripts/payscale_favicon.js"
if not payscale_favicon_script.is_file():
 add("HIGH",".github/scripts/payscale_favicon.js","PayScale favicon optimizer missing; source-size reduction cannot be verified.")
else:
 payscale_favicon_source=payscale_favicon_script.read_text(encoding="utf-8",errors="replace")
 for token in (
  'const SOURCE_REL = "payscale-2026/regtech-nexus-ai-logo.png";',
  'const OUTPUT_REL = "payscale-2026/regtech-nexus-ai-favicon-128.png";',
  'const SOURCE_WIDTH = 1536;',
  'const SOURCE_HEIGHT = 1536;',
  'const OUTPUT_WIDTH = 128;',
  'outputMeta.height !== OUTPUT_WIDTH',
  'metadata.height !== OUTPUT_WIDTH',
  'const MAX_BYTES = 30000;',
  'const ORIGINAL_LINK = \'<link rel="icon" href="regtech-nexus-ai-logo.png" type="image/png" />\';',
  'const OPTIMIZED_LINK = \'<link rel="icon" href="regtech-nexus-ai-favicon-128.png" type="image/png" />\';',
  'function transformHtml(content)',
  'async function generateFavicon(source, output)',
  'transformHtml(optimized) !== optimized',
  'payscale-2026/index.html',
  'payscale-2026/pension.html',
 ):
  if token not in payscale_favicon_source:
   add("HIGH",".github/scripts/payscale_favicon.js","PayScale favicon optimizer missing a required fail-closed, dimension, size or idempotency safeguard: "+token)
 if "payscale_favicon.js --self-test" not in workflow_source or "payscale_favicon.js --site-dir site" not in workflow_source:
  add("HIGH",".github/workflows/deploy-pages.yml","Pages assembly must run the PayScale favicon synthetic test and source transformation.")


# Site-wide favicon optimization: pin square source, bounded 128px output and fail-closed coverage.
site_favicon_optimizer=ROOT/".github/scripts/site_favicon.js"
if not site_favicon_optimizer.is_file():
 add("HIGH",".github/scripts/site_favicon.js","Site-wide favicon optimizer missing; source-icon delivery cannot be verified.")
else:
 site_favicon_source=site_favicon_optimizer.read_text(encoding="utf-8",errors="replace")
 for token in (
  'const SOURCE_REL = "regtech-nexus-ai-logo.jpg";',
  'const OUTPUT_REL = "regtech-nexus-ai-favicon-128.png";',
  'const SOURCE_SHA256 = "585d3257e430d657851afebbc151f8ec9f2855eef9b5da00a553fb67977c0971";',
  'const SOURCE_WIDTH = 1536;',
  'const SOURCE_HEIGHT = 1536;',
  'const OUTPUT_WIDTH = 128;',
  'const MAX_BYTES = 30000;',
  'const OUTPUT_HREF = "/regtech-nexus-ai-favicon-128.png";',
  'const TARGET_SOURCE_PATHS = new Set([',
  'const REQUIRED_PAGES = [',
  'function transformHtml(content, pageRel, siteDir)',
  'async function generateFavicon(source, output)',
  'function walkHtmlFiles(siteDir)',
  'Buffer.compare(fs.readFileSync(first), fs.readFileSync(second))',
  'async function selfTest()',
 ):
  if token not in site_favicon_source:
   add("HIGH",".github/scripts/site_favicon.js","Site favicon optimizer missing a required source, dimension, size, coverage or deterministic self-test guard: "+token)
 for rel in (
  "index.html",
  "icms-2026/index.html",
  "md-ceo-performance-calculator/index.html",
  "regulatory-gap-analyzer/index.html",
  "trust/index.html",
  "gaas/index.html",
  "global-financial-systems.html",
  "explainable-ai.html",
  "payscale-2026/terms.html",
  "payscale-2026/methodology.html",
  "payscale-2026/about.html",
  "payscale-2026/changelog.html",
  "payscale-2026/privacy.html",
 ):
  if rel not in site_favicon_source:
   add("HIGH",".github/scripts/site_favicon.js","Required audited or branded favicon page missing from transform coverage: "+rel)
 if "site_favicon.js --self-test" not in workflow_source or "site_favicon.js --site-dir site" not in workflow_source:
  add("HIGH",".github/workflows/deploy-pages.yml","Pages assembly must run the site favicon synthetic tests and transformation.")


# PR-time synthetic and clean-archive test for site-wide favicon generation.
site_favicon_ci=ROOT/".github/workflows/site-favicon-regression.yml"
if not site_favicon_ci.is_file():
 add("HIGH",".github/workflows/site-favicon-regression.yml","Site favicon optimizer must have a PR-time synthetic and real-source test workflow.")
else:
 site_favicon_ci_source=site_favicon_ci.read_text(encoding="utf-8",errors="replace")
 for token in (
  "site_favicon.js --self-test",
  "git archive HEAD",
  "site-favicon-test-site",
  "site_favicon.js",
  "sharp@0.34.5",
  "regtech-nexus-ai-favicon-128.png",
 ):
  if token not in site_favicon_ci_source:
   add("HIGH",".github/workflows/site-favicon-regression.yml","Site favicon PR workflow missing a required test step or output gate: "+token)


# AlfiQ landing page canonical URL: verify the exact sitemap-backed canonical.
alfiq_home=ROOT/"alfiq"/"index.html"
if not alfiq_home.is_file():
 add("HIGH","alfiq/index.html","AlfiQ landing page missing; canonical URL cannot be verified.")
else:
 alfiq_home_source=alfiq_home.read_text(encoding="utf-8",errors="replace")
 canonical_url="https://regtechnexusai.com/alfiq/"
 if 'rel="canonical"' not in alfiq_home_source or canonical_url not in alfiq_home_source:
  add("MEDIUM","alfiq/index.html","Canonical URL should match the sitemap entry: "+canonical_url)

# AlfiQ services page: keep the shared picture source and fallback on the product logo.
alfiq_services=ROOT/"alfiq/services/index.html"
if not alfiq_services.is_file():
 add("HIGH","alfiq/services/index.html","AlfiQ services page missing; page-specific header brand override cannot be verified.")
else:
 alfiq_services_source=alfiq_services.read_text(encoding="utf-8",errors="replace")
 for token in (
  'logo.closest("picture")',
  'picture.querySelector("source")',
  'source.setAttribute("srcset","/alfiq/alfiq-logo-photo2.jpg")',
  'source.setAttribute("type","image/jpeg")',
  'logo.src="/alfiq/alfiq-logo-photo2.jpg"',
  'logo.alt="AlfiQ"',
 ):
  if token not in alfiq_services_source:
   add("HIGH","alfiq/services/index.html","AlfiQ page must synchronize the picture source with its fallback logo: "+token)

# Institutional governance pages: verify required disclosures and working page structure.
institutional_pages={
 "engagement-policy/index.html":("Institutional Engagement &amp; Operational Governance Policy",("No physical founder access is offered","supervisory-confidential information")),
 "trust/index.html":("Trust &amp; Verification Centre",("/regulatory-source-register/","/tool-assurance/","zero-knowledge processing")),
 "vendor-due-diligence/index.html":("Vendor Due Diligence (VDD)",("mailto:regtechnexusai@gmail.com","No file upload is provided","No password-protected dashboard")),
}
for rel,(heading,required) in institutional_pages.items():
 page=ROOT/rel
 if not page.is_file():
  add("HIGH",rel,"Institutional governance page missing.")
  continue
 content=page.read_text(encoding="utf-8",errors="replace")
 for token in (heading,'/institutional-trust.css','/site-wide-shell.js','rel="canonical"'):
  if token not in content:add("HIGH",rel,"Required page element missing: "+token)
 for token in required:
  if token not in content:add("HIGH",rel,"Required governance disclosure or link missing: "+token)
 if rel=="vendor-due-diligence/index.html":
  if 'type="file"' in content.lower() or "type='file'" in content.lower():
   add("HIGH",rel,"Public VDD page must not expose a file-upload control.")
  if "YOUR_FORM_ID" in content or "formspree.io/f/" in content:
   add("HIGH",rel,"Placeholder or unconfigured form endpoint must not be published.")

# Portfolio-specific structural checks: validate the current five published projects.
# Keep this list explicit so adding/removing a project requires an intentional test update.
portfolio_path=ROOT/"creations"/"index.html"
if portfolio_path.exists():
 portfolio=portfolio_path.read_text(encoding="utf-8",errors="replace")
 cards=portfolio.count('class="creation-card"')
 expected_projects={
  'href="/"':"RegTech Nexus AI",
  'href="/mukul/"':"MUKUL Agriculture Hub",
  'href="https://traveltoknow.com.bd/"':"Travel To Know",
  'href="/gaas/"':"AlfiQ GaaS",
  'href="/banking-learning/digital-trade-finance/"':"Digital Trade Finance Transformation",
 }
 if cards != len(expected_projects):
  add("HIGH","creations/index.html","Expected "+str(len(expected_projects))+" project cards from the approved portfolio list; found "+str(cards)+".")
 for destination,label in expected_projects.items():
  if destination not in portfolio:
   add("HIGH","creations/index.html","Required portfolio destination missing for "+label+": "+destination)
 for label in expected_projects.values():
  if label not in portfolio:
   add("HIGH","creations/index.html","Required portfolio project title missing: "+label)
 for rel,minimum in (("index.html",2),("site-wide-shell.js",2)):
  source=ROOT/rel
  count=source.read_text(encoding="utf-8",errors="replace").count('href="/creations/"') if source.exists() else 0
  if count < minimum:add("MEDIUM",rel,"Expected at least "+str(minimum)+" Digital Creations links; found "+str(count)+".")
 sitemap=ROOT/"sitemap.xml"
 if not sitemap.exists() or "https://regtechnexusai.com/creations/" not in sitemap.read_text(encoding="utf-8",errors="replace"):
  add("MEDIUM","sitemap.xml","Digital Creations canonical URL is missing from sitemap.")
# Smoke-test the public TradeGuard route separately because its deployed route is not a repository file.
try:
 req=Request("https://regtechnexusai.com/tradeguard/",headers={"User-Agent":"RegTechNexusAI-RegressionCheck/1.0"})
 with urlopen(req,timeout=12) as response:
  if response.status < 200 or response.status >= 400:add("HIGH","https://regtechnexusai.com/tradeguard/","Public TradeGuard route returned HTTP "+str(response.status))
except (URLError,HTTPError,TimeoutError) as exc:
 add("MEDIUM","https://regtechnexusai.com/tradeguard/","Public route smoke test inconclusive: "+str(exc))
# MUKUL international-expansion guardrails: only validate if the proposal exists.
# This intentionally does not import or activate the config in any application page.
config_path=ROOT/"mukul"/"international"/"expansion-config.json"
if config_path.exists():
 try:
  config=json.loads(config_path.read_text(encoding="utf-8"))
  if config.get("schemaVersion") != 1:add("HIGH",config_path.relative_to(ROOT).as_posix(),"Unsupported or missing schemaVersion.")
  if config.get("status") != "proposal":add("HIGH",config_path.relative_to(ROOT).as_posix(),"Expansion config must remain a proposal until release approval.")
  if config.get("enabled") is not False:add("HIGH",config_path.relative_to(ROOT).as_posix(),"Expansion config must remain disabled before all release gates pass.")
  policy=config.get("releasePolicy",{})
  for key in ("requireLocalAgronomistReview","requirePrivacyAndLegalReview","requireRegressionTests","blockProductionOnAnyFailure","preserveExistingFeatures"):
   if policy.get(key) is not True:add("HIGH",config_path.relative_to(ROOT).as_posix(),"Required releasePolicy guardrail must be true: "+key)
  markets=config.get("markets")
  if not isinstance(markets,dict) or not markets:add("HIGH",config_path.relative_to(ROOT).as_posix(),"At least one candidate market must be defined.")
  else:
   for market_id,market in markets.items():
    if not isinstance(market,dict):add("HIGH",config_path.relative_to(ROOT).as_posix(),"Market entry must be an object: "+str(market_id));continue
    if market.get("status") != "candidate":add("HIGH",config_path.relative_to(ROOT).as_posix(),"Market must remain candidate until approved: "+str(market_id))
    if market.get("contentStatus") != "not-reviewed":add("HIGH",config_path.relative_to(ROOT).as_posix(),"Market content must remain marked not-reviewed until expert review: "+str(market_id))
    if market.get("localPartnerStatus") != "not-confirmed":add("HIGH",config_path.relative_to(ROOT).as_posix(),"Local partner status must not be assumed confirmed: "+str(market_id))
  safety=config.get("safety",{})
  for key in ("diagnosisClaim","uncertainAdviceEscalationRequired","collectOnlyNecessaryData","imageUploadRequiresExplicitConsent","neverEmbedSecretsInClientConfig"):
   expected=False if key=="diagnosisClaim" else True
   if safety.get(key) is not expected:add("HIGH",config_path.relative_to(ROOT).as_posix(),"Unsafe or missing safety setting: "+key)
  homepage=ROOT/"mukul"/"index.html"
  if homepage.exists() and re.search(r"international/expansion-config\.json|expansion-config\.json",homepage.read_text(encoding="utf-8",errors="replace"),re.I):
   add("HIGH","mukul/index.html","Inactive international config must not be imported or activated by the existing homepage.")
  checked.append(config_path.relative_to(ROOT).as_posix())
 except (OSError,json.JSONDecodeError) as exc:
  add("HIGH",config_path.relative_to(ROOT).as_posix(),"Expansion config could not be read as valid JSON: "+str(exc))
now=datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
lines=["# Automated Static Regression Report","", "Run: "+now, "Repository: "+ROOT.name, "Critical HTML pages checked: "+str(sum(1 for x in checked if x in CRITICAL))+"/"+str(len(CRITICAL)), "Supplementary checks: "+str(len(checked)-sum(1 for x in checked if x in CRITICAL)), "Scope: required-page presence, metadata, duplicate IDs, local links/assets and fragments.", "Limitation: not live browser testing, regulatory correctness review, accessibility audit or penetration test.", "", "## Pages checked"]
lines += ["- "+x for x in checked] or ["- None"]
lines += ["", "## Findings"]
lines += [("- "+s+" — "+p+": "+d) for s,p,d in findings] if findings else ["- No static findings detected in checked scope."]
lines += ["", "## Summary"]
for s in ("HIGH","MEDIUM","LOW"):lines.append("- "+s.title()+": "+str(sum(1 for x in findings if x[0]==s)))
lines.append("- Automated result: "+("FINDINGS REQUIRE TRIAGE" if findings else "NO FINDINGS DETECTED"))
out=ROOT/"quality-assurance"/"regression-report.md";out.parent.mkdir(parents=True,exist_ok=True);out.write_text("\n".join(lines)+"\n",encoding="utf-8");print("\n".join(lines))
if __name__=="__main__":
 ap=argparse.ArgumentParser();ap.add_argument("--strict",action="store_true");args=ap.parse_args();sys.exit(1 if args.strict and findings else 0)
