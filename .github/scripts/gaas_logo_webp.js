#!/usr/bin/env node
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");

const SOURCE_REL = "gaas/alfiq-gaas-logo.png";
const OUTPUT_REL = "gaas/alfiq-gaas-logo.webp";
const SOURCE_WIDTH = 900;
const SOURCE_HEIGHT = 300;
const OUTPUT_WIDTH = 460;
const OUTPUT_HEIGHT = 153;
const MAX_BYTES = 120000;

async function generateWebp(sourcePath, outputPath) {
  const source = await sharp(sourcePath).metadata();
  if (source.format !== "png" || source.width !== SOURCE_WIDTH || source.height !== SOURCE_HEIGHT) {
    throw new Error("GaaS logo source validation failed; expected PNG " + SOURCE_WIDTH + "x" + SOURCE_HEIGHT + ", received " + JSON.stringify({ format: source.format, width: source.width, height: source.height, hasAlpha: source.hasAlpha }));
  }
  await sharp(sourcePath)
    .resize({ width: OUTPUT_WIDTH, withoutEnlargement: true })
    .webp({ quality: 90, effort: 5, alphaQuality: 100 })
    .toFile(outputPath);
  const output = await sharp(outputPath).metadata();
  const bytes = fs.statSync(outputPath).size;
  if (output.format !== "webp" || output.width !== OUTPUT_WIDTH || output.height !== OUTPUT_HEIGHT || bytes > MAX_BYTES) {
    throw new Error("GaaS logo WebP failed format, dimensions or 120 KB size gate: " + JSON.stringify({ output, bytes }));
  }
  return { bytes, output };
}

async function selfTest() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "gaas-logo-webp-selftest-"));
  try {
    const sourcePath = path.join(tempDir, "synthetic.png");
    const firstPath = path.join(tempDir, "first.webp");
    const secondPath = path.join(tempDir, "second.webp");
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="' + SOURCE_WIDTH + '" height="' + SOURCE_HEIGHT + '" viewBox="0 0 ' + SOURCE_WIDTH + ' ' + SOURCE_HEIGHT + '"><path d="M80 500L900 110L1200 300L2000 160" fill="none" stroke="#1565a8" stroke-width="70"/><path d="M400 600L900 450L1600 610" fill="none" stroke="#16a085" stroke-width="48"/></svg>');
    await sharp(svg).png().toFile(sourcePath);
    const first = await generateWebp(sourcePath, firstPath);
    const second = await generateWebp(sourcePath, secondPath);
    if (Buffer.compare(fs.readFileSync(firstPath), fs.readFileSync(secondPath)) !== 0) {
      throw new Error("GaaS logo WebP generator is not deterministic");
    }
    console.log("PASS: synthetic PNG -> 460x153 WebP, size gate and deterministic output (" + first.bytes + " bytes)");
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

async function build(siteDir) {
  const sourcePath = path.join(siteDir, SOURCE_REL);
  const outputPath = path.join(siteDir, OUTPUT_REL);
  if (!fs.existsSync(sourcePath)) throw new Error("Expected GaaS logo source missing: " + sourcePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const result = await generateWebp(sourcePath, outputPath);
  console.log("Optimized AlfiQ GaaS logo: " + result.bytes + " bytes (PNG source: " + fs.statSync(sourcePath).size + " bytes)");
}

const args = process.argv.slice(2);
(async () => {
  if (args.length === 1 && args[0] === "--self-test") return selfTest();
  if (args.length === 2 && args[0] === "--site-dir") return build(path.resolve(args[1]));
  throw new Error("Usage: gaas_logo_webp.js --self-test | --site-dir <assembled-site-dir>");
})().catch(error => { console.error(error); process.exit(1); });
