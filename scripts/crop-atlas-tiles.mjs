#!/usr/bin/env node
/**
 * Crop Guild WTM padding and the left legend strip so only painted geography remains.
 * Writes to web/public/atlas/cropped/ (gitignored). Originals stay in source/.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OVERLAYS = path.join(ROOT, "web", "data", "atlas", "overlays.json");
const SOURCE = path.join(ROOT, "web", "public", "atlas", "source");
const CROPPED = path.join(ROOT, "web", "public", "atlas", "cropped");
const MANIFEST = path.join(ROOT, "web", "data", "atlas", "available-assets.json");
const META = path.join(ROOT, "web", "data", "atlas", "crop-meta.json");

const requireFromWeb = createRequire(path.join(ROOT, "web", "package.json"));

function isWhite(r, g, b) {
  return r > 246 && g > 246 && b > 246;
}

function dist(a, b) {
  return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
}

function pixel(data, info, x, y) {
  const i = (y * info.width + x) * info.channels;
  return { r: data[i], g: data[i + 1], b: data[i + 2] };
}

function columnStats(data, info, x, y0, y1, legendBg) {
  let legendish = 0;
  let mapish = 0;
  let samples = 0;
  for (let y = y0; y < y1; y += 8) {
    const p = pixel(data, info, x, y);
    samples++;
    const dark = p.r + p.g + p.b < 210;
    if (isWhite(p.r, p.g, p.b) || dist(p, legendBg) < 70 || dark) legendish++;
    else mapish++;
  }
  return { legendish, mapish, samples, mapRatio: mapish / Math.max(1, samples) };
}

function colNonWhiteRatio(data, info, x, y0, y1) {
  let n = 0;
  let samples = 0;
  for (let y = y0; y <= y1; y += 8) {
    const p = pixel(data, info, x, y);
    samples++;
    if (!isWhite(p.r, p.g, p.b)) n++;
  }
  return n / Math.max(1, samples);
}

function rowNonWhiteRatio(data, info, y, x0, x1) {
  let n = 0;
  let samples = 0;
  for (let x = x0; x <= x1; x += 8) {
    const p = pixel(data, info, x, y);
    samples++;
    if (!isWhite(p.r, p.g, p.b)) n++;
  }
  return n / Math.max(1, samples);
}

/** Walk inward while the edge is padding: white, or a thin dark frame around a white band. */
function trimWhiteBox(data, info, box, minContent = 0.12) {
  let { left, top, right, bottom } = box;
  const frameMax = 28;
  const look = 48;

  const skipCol = (x, dir) => {
    const ratio = colNonWhiteRatio(data, info, x, top, bottom);
    if (ratio < minContent) return true;
    const innerX = x + dir * look;
    if (innerX <= left || innerX >= right) return false;
    return colNonWhiteRatio(data, info, innerX, top, bottom) < minContent;
  };
  const skipRow = (y, dir) => {
    const ratio = rowNonWhiteRatio(data, info, y, left, right);
    if (ratio < minContent) return true;
    const innerY = y + dir * look;
    if (innerY <= top || innerY >= bottom) return false;
    return rowNonWhiteRatio(data, info, innerY, left, right) < minContent;
  };

  let frame = 0;
  while (left < right - 80 && skipCol(left, 1) && frame < 4000) {
    if (colNonWhiteRatio(data, info, left, top, bottom) >= minContent) frame++;
    else frame = 0;
    if (frame > frameMax && colNonWhiteRatio(data, info, left + look, top, bottom) >= minContent) break;
    left += 1;
  }
  frame = 0;
  while (right > left + 80 && skipCol(right, -1) && frame < 4000) {
    if (colNonWhiteRatio(data, info, right, top, bottom) >= minContent) frame++;
    else frame = 0;
    if (frame > frameMax && colNonWhiteRatio(data, info, right - look, top, bottom) >= minContent) break;
    right -= 1;
  }
  frame = 0;
  while (top < bottom - 80 && skipRow(top, 1) && frame < 4000) {
    if (rowNonWhiteRatio(data, info, top, left, right) >= minContent) frame++;
    else frame = 0;
    if (frame > frameMax && rowNonWhiteRatio(data, info, top + look, left, right) >= minContent) break;
    top += 1;
  }
  frame = 0;
  while (bottom > top + 80 && skipRow(bottom, -1) && frame < 4000) {
    if (rowNonWhiteRatio(data, info, bottom, left, right) >= minContent) frame++;
    else frame = 0;
    if (frame > frameMax && rowNonWhiteRatio(data, info, bottom - look, left, right) >= minContent) break;
    bottom -= 1;
  }
  return { left, top, right, bottom };
}

function findWhitePad(data, info) {
  return trimWhiteBox(data, info, {
    left: 0,
    top: 0,
    right: info.width - 1,
    bottom: info.height - 1,
  });
}

function sampleLegendBg(data, info, left, top, bottom) {
  const x = Math.min(info.width - 1, left + 40);
  const ys = [];
  for (let y = top + 80; y < bottom - 80; y += 12) ys.push(y);
  const colors = ys
    .map((y) => pixel(data, info, x, y))
    .filter((p) => !isWhite(p.r, p.g, p.b) && p.r + p.g + p.b > 220);
  if (colors.length === 0) return { r: 220, g: 205, b: 195 };
  const sum = colors.reduce(
    (acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }),
    { r: 0, g: 0, b: 0 },
  );
  return {
    r: Math.round(sum.r / colors.length),
    g: Math.round(sum.g / colors.length),
    b: Math.round(sum.b / colors.length),
  };
}

