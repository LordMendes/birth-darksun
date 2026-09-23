#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OVERLAYS = path.join(ROOT, "web", "data", "atlas", "overlays.json");
const OUT_DIR = path.join(ROOT, "web", "public", "atlas", "source");
const MANIFEST = path.join(ROOT, "web", "data", "atlas", "available-assets.json");

const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

function isImageBuffer(buf) {
  if (buf.length < 4) return false;
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
    return true;
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  return false;
}

async function download(url, dest, { force = false } = {}) {
  if (!force && fs.existsSync(dest)) {
    const buf = fs.readFileSync(dest);
    if (isImageBuffer(buf)) {
      console.log(`skip (exists): ${path.basename(dest)}`);
      return true;
    }
    console.log(`re-fetch (invalid): ${path.basename(dest)}`);
    fs.unlinkSync(dest);
  }

  console.log(`fetch: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`skip (${res.status}): ${url}`);
    return false;
  }

  const contentType = res.headers.get("content-type")?.split(";")[0]?.trim();
  const buf = Buffer.from(await res.arrayBuffer());
  if (!isImageBuffer(buf)) {
    console.warn(
      `skip (not image${contentType ? `, got ${contentType}` : ""}): ${url}`,
    );
    return false;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  console.log(`saved: ${path.basename(dest)} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
  return true;
}

function isMapTileOverlay(overlay) {
  return (
    Boolean(overlay.localPath) &&
    (overlay.kind === "WTM" || overlay.id === "u-c5-last-frontier") &&
    overlay.localPath.startsWith("source/")
  );
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(OVERLAYS, "utf8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const available = [];
  const force = process.argv.includes("--force");
  const mapTilesOnly = process.argv.includes("--map-tiles");
  const overlays = mapTilesOnly
    ? catalog.overlays.filter(isMapTileOverlay)
    : catalog.overlays;

  for (const overlay of overlays) {
    if (!overlay.sourceUrl || !overlay.localPath) continue;
    const dest = path.join(ROOT, "web", "public", "atlas", overlay.localPath);
    const ok = await download(overlay.sourceUrl, dest, { force });
    if (ok) available.push(overlay.localPath);
  }

  const sourceDir = path.join(ROOT, "web", "public", "atlas", "source");
  if (fs.existsSync(sourceDir)) {
    for (const name of fs.readdirSync(sourceDir)) {
      if (/\.(png|jpe?g|webp)$/i.test(name)) available.push(`source/${name}`);
    }
  }

  const croppedDir = path.join(ROOT, "web", "public", "atlas", "cropped");
  if (fs.existsSync(croppedDir)) {
    for (const name of fs.readdirSync(croppedDir)) {
      if (/\.(png|jpe?g|webp)$/i.test(name)) available.push(`cropped/${name}`);
    }
  }

  fs.writeFileSync(
    MANIFEST,
    `${JSON.stringify({ version: 1, paths: [...new Set(available)].sort() }, null, 2)}\n`,
  );
  console.log(`Done. ${[...new Set(available)].length} asset(s) available.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
