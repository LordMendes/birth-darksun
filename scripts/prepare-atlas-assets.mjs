#!/usr/bin/env node
/**
 * Ensure cropped atlas tiles exist under web/public/atlas/cropped/ before
 * `next build`. Those PNGs are gitignored, so a Vercel clone has the atlas
 * manifest but no files — the map then 404s on /atlas/cropped/*.png.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OVERLAYS = path.join(ROOT, "web", "data", "atlas", "overlays.json");
const SOURCE = path.join(ROOT, "web", "public", "atlas", "source");
const CROPPED = path.join(ROOT, "web", "public", "atlas", "cropped");
const MANIFEST = path.join(ROOT, "web", "data", "atlas", "available-assets.json");

function run(script, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, "scripts", script), ...args], {
      stdio: "inherit",
      cwd: ROOT,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${script} exited ${code}`));
    });
  });
}

function listImages(dir, prefix) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name))
    .map((name) => `${prefix}/${name}`);
}

function writeManifest() {
  const paths = [
    ...listImages(SOURCE, "source"),
    ...listImages(CROPPED, "cropped"),
  ].sort();
  fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
  fs.writeFileSync(
    MANIFEST,
    `${JSON.stringify({ version: 1, paths }, null, 2)}\n`,
  );
  console.log(`atlas manifest: ${paths.length} path(s)`);
}

function requiredCroppedNames() {
  const catalog = JSON.parse(fs.readFileSync(OVERLAYS, "utf8"));
  return catalog.overlays
    .filter(
      (overlay) =>
        overlay.localPath &&
        (overlay.kind === "WTM" || overlay.id === "u-c5-last-frontier") &&
        overlay.localPath.startsWith("source/"),
    )
    .map((overlay) =>
      path.basename(overlay.localPath).replace(/\.(jpe?g)$/i, ".png"),
    );
}

function removeSourceImages() {
  if (!fs.existsSync(SOURCE)) return;
  for (const name of fs.readdirSync(SOURCE)) {
    if (!/\.(png|jpe?g|webp)$/i.test(name)) continue;
    fs.unlinkSync(path.join(SOURCE, name));
  }
}

async function main() {
  if (process.env.SKIP_ATLAS_PREPARE === "1") {
    writeManifest();
    console.log("SKIP_ATLAS_PREPARE=1; not fetching atlas images");
    return;
  }

  const required = requiredCroppedNames();
  const missing = required.filter(
    (name) => !fs.existsSync(path.join(CROPPED, name)),
  );

  if (missing.length === 0) {
    writeManifest();
    console.log("atlas cropped tiles already present");
    return;
  }

  console.log(
    `atlas: ${missing.length} cropped tile(s) missing; fetching and cropping`,
  );
  await run("fetch-atlas-assets.mjs", ["--map-tiles"]);
  await run("crop-atlas-tiles.mjs");

  if (process.env.VERCEL) {
    // The UI prefers cropped/ over source/. Dropping source keeps the
    // Vercel upload to the tiles the map actually serves (~37MB).
    removeSourceImages();
  }

  writeManifest();

  const stillMissing = required.filter(
    (name) => !fs.existsSync(path.join(CROPPED, name)),
  );
  if (stillMissing.length) {
    console.warn(
      `atlas: still missing cropped tiles: ${stillMissing.join(", ")}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  try {
    writeManifest();
  } catch (writeErr) {
    console.error(writeErr);
  }
  // Do not fail the app build if the Guild site is unreachable.
  process.exit(0);
});
