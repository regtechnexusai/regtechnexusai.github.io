#!/usr/bin/env node
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const os = require("node:os");
const sharp = require("sharp");

const SOURCE_REL = "regtech-nexus-ai-logo-2026.png";
const OUTPUT_REL = "regtech-nexus-ai-logo-460.png";
const SOURCE_SHA256 = "ee4ec2520c4727461ce18da178219fa61ec733bb552c80808d0b2a75a3f9a5f4";
const SOURCE_WIDTH = 1391;
const SOURCE_HEIGHT = 476;
const OUTPUT_WIDTH = 460;
const OUTPUT_HEIGHT = 157;
const MAX_BYTES = 120000;
const PAGE_REL = "icms-2026/index.html";

const WEBP_SOURCE = '<source srcset="../regtech-nexus-ai-logo-2026.webp" type="image/webp">';
const HEADER_OLD = '<img class="brand-logo" src="../regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI" width="160" height="55">';
const HEADER_NEW = '<img class="brand-logo" src="../regtech-nexus-ai-logo-460.png" alt="RegTech Nexus AI" width="160" height="55">';
const FOOTER_OLD = '<img class="brand-logo" src="../regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI" width="248" height="80" loading="lazy" decoding="async">';
const FOOTER_NEW = '<img class="brand-logo" src="../regtech-nexus-ai-logo-460.png" alt="RegTech Nexus AI" width="248" height="80" loading="lazy" decoding="async">';

function countOccurrences(text, needle) {
  return text.split(needle).length - 1;
}

function transformHtml(html) {
  // Only target the two ICMS picture fallback tags; never alter metadata or the WebP source.
  if (countOccurrences(html, WEBP_SOURCE) !== 2) {
    throw new Error("Expected exactly two ICMS WebP picture sources");
  }

  const headerOldCount = countOccurrences(html, HEADER_OLD);
  const footerOldCount = countOccurrences(html, FOOTER_OLD);
  const headerNewCount = countOccurrences(html, HEADER_NEW);
  const footerNewCount = countOccurrences(html, FOOTER_NEW);

  // Idempotent: an already-transformed page is accepted without further changes.
  if (headerOldCount === 0 && footerOldCount === 0 && headerNewCount === 1 && footerNewCount === 1) {
    return html;
  }
  // Fail closed if markup changed or only one of the two tags was transformed.
  if (headerOldCount !== 1 || footerOldCount !== 1 || headerNewCount !== 0 || footerNewCount !== 0) {
    throw new Error("ICMS fallback markup is unexpected or partially transformed; refusing rewrite");
  }

  const updated = html.replace(HEADER_OLD, HEADER_NEW).replace(FOOTER_OLD, FOOTER_NEW);
  if (countOccurrences(updated, HEADER_NEW) !== 1 || countOccurrences(updated, FOOTER_NEW) !== 1 ||
      countOccurrences(updated, HEADER_OLD) !== 0 || countOccurrences(updated, FOOTER_OLD) !== 0) {
    throw new Error("ICMS fallback rewrite count verification failed");
  }
  return updated;
}

