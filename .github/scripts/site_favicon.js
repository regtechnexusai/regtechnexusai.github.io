#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const sharp = require("sharp");

const SOURCE_REL = "regtech-nexus-ai-logo.jpg";
const OUTPUT_REL = "regtech-nexus-ai-favicon-128.png";
const SOURCE_SHA256 = "585d3257e430d657851afebbc151f8ec9f2855eef9b5da00a553fb67977c0971";
const SOURCE_WIDTH = 1536;
const SOURCE_HEIGHT = 1536;
const OUTPUT_WIDTH = 128;
const MAX_BYTES = 30000;
const OUTPUT_HREF = "/regtech-nexus-ai-favicon-128.png";
const TARGET_SOURCE_PATHS = new Set([
  "regtech-nexus-ai-logo-2026.png",
  "regtech-nexus-ai-logo.png",
  "regtech-nexus-ai-logo.jpg",
  "payscale-2026/regtech-nexus-ai-logo.png",
]);
const REQUIRED_PAGES = [
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
];

function getAttr(tag, name) {
  const re = new RegExp("\\b" + name + "\\s*=\\s*(?:\\\"([^\\\"]*)\\\"|'([^']*)'|([^\\s>]+))", "i");
  const match = tag.match(re);
  return match ? (match[1] ?? match[2] ?? match[3] ?? "") : null;
}

function setAttr(tag, name, value) {
  const re = new RegExp("(\\s+" + name + "\\s*=\\s*)(?:\\\"[^\\\"]*\\\"|'[^']*'|[^\\s>]+)", "i");
  if (re.test(tag)) return tag.replace(re, (match, prefix) => prefix + "\"" + value + "\"");
  return tag.replace(/\s*\/?>$/, ending => {
    const slash = ending.includes("/") ? "/" : "";
    return " " + name + "=\"" + value + "\"" + (slash ? " /" : "") + ">";
  });
}

