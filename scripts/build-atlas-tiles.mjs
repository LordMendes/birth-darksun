#!/usr/bin/env node
/**
 * Build simple single-zoom tile pyramids for atlas overlays using sharp.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OVERLAYS = path.join(ROOT, "web", "data", "atlas", "overlays.json");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("Install sharp at repo root: pnpm add -D sharp");
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(OVERLAYS, "utf8"));
  const tileSize = 256;

  for (const overlay of catalog.overlays) {
    if (!overlay.localPath || !overlay.bounds) continue;
    const src = path.join(ROOT, "web", "public", "atlas", overlay.localPath);
    if (!fs.existsSync(src)) {
      console.warn(`skip (missing): ${overlay.id}`);
      continue;
    }

    const outBase = path.join(ROOT, "web", "public", "atlas", "tiles", overlay.id, "0", "0");
    fs.mkdirSync(outBase, { recursive: true });
    const outFile = path.join(outBase, "0.png");

    await sharp(src)
      .resize(tileSize, tileSize, { fit: "inside", withoutEnlargement: false })
      .png()
      .toFile(outFile);

    console.log(`tile: ${overlay.id} -> ${outFile}`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
