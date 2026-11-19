#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const sharp = require("sharp");

const SOURCE_REL = "payscale-2026/regtech-nexus-ai-logo.png";
const OUTPUT_REL = "payscale-2026/regtech-nexus-ai-favicon-128.png";
const SOURCE_WIDTH = 1536;
const SOURCE_HEIGHT = 1536;
const OUTPUT_WIDTH = 128;
const MAX_BYTES = 30000;
const ORIGINAL_LINK = '<link rel="icon" href="regtech-nexus-ai-logo.png" type="image/png" />';
const OPTIMIZED_LINK = '<link rel="icon" href="regtech-nexus-ai-favicon-128.png" type="image/png" />';
const PAGES = ["payscale-2026/index.html", "payscale-2026/pension.html"];

function transformHtml(content) {
  const originalCount = content.split(ORIGINAL_LINK).length - 1;
  const optimizedCount = content.split(OPTIMIZED_LINK).length - 1;
  if (originalCount === 0 && optimizedCount === 1) return content;
  if (originalCount !== 1 || optimizedCount !== 0) {
    throw new Error("Expected exactly one source favicon link or one valid optimized favicon link");
  }
  return content.replace(ORIGINAL_LINK, OPTIMIZED_LINK);
}

async function generateFavicon(source, output) {
  const sourceMeta = await sharp(source).metadata();
  if (sourceMeta.format !== "png" || sourceMeta.width !== SOURCE_WIDTH || sourceMeta.height !== SOURCE_HEIGHT) {
    throw new Error("Unexpected source favicon format or dimensions; refusing an unreviewed transformation");
  }
  const tmp = output + ".tmp.png";
  try {
    await sharp(source)
      .resize({ width: OUTPUT_WIDTH, height: OUTPUT_WIDTH, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toFile(tmp);
    const outputMeta = await sharp(tmp).metadata();
    const bytes = fs.statSync(tmp).size;
    if (outputMeta.format !== "png" || outputMeta.width !== OUTPUT_WIDTH || outputMeta.height !== OUTPUT_WIDTH || bytes > MAX_BYTES) {
      throw new Error("Optimized favicon failed PNG, dimensions or 30 KB size gate: " + JSON.stringify({ outputMeta, bytes }));
    }
    fs.renameSync(tmp, output);
    return { sourceBytes: fs.statSync(source).size, outputBytes: bytes, metadata: outputMeta };
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

async function apply(siteDir) {
  const source = path.join(siteDir, SOURCE_REL);
  const output = path.join(siteDir, OUTPUT_REL);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) throw new Error("PayScale source favicon missing; refusing transformation");
  const transformedPages = PAGES.map(rel => {
    const page = path.join(siteDir, rel);
    if (!fs.existsSync(page) || !fs.statSync(page).isFile()) throw new Error("Expected PayScale page missing: " + rel);
    const before = fs.readFileSync(page, "utf8");
    return { page, rel, before, after: transformHtml(before) };
  });
  const result = await generateFavicon(source, output);
  transformedPages.forEach(({ page, before, after }) => {
    if (after !== before) fs.writeFileSync(page, after, "utf8");
  });
  const reduction = (1 - result.outputBytes / result.sourceBytes) * 100;
  console.log("PASS: PayScale 128px PNG favicon generated: " + result.outputBytes + " bytes (source " + result.sourceBytes + " bytes, " + reduction.toFixed(2) + "% smaller)");
  transformedPages.forEach(({ rel, after }) => {
    if (after.split(OPTIMIZED_LINK).length - 1 !== 1 || after.includes(ORIGINAL_LINK)) throw new Error("Favicon link validation failed: " + rel);
    console.log("PASS: Optimized favicon linked on " + rel);
  });
}

async function selfTest() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "payscale-favicon-test-"));
  try {
    const source = path.join(tempDir, "source.png");
    const output = path.join(tempDir, "optimized.png");
    await sharp({ create: { width: SOURCE_WIDTH, height: SOURCE_HEIGHT, channels: 3, background: "#ffffff" } }).png().toFile(source);
    const generated = await generateFavicon(source, output);
    const metadata = await sharp(output).metadata();
    if (metadata.width !== OUTPUT_WIDTH || metadata.height !== OUTPUT_WIDTH || generated.outputBytes > MAX_BYTES) throw new Error("Synthetic favicon output check failed");
    const fixture = "<!doctype html>" + ORIGINAL_LINK;
    const optimized = transformHtml(fixture);
    if (!optimized.includes(OPTIMIZED_LINK) || transformHtml(optimized) !== optimized) throw new Error("Favicon HTML transform/idempotency test failed");
    for (const invalid of [
      '<link rel="icon" href="missing.png" type="image/png" />',
      fixture + ORIGINAL_LINK,
      fixture + OPTIMIZED_LINK,
    ]) {
      let failed = false;
      try { transformHtml(invalid); } catch { failed = true; }
      if (!failed) throw new Error("Fail-closed favicon HTML test failed");
    }
    console.log("PASS: synthetic PNG generation, 128x128 dimensions, 30 KB budget, HTML rewrite, idempotency and fail-closed tests");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

(async () => {
  const args = process.argv.slice(2);
  if (args.includes("--self-test")) await selfTest();
  const siteIndex = args.indexOf("--site-dir");
  if (siteIndex >= 0) {
    if (!args[siteIndex + 1]) throw new Error("--site-dir requires a path");
    await apply(path.resolve(args[siteIndex + 1]));
  }
  if (!args.includes("--self-test") && siteIndex < 0) throw new Error("Provide --self-test or --site-dir");
})().catch(error => { console.error(error); process.exit(1); });
