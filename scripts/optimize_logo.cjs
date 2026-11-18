#!/usr/bin/env node
"use strict";

// Generate a display-sized WebP from the canonical transparent PNG logo.
// Keep the PNG in the published site for social previews and compatibility references.
const fs = require("node:fs/promises");
const path = require("node:path");
const sharpPath = process.env.SHARP_MODULE_PATH;
if (!sharpPath) throw new Error("SHARP_MODULE_PATH is required");
const sharp = require(sharpPath);
const site = path.resolve(process.argv[2] || "site");
const source = path.join(site, "regtech-nexus-ai-logo-2026.png");
const output = path.join(site, "regtech-nexus-ai-logo-2026.webp");

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else files.push(full);
  }
  return files;
}

(async () => {
  const metadata = await sharp(source).metadata();
  if (!metadata.width || metadata.width < 460) {
    throw new Error("Unexpected source logo dimensions; refusing to upscale or replace it");
  }
  await sharp(source)
    .resize({ width: 460, withoutEnlargement: true })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(output);

  const outputMeta = await sharp(output).metadata();
  if (outputMeta.format !== "webp" || outputMeta.width !== 460 || !outputMeta.hasAlpha) {
    throw new Error("Optimized logo failed format, dimension or transparency validation");
  }

  let replacements = 0;
  for (const file of await walk(site)) {
    if (!/\.html$/i.test(file)) continue;
    const original = await fs.readFile(file, "utf8");
    const updated = original.replace(
      /(\bsrc\s*=\s*["'])(\/?)regtech-nexus-ai-logo-2026\.png(["'])/gi,
      (match, prefix, slash, suffix) => {
        replacements += 1;
        return prefix + slash + "regtech-nexus-ai-logo-2026.webp" + suffix;
      }
    );
    if (updated !== original) await fs.writeFile(file, updated, "utf8");
  }

  const shell = path.join(site, "site-wide-shell.js");
  try {
    const original = await fs.readFile(shell, "utf8");
    const updated = original.replaceAll("/regtech-nexus-ai-logo-2026.png", "/regtech-nexus-ai-logo-2026.webp");
    if (updated !== original) await fs.writeFile(shell, updated, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const sourceStat = await fs.stat(source);
  const outputStat = await fs.stat(output);
  if (outputStat.size >= sourceStat.size) {
    throw new Error("WebP output is not smaller than the source PNG; refusing a non-beneficial replacement");
  }
  const saved = sourceStat.size - outputStat.size;
  const pct = (saved / sourceStat.size * 100).toFixed(1);
  console.log("Logo optimisation: " + sourceStat.size + " -> " + outputStat.size +
    " bytes (" + pct + "% smaller); " + replacements + " HTML image references updated.");
  if (process.env.GITHUB_STEP_SUMMARY) {
    await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,
      "### Logo image optimisation\n- Source PNG: " + sourceStat.size +
      " bytes\n- Display-sized WebP: " + outputStat.size + " bytes\n- Transfer-size reduction: " +
      saved + " bytes (" + pct + "%)\n- HTML logo references updated: " + replacements + "\n");
  }
})().catch(error => { console.error(error); process.exit(1); });
