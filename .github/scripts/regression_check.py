#!/usr/bin/env python3
"""Report-only static regression checks for RegTech Nexus AI GitHub Pages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import argparse, datetime, re, sys
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
ROOT=Path(__file__).resolve().parents[2]
CRITICAL=["index.html","tool-assurance/index.html","regulatory-source-register/index.html","bank-use-review.html","regulatory-gap-analyzer/index.html","icms-2026/index.html","international-regulatory-calculators.html","payscale-2026/index.html","md-ceo-performance-calculator/index.html","explainable-ai.html","derivatives/index.html"]
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
# Smoke-test the public TradeGuard route separately because its deployed route is not a repository file.
try:
 req=Request("https://regtechnexusai.com/tradeguard/",headers={"User-Agent":"RegTechNexusAI-RegressionCheck/1.0"})
 with urlopen(req,timeout=12) as response:
  if response.status < 200 or response.status >= 400:add("HIGH","https://regtechnexusai.com/tradeguard/","Public TradeGuard route returned HTTP "+str(response.status))
except (URLError,HTTPError,TimeoutError) as exc:
 add("MEDIUM","https://regtechnexusai.com/tradeguard/","Public route smoke test inconclusive: "+str(exc))
now=datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
lines=["# Automated Static Regression Report","", "Run: "+now, "Repository: "+ROOT.name, "Critical pages checked: "+str(len(checked))+"/"+str(len(CRITICAL)), "Scope: required-page presence, metadata, duplicate IDs, local links/assets and fragments.", "Limitation: not live browser testing, regulatory correctness review, accessibility audit or penetration test.", "", "## Pages checked"]
lines += ["- "+x for x in checked] or ["- None"]
lines += ["", "## Findings"]
lines += [("- "+s+" — "+p+": "+d) for s,p,d in findings] if findings else ["- No static findings detected in checked scope."]
lines += ["", "## Summary"]
for s in ("HIGH","MEDIUM","LOW"):lines.append("- "+s.title()+": "+str(sum(1 for x in findings if x[0]==s)))
lines.append("- Automated result: "+("FINDINGS REQUIRE TRIAGE" if findings else "NO FINDINGS DETECTED"))
out=ROOT/"quality-assurance"/"regression-report.md";out.parent.mkdir(parents=True,exist_ok=True);out.write_text("\n".join(lines)+"\n",encoding="utf-8");print("\n".join(lines))
if __name__=="__main__":
 ap=argparse.ArgumentParser();ap.add_argument("--strict",action="store_true");args=ap.parse_args();sys.exit(1 if args.strict and findings else 0)