async function generateFallback(source, output, expectedHash = SOURCE_SHA256) {
  const sourceMeta = await sharp(source).metadata();
  if (sourceMeta.format !== "png" || sourceMeta.width !== SOURCE_WIDTH || sourceMeta.height !== SOURCE_HEIGHT) {
    throw new Error("Unexpected logo source PNG format/dimensions");
  }
  const sourceHash = crypto.createHash("sha256").update(fs.readFileSync(source)).digest("hex");
  if (sourceHash !== expectedHash) {
    throw new Error("Pinned source logo SHA-256 mismatch: " + sourceHash);
  }

  const temp = output + ".tmp.png";
  try {
    await sharp(source)
      .resize({ width: OUTPUT_WIDTH, withoutEnlargement: true })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(temp);
    const outputMeta = await sharp(temp).metadata();
    const bytes = fs.statSync(temp).size;
    if (outputMeta.format !== "png" || outputMeta.width !== OUTPUT_WIDTH ||
        outputMeta.height !== OUTPUT_HEIGHT || bytes > MAX_BYTES) {
      throw new Error("ICMS fallback PNG failed format/dimension/120KB gate: " + JSON.stringify({ outputMeta, bytes }));
    }
    fs.renameSync(temp, output);
    return { bytes, metadata: outputMeta };
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}

async function build(siteDir) {
  const root = path.resolve(siteDir);
  const source = path.join(root, SOURCE_REL);
  const output = path.join(root, OUTPUT_REL);
  const page = path.join(root, PAGE_REL);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error("Pinned logo source missing");
  if (!fs.existsSync(page) || !fs.statSync(page).isFile()) throw new Error("ICMS target page missing");

  const original = fs.readFileSync(page, "utf8");
  const updated = transformHtml(original);
  if (transformHtml(updated) !== updated) throw new Error("ICMS fallback transform is not idempotent");
  const result = await generateFallback(source, output);
  if (updated !== original) fs.writeFileSync(page, updated, "utf8");
  const smallerPercent = (1 - result.bytes / fs.statSync(source).size) * 100;
  console.log("PASS: ICMS fallback PNG " + result.bytes + " bytes (" + smallerPercent.toFixed(2) + "% smaller); source retained");
  console.log("PASS: two fallback tags changed; WebP source, alt, class, dimensions, lazy loading and metadata preserved");
}

async function selfTest() {
  const fixture = '<head><meta property="og:image" content="https://regtechnexusai.com/regtech-nexus-ai-logo-2026.png">' +
    '<meta name="twitter:image" content="https://regtechnexusai.com/regtech-nexus-ai-logo-2026.png"></head>' +
    '<picture>' + WEBP_SOURCE + HEADER_OLD + '</picture><picture>' + WEBP_SOURCE + FOOTER_OLD + '</picture>';
  const updated = transformHtml(fixture);
  if (countOccurrences(updated, HEADER_NEW) !== 1 || countOccurrences(updated, FOOTER_NEW) !== 1 ||
      countOccurrences(updated, 'https://regtechnexusai.com/regtech-nexus-ai-logo-2026.png') !== 2) {
    throw new Error("Synthetic fallback replacement or metadata preservation failed");
  }
  if (transformHtml(updated) !== updated) throw new Error("Transform idempotency failed");

  const mixedHeader = fixture.replace(HEADER_OLD, HEADER_NEW);
  const malformedHeader = fixture.replace(HEADER_OLD, HEADER_OLD.replace("regtech-nexus-ai-logo-2026.png", "other.png"));
  for (const bad of [mixedHeader, malformedHeader]) {
    try {
      transformHtml(bad);
    } catch {
      continue;
    }
    throw new Error("Fail-closed test did not reject mixed/malformed fallbacks");
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "icms-logo-fallback-test-"));
  try {
    const source = path.join(tempDir, SOURCE_REL);
    const first = path.join(tempDir, "first.png");
    const second = path.join(tempDir, "second.png");
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1391" height="476" viewBox="0 0 1391 476"><rect width="100%" height="100%" fill="white"/><text x="40" y="250" font-size="120" fill="#003366">Synthetic logo</text></svg>');
    await sharp(svg).png().toFile(source);
    const hash = crypto.createHash("sha256").update(fs.readFileSync(source)).digest("hex");
    const firstResult = await generateFallback(source, first, hash);
    const secondResult = await generateFallback(source, second, hash);
    const firstHash = crypto.createHash("sha256").update(fs.readFileSync(first)).digest("hex");
    const secondHash = crypto.createHash("sha256").update(fs.readFileSync(second)).digest("hex");
    if (firstResult.bytes !== secondResult.bytes || firstHash !== secondHash) {
      throw new Error("Deterministic PNG output test failed");
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  console.log("PASS: ICMS fallback self-test (exact markup, metadata, fail-closed, idempotency, deterministic PNG and size/dimension gate)");
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let selfTestRequested = false;
  let siteDir = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--self-test") selfTestRequested = true;
    else if (args[i] === "--site-dir") siteDir = args[++i];
    else throw new Error("Unknown argument: " + args[i]);
  }
  if (!selfTestRequested && !siteDir) throw new Error("Provide --self-test or --site-dir");
  (async () => {
    if (selfTestRequested) await selfTest();
    if (siteDir) await build(siteDir);
  })().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