function resolveSitePath(siteDir, pageRel, href) {
  let raw;
  try {
    raw = decodeURIComponent(String(href).split(/[?#]/, 1)[0]).replace(/\\/g, "/");
  } catch {
    return null;
  }
  if (!raw || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(raw)) return null;
  const siteRoot = path.resolve(siteDir);
  const resolved = raw.startsWith("/")
    ? path.resolve(siteRoot, raw.slice(1))
    : path.resolve(siteRoot, path.dirname(pageRel), raw);
  if (resolved !== siteRoot && !resolved.startsWith(siteRoot + path.sep)) return null;
  return path.relative(siteRoot, resolved).split(path.sep).join("/");
}

function transformHtml(content, pageRel, siteDir) {
  let rewrittenLinks = 0;
  const result = content.replace(/<link\b[^>]*>/gi, tag => {
    const rel = getAttr(tag, "rel");
    if (!rel || !rel.toLowerCase().split(/\s+/).includes("icon")) return tag;
    const href = getAttr(tag, "href");
    if (href === null) return tag;
    const target = resolveSitePath(siteDir, pageRel, href);
    if (target === OUTPUT_REL) {
      const type = getAttr(tag, "type");
      const size = getAttr(tag, "sizes");
      if (type && type.toLowerCase() === "image/png" && size === "128x128") return tag;
      let updated = setAttr(tag, "href", OUTPUT_HREF);
      updated = setAttr(updated, "type", "image/png");
      updated = setAttr(updated, "sizes", "128x128");
      return updated;
    }
    if (!target || !TARGET_SOURCE_PATHS.has(target)) return tag;
    let updated = setAttr(tag, "href", OUTPUT_HREF);
    updated = setAttr(updated, "type", "image/png");
    updated = setAttr(updated, "sizes", "128x128");
    rewrittenLinks += 1;
    return updated;
  });
  return { content: result, rewrittenLinks };
}

async function generateFavicon(source, output) {
  const sourceMeta = await sharp(source).metadata();
  if (sourceMeta.format !== "jpeg" || sourceMeta.width !== SOURCE_WIDTH || sourceMeta.height !== SOURCE_HEIGHT) {
    throw new Error("Unexpected source favicon format or dimensions; refusing an unreviewed transformation");
  }
  const temp = output + ".tmp.png";
  try {
    await sharp(source)
      .resize({ width: OUTPUT_WIDTH, height: OUTPUT_WIDTH, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(temp);
    const outputMeta = await sharp(temp).metadata();
    const bytes = fs.statSync(temp).size;
    if (outputMeta.format !== "png" || outputMeta.width !== OUTPUT_WIDTH || outputMeta.height !== OUTPUT_HEIGHT || bytes > MAX_BYTES) {
      throw new Error("Site favicon failed PNG, dimensions or 30 KB size gate: " + JSON.stringify({ outputMeta, bytes }));
    }
    fs.renameSync(temp, output);
    return { sourceBytes: fs.statSync(source).size, outputBytes: bytes, metadata: outputMeta };
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}

function walkHtmlFiles(siteDir) {
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === ".git" || entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) files.push(full);
    }
  }
  walk(siteDir);
  return files.sort();
}

async function build(siteDir) {
  const siteRoot = path.resolve(siteDir);
  const source = path.join(siteRoot, SOURCE_REL);
  const output = path.join(siteRoot, OUTPUT_REL);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error("Site favicon source missing; refusing transformation");
  const digest = crypto.createHash("sha256").update(fs.readFileSync(source)).digest("hex");
  if (digest !== SOURCE_SHA256) throw new Error("Site favicon source SHA-256 mismatch; refusing an unreviewed asset change: " + digest);
  const pages = walkHtmlFiles(siteRoot);
  const transforms = pages.map(full => {
    const rel = path.relative(siteRoot, full).split(path.sep).join("/");
    const before = fs.readFileSync(full, "utf8");
    const result = transformHtml(before, rel, siteRoot);
    return { full, rel, before, after: result.content, rewrittenLinks: result.rewrittenLinks };
  });
  for (const rel of REQUIRED_PAGES) {
    const item = transforms.find(x => x.rel === rel);
    if (!item) throw new Error("Required site page missing for favicon validation: " + rel);
    if (!item.after.includes(OUTPUT_HREF)) throw new Error("Expected optimized site favicon link was not produced on " + rel);
  }
  const result = await generateFavicon(source, output);
  transforms.forEach(({ full, before, after }) => {
    if (after !== before) fs.writeFileSync(full, after, "utf8");
  });
  const rewrittenPages = transforms.filter(x => x.after !== x.before).length;
  const rewrittenLinks = transforms.reduce((sum, x) => sum + x.rewrittenLinks, 0);
  console.log("PASS: Site-wide 128x128 favicon generated: " + result.outputBytes + " bytes (source " + result.sourceBytes + " bytes, " + ((1 - result.outputBytes / result.sourceBytes) * 100).toFixed(2) + "% smaller)");
  console.log("PASS: " + rewrittenLinks + " generic favicon links rewritten across " + rewrittenPages + " pages; " + pages.length + " HTML pages scanned; required page coverage verified");
}

async function selfTest() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "site-favicon-test-"));
  try {
    const source = path.join(tempDir, "source.jpg");
    const first = path.join(tempDir, "first.png");
    const second = path.join(tempDir, "second.png");
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1536" viewBox="0 0 1536 1536"><rect width="1536" height="1536" fill="#fff"/><path d="M200 800L550 250L1100 650L800 1050Z" fill="#1555aa"/><path d="M650 350L1200 250L1300 800L900 1100Z" fill="#14a085"/></svg>');
    await sharp(svg).jpeg({ quality: 85 }).toFile(source);
    const firstResult = await generateFavicon(source, first);
    const secondResult = await generateFavicon(source, second);
    if (Buffer.compare(fs.readFileSync(first), fs.readFileSync(second)) !== 0) throw new Error("Site favicon generation is not deterministic");
    if (firstResult.outputBytes !== secondResult.outputBytes || firstResult.outputBytes > MAX_BYTES) throw new Error("Synthetic favicon output size check failed");
    const fixture = '<!doctype html><link rel="icon" href="../regtech-nexus-ai-logo-2026.png"><link rel="apple-touch-icon" href="/apple-touch.png"><link rel="icon" type="image/svg+xml" href="/mukul/farm-records/icons/mukul-icon.svg">';
    const transformed = transformHtml(fixture, "nested/index.html", tempDir);
    if (!transformed.content.includes('href="' + OUTPUT_HREF + '"') || !transformed.content.includes('type="image/png"') || !transformed.content.includes('sizes="128x128"')) throw new Error("Site favicon HTML rewrite test failed");
    if (!transformed.content.includes('rel="apple-touch-icon" href="/apple-touch.png"') || !transformed.content.includes('href="/mukul/farm-records/icons/mukul-icon.svg"')) throw new Error("Site favicon rewrite altered a custom or touch icon");
    if (transformHtml(transformed.content, "nested/index.html", tempDir).content !== transformed.content) throw new Error("Site favicon HTML transformation is not idempotent");
    const untouched = '<link rel="icon" href="/unrelated-icon.png">';
    if (transformHtml(untouched, "index.html", tempDir).content !== untouched) throw new Error("Unrecognized favicon source was changed");
    console.log("PASS: synthetic JPEG generation, 128x128 PNG, 30 KB budget, deterministic output, source-only rewrite, preservation and idempotency");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

(async () => {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--self-test") return selfTest();
  if (args.length === 2 && args[0] === "--site-dir") return build(path.resolve(args[1]));
  throw new Error("Usage: site_favicon.js --self-test | --site-dir <assembled-site-dir>");
})().catch(error => { console.error(error); process.exit(1); });