function findLegendEnd(data, info, pad, legendBg) {
  const y0 = pad.top + 40;
  const y1 = pad.bottom - 40;
  const limit = Math.min(info.width - 1, pad.left + Math.floor(info.width * 0.28));
  let streak = 0;
  let end = pad.left;
  for (let x = pad.left; x < limit; x += 2) {
    const { mapRatio } = columnStats(data, info, x, y0, y1, legendBg);
    if (mapRatio > 0.42) streak += 1;
    else {
      streak = 0;
      end = x;
    }
    if (streak >= 4) {
      return Math.min(info.width - 1, end + 10);
    }
  }
  return pad.left;
}

function findInsetLegend(data, info, pad) {
  const x0 = pad.left + 8;
  const x1 = pad.left + Math.floor((pad.right - pad.left) * 0.42);
  const y0 = pad.top + 8;
  const y1 = pad.top + Math.floor((pad.bottom - pad.top) * 0.55);
  const bg = sampleLegendBg(data, info, x0, y0, y1);
  let minX = x1;
  let maxX = x0;
  let minY = y1;
  let maxY = y0;
  let hits = 0;
  for (let y = y0; y < y1; y += 3) {
    for (let x = x0; x < x1; x += 3) {
      const p = pixel(data, info, x, y);
      if (dist(p, bg) < 55 && !isWhite(p.r, p.g, p.b)) {
        hits++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const w = maxX - minX;
  const h = maxY - minY;
  if (hits < 80 || w < 80 || h < 80) return null;
  return {
    left: Math.max(0, minX - 6),
    top: Math.max(0, minY - 6),
    width: w + 12,
    height: h + 12,
    fill: pixel(
      data,
      info,
      Math.min(info.width - 1, maxX + 18),
      Math.min(info.height - 1, minY + Math.floor(h / 2)),
    ),
  };
}

async function main() {
  let sharp;
  try {
    sharp = requireFromWeb("sharp");
  } catch {
    console.error("sharp is required. From repo root: pnpm --filter web add -D sharp");
    process.exit(1);
  }

  const catalog = JSON.parse(fs.readFileSync(OVERLAYS, "utf8"));
  fs.mkdirSync(CROPPED, { recursive: true });
  const meta = {};

  const targets = catalog.overlays.filter(
    (o) =>
      o.localPath &&
      (o.kind === "WTM" || o.id === "u-c5-last-frontier") &&
      o.localPath.startsWith("source/"),
  );

  for (const overlay of targets) {
    const src = path.join(ROOT, "web", "public", "atlas", overlay.localPath);
    if (!fs.existsSync(src)) {
      console.warn(`skip missing ${overlay.id}`);
      continue;
    }
    const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({
      resolveWithObject: true,
    });
    const pad = findWhitePad(data, info);
    const legendBg = sampleLegendBg(data, info, pad.left, pad.top, pad.bottom);
    let left = pad.left;
    const legendEnd = findLegendEnd(data, info, pad, legendBg);
    const legendWidth = legendEnd - pad.left;
    const forceInset = overlay.id === "u-c5-last-frontier" || info.width < 2500;
    const useLeftStrip = !forceInset && legendWidth >= 160 && legendWidth <= 900;
    if (useLeftStrip) left = legendEnd;

    const trimmed = trimWhiteBox(data, info, {
      left,
      top: pad.top,
      right: pad.right,
      bottom: pad.bottom,
    });

    const extract = {
      left: trimmed.left,
      top: trimmed.top,
      width: trimmed.right - trimmed.left + 1,
      height: trimmed.bottom - trimmed.top + 1,
    };

    let pipeline = sharp(src).extract(extract);
    if (!useLeftStrip) {
      const inset = findInsetLegend(data, info, pad);
      if (inset) {
        const rel = {
          left: inset.left - extract.left,
          top: inset.top - extract.top,
          width: inset.width,
          height: inset.height,
        };
        if (
          rel.left >= 0 &&
          rel.top >= 0 &&
          rel.left + rel.width <= extract.width &&
          rel.top + rel.height <= extract.height
        ) {
          const fill = `rgb(${inset.fill.r},${inset.fill.g},${inset.fill.b})`;
          const svg = Buffer.from(
            `<svg width="${extract.width}" height="${extract.height}"><rect x="${rel.left}" y="${rel.top}" width="${rel.width}" height="${rel.height}" rx="12" fill="${fill}"/></svg>`,
          );
          pipeline = pipeline.composite([{ input: svg, blend: "over" }]);
          meta[overlay.id] = { ...extract, inset: rel, legend: "inset-covered" };
        }
      }
    }

    const destName = path.basename(overlay.localPath).replace(/\.(jpe?g)$/i, ".png");
    const dest = path.join(CROPPED, destName);
    await pipeline.png({ compressionLevel: 8 }).toFile(dest);
    if (!meta[overlay.id]) {
      meta[overlay.id] = {
        ...extract,
        legend: useLeftStrip ? "left-strip" : "padding-only",
      };
    }
    console.log(
      `${overlay.id}: ${info.width}x${info.height} -> ${extract.width}x${extract.height} (${meta[overlay.id].legend})`,
    );
  }

  fs.writeFileSync(META, `${JSON.stringify(meta, null, 2)}\n`);

  const croppedNames = fs.existsSync(CROPPED)
    ? fs.readdirSync(CROPPED).filter((n) => /\.(png|jpe?g|webp)$/i.test(n))
    : [];
  const sourceNames = fs.existsSync(SOURCE)
    ? fs.readdirSync(SOURCE).filter((n) => /\.(png|jpe?g|webp)$/i.test(n))
    : [];
  const paths = [
    ...sourceNames.map((n) => `source/${n}`),
    ...croppedNames.map((n) => `cropped/${n}`),
  ].sort();
  fs.writeFileSync(MANIFEST, `${JSON.stringify({ version: 1, paths }, null, 2)}\n`);
  console.log(`Done. ${croppedNames.length} cropped tile(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
