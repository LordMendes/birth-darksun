#!/usr/bin/env node
/**
 * Georeference Wanderer POIs and Guild overlay cells into world CRS.
 * Grid: columns C/D/E × rows 4/5/6. Cell size derived from fetched WTM pixels.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "web", "data", "atlas");
const SOURCE = path.join(ROOT, "web", "public", "atlas", "source");
const CROPPED = path.join(ROOT, "web", "public", "atlas", "cropped");

function croppedPath(localPath) {
  if (!localPath) return null;
  const name = path.basename(localPath).replace(/\.(jpe?g)$/i, ".png");
  const dest = path.join(CROPPED, name);
  return fs.existsSync(dest) ? dest : null;
}

const COL = { C: 0, D: 1, E: 2 };
const ROW = { 4: 0, 5: 1, 6: 2 };

function readImageSize(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  if (buf[0] === 0x89 && buf[1] === 0x50) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          height: buf.readUInt16BE(i + 5),
          width: buf.readUInt16BE(i + 7),
        };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

function measureCellSize(overlays) {
  const widths = [];
  const heights = [];
  for (const overlay of overlays) {
    if (overlay.kind !== "WTM" || !overlay.localPath) continue;
    const file =
      croppedPath(overlay.localPath) ??
      path.join(ROOT, "web", "public", "atlas", overlay.localPath);
    const size = readImageSize(file);
    if (!size) continue;
    widths.push(size.width);
    heights.push(size.height);
  }
  widths.sort((a, b) => a - b);
  heights.sort((a, b) => a - b);
  const mid = Math.floor(widths.length / 2);
  return {
    cellW: widths[mid] ?? 5101,
    cellH: heights[mid] ?? 3301,
  };
}

function cellBounds(gridCell, cellW, cellH) {
  const m = gridCell.match(/^U-([CDE])(\d)$/);
  if (!m) return null;
  const col = COL[m[1]];
  const row = ROW[Number(m[2])];
  const lngSw = col * cellW;
  const lngNe = (col + 1) * cellW;
  const latNe = (3 - row) * cellH;
  const latSw = latNe - cellH;
  return { sw: [latSw, lngSw], ne: [latNe, lngNe] };
}

function wtmOverlayId(overlays, cell) {
  const wtm = overlays.find((o) => o.gridCell === cell && o.kind === "WTM");
  if (wtm) return wtm.id;
  if (cell === "U-C5") return "u-c5-last-frontier";
  return null;
}

const WANDERER_SIZE = { width: 1832, height: 2400 };

/** Guild WTM glyph centers (cropped tile pixels), measured on U-D4 / U-D5. */
const GUILD_GLYPHS = {
  "fort-adros": { cell: "U-D5", px: 1333, py: 1636 },
  "fort-amber": { cell: "U-D5", px: 1465, py: 1355 },
  "fort-glamis": { cell: "U-D5", px: 1818, py: 1894 },
  "fort-holz": { cell: "U-D4", px: 3767, py: 2382 },
  "fort-isus": { cell: "U-D5", px: 1970, py: 1103 },
  "fort-klavis": { cell: "U-D5", px: 1758, py: 1490 },
  "fort-protector": { cell: "U-D4", px: 3526, py: 2128 },
  "fort-skonz": { cell: "U-D5", px: 1430, py: 1286 },
  "fort-thetis": { cell: "U-D5", px: 1366, py: 2016 },
  "fort-xalis": { cell: "U-D5", px: 2007, py: 848 },
  abalath: { cell: "U-D5", px: 1625, py: 1332 },
  altaruk: { cell: "U-D5", px: 1561, py: 1482 },
  balic: { cell: "U-D5", px: 2067, py: 1925 },
  "bitter-well": { cell: "U-D5", px: 2634, py: 851 },
  celik: { cell: "U-D5", px: 1058, py: 2278 },
  draj: { cell: "U-D5", px: 2468, py: 796 },
  eldaarich: { cell: "U-D4", px: 3642, py: 2491 },
  "graks-pool": { cell: "U-D5", px: 1650, py: 1628 },
  gulg: { cell: "U-D5", px: 1891, py: 1399 },
  kalidnay: { cell: "U-D5", px: 1270, py: 1923 },
  kurn: { cell: "U-D4", px: 3465, py: 2283 },
  "new-kurn": { cell: "U-D4", px: 3388, py: 2110 },
  nibenay: { cell: "U-D5", px: 2017, py: 1318 },
  "north-ledopolus": { cell: "U-D5", px: 1810, py: 1765 },
  raam: { cell: "U-D5", px: 2151, py: 924 },
  saragar: { cell: "U-D4", px: 2735, py: 529 },
  shazlim: { cell: "U-D5", px: 1886, py: 1068 },
  "silt-side": { cell: "U-D4", px: 3717, py: 2259 },
  "silver-spring": { cell: "U-D5", px: 1706, py: 1229 },
  "south-ledopolus": { cell: "U-D5", px: 1744, py: 1797 },
  tyr: { cell: "U-D5", px: 1300, py: 1196 },
  urik: { cell: "U-D5", px: 1725, py: 874 },
  walis: { cell: "U-D5", px: 1000, py: 2029 },
};

const OVERLAY_FOR_CELL = {
  "U-D4": "u-d4-forgotten-north",
  "U-D5": "u-d5-tablelands",
};

function tileSizeForCell(overlays, cell) {
  const overlay = overlays.find((o) => o.gridCell === cell && o.kind === "WTM");
  if (!overlay?.localPath) return null;
  const file =
    croppedPath(overlay.localPath) ??
    path.join(ROOT, "web", "public", "atlas", overlay.localPath);
  return readImageSize(file);
}

function tilePixelToWorld(gridCell, px, py, tileW, tileH, cellW, cellH) {
  const b = cellBounds(gridCell, cellW, cellH);
  const [latSw, lngSw] = b.sw;
  const [latNe, lngNe] = b.ne;
  return {
    x: lngSw + (px / tileW) * (lngNe - lngSw),
    y: latNe - (py / tileH) * (latNe - latSw),
  };
}

function solve3(Ain, bin) {
  const A = Ain.map((row, i) => [...row, bin[i]]);
  for (let i = 0; i < 3; i++) {
    let max = i;
    for (let r = i + 1; r < 3; r++) {
      if (Math.abs(A[r][i]) > Math.abs(A[max][i])) max = r;
    }
    [A[i], A[max]] = [A[max], A[i]];
    const piv = A[i][i];
    if (Math.abs(piv) < 1e-12) throw new Error("singular affine fit");
    for (let c = i; c < 4; c++) A[i][c] /= piv;
    for (let r = 0; r < 3; r++) {
      if (r === i) continue;
      const f = A[r][i];
      for (let c = i; c < 4; c++) A[r][c] -= f * A[i][c];
    }
  }
  return [A[0][3], A[1][3], A[2][3]];
}

function fitAffine(points) {
  const AtA = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const Atx = [0, 0, 0];
  const Aty = [0, 0, 0];
  for (const p of points) {
    const row = [p.from.x, p.from.y, 1];
    for (let i = 0; i < 3; i++) {
      Atx[i] += row[i] * p.to.x;
      Aty[i] += row[i] * p.to.y;
      for (let j = 0; j < 3; j++) AtA[i][j] += row[i] * row[j];
    }
  }
  const abc = solve3(AtA, Atx);
  const def = solve3(AtA, Aty);
  return { a: abc[0], b: abc[1], c: abc[2], d: def[0], e: def[1], f: def[2] };
}

function applyAffine(t, x, y) {
  return { x: t.a * x + t.b * y + t.c, y: t.d * x + t.e * y + t.f };
}

function overlayIdForWorld(world, cellW, cellH, overlays) {
  const col = Math.min(2, Math.max(0, Math.floor(world.x / cellW)));
  const fromTop = Math.min(2, Math.max(0, Math.floor((cellH * 3 - world.y) / cellH)));
  const cell = `U-${["C", "D", "E"][col]}${["4", "5", "6"][fromTop]}`;
  return wtmOverlayId(overlays, cell) ?? OVERLAY_FOR_CELL[cell] ?? null;
}

function main() {
  const locationsPath = path.join(DATA, "locations.json");
  const overlaysPath = path.join(DATA, "overlays.json");
  const regionsPath = path.join(DATA, "regions.geojson");

  const overlays = JSON.parse(fs.readFileSync(overlaysPath, "utf8"));
  const { cellW, cellH } = measureCellSize(overlays.overlays);
  console.log(`Cell size from WTMs: ${cellW}×${cellH}`);

  const tileSize = {
    "U-D4": tileSizeForCell(overlays.overlays, "U-D4"),
    "U-D5": tileSizeForCell(overlays.overlays, "U-D5"),
  };
  for (const [cell, size] of Object.entries(tileSize)) {
    if (!size) {
      console.warn(`Missing cropped tile for ${cell}; glyph snap skipped.`);
    }
  }

  function glyphWorld(id) {
    const glyph = GUILD_GLYPHS[id];
    if (!glyph) return null;
    const size = tileSize[glyph.cell];
    if (!size) return null;
    return tilePixelToWorld(
      glyph.cell,
      glyph.px,
      glyph.py,
      size.width,
      size.height,
      cellW,
      cellH,
    );
  }

  const locations = JSON.parse(fs.readFileSync(locationsPath, "utf8"));
  const controlPoints = [];
  for (const [id, glyph] of Object.entries(GUILD_GLYPHS)) {
    const place = locations.places.find((p) => p.id === id);
    if (!place?.wandererPixels) continue;
    const to = glyphWorld(id);
    if (!to) continue;
    controlPoints.push({
      id,
      from: { x: place.wandererPixels.x, y: place.wandererPixels.y },
      to,
      cell: glyph.cell,
    });
  }
  if (controlPoints.length < 3) {
    throw new Error(
      `Need at least 3 Wanderer/Guild control points, got ${controlPoints.length}`,
    );
  }
  const affine = fitAffine(controlPoints);
  let sse = 0;
  for (const p of controlPoints) {
    const got = applyAffine(affine, p.from.x, p.from.y);
    const dx = got.x - p.to.x;
    const dy = got.y - p.to.y;
    const err = Math.hypot(dx, dy);
    sse += err * err;
    console.log(
      `Control ${p.id}: residual ${err.toFixed(1)} px (Δx ${dx.toFixed(1)}, Δy ${dy.toFixed(1)})`,
    );
  }
  console.log(
    `Affine RMSE ${Math.sqrt(sse / controlPoints.length).toFixed(1)} over ${controlPoints.length} points`,
  );

  for (const place of locations.places) {
    const snapped = glyphWorld(place.id);
    if (snapped) {
      place.world = snapped;
      const cell = GUILD_GLYPHS[place.id].cell;
      place.overlayId = OVERLAY_FOR_CELL[cell] ?? place.overlayId;
      if (!place.wandererPixels) {
        place.reference = "Athasian Cartographers' Guild WTM glyph";
      }
      continue;
    }
    if (place.wandererPixels) {
      place.world = applyAffine(
        affine,
        place.wandererPixels.x,
        place.wandererPixels.y,
      );
      place.overlayId = overlayIdForWorld(
        place.world,
        cellW,
        cellH,
        overlays.overlays,
      );
    }
  }

  const extraSettlements = [
    { id: "altaruk", name: "Altaruk", kind: "village", wandererType: "Village" },
    { id: "abalath", name: "Abalath", kind: "village", wandererType: "Village" },
    { id: "balic", name: "Balic", kind: "city-state", wandererType: "City" },
    { id: "draj", name: "Draj", kind: "city-state", wandererType: "City" },
    { id: "gulg", name: "Gulg", kind: "city-state", wandererType: "City" },
    { id: "nibenay", name: "Nibenay", kind: "city-state", wandererType: "City" },
    { id: "raam", name: "Raam", kind: "city-state", wandererType: "City" },
    { id: "urik", name: "Urik", kind: "city-state", wandererType: "City" },
    { id: "fort-skonz", name: "Fort Skonz", kind: "fort", wandererType: "Fortress" },
    { id: "silver-spring", name: "Silver Spring", kind: "village", wandererType: "Village" },
    { id: "north-ledopolus", name: "North Ledopolus", kind: "village", wandererType: "Village" },
    { id: "south-ledopolus", name: "South Ledopolus", kind: "village", wandererType: "Village" },
    { id: "walis", name: "Walis", kind: "village", wandererType: "Village" },
    { id: "shazlim", name: "Shazlim", kind: "village", wandererType: "Village" },
    { id: "bitter-well", name: "Bitter Well", kind: "oasis", wandererType: "Oasis" },
    { id: "graks-pool", name: "Grak's Pool", kind: "oasis", wandererType: "Oasis" },
    { id: "fort-adros", name: "Fort Adros", kind: "fort", wandererType: "Fortress" },
    { id: "fort-amber", name: "Fort Amber", kind: "fort", wandererType: "Fortress" },
    { id: "fort-ebon", name: "Fort Ebon", kind: "fort", wandererType: "Fortress" },
    { id: "fort-glamis", name: "Fort Glamis", kind: "fort", wandererType: "Fortress" },
    { id: "fort-isus", name: "Fort Isus", kind: "fort", wandererType: "Fortress" },
    { id: "fort-klavis", name: "Fort Klavis", kind: "fort", wandererType: "Fortress" },
    { id: "fort-ral", name: "Fort Ral", kind: "fort", wandererType: "Fortress" },
    { id: "fort-thetis", name: "Fort Thetis", kind: "fort", wandererType: "Fortress" },
    { id: "fort-xalis", name: "Fort Xalis", kind: "fort", wandererType: "Fortress" },
  ];

  const existingById = new Map(locations.places.map((p) => [p.id, p]));
  for (const extra of extraSettlements) {
    const folder = extra.kind === "landmark" ? "landmarks" : "settlements";
    const world = glyphWorld(extra.id);
    const overlayId = GUILD_GLYPHS[extra.id]
      ? OVERLAY_FOR_CELL[GUILD_GLYPHS[extra.id].cell]
      : "u-d5-tablelands";
    const reference = world
      ? "Athasian Cartographers' Guild WTM glyph"
      : "Athas.org trade route graph; not labeled on Guild WTM";
    const prior = existingById.get(extra.id);
    if (prior) {
      if (!prior.wandererPixels) {
        prior.world = world;
        prior.reference = reference;
      }
      if (world) prior.overlayId = overlayId;
      continue;
    }
    locations.places.push({
      id: extra.id,
      name: extra.name,
      kind: extra.kind,
      wandererPixels: null,
      world,
      docSlug: `world/${folder}/${extra.id}`,
      overlayId,
      wandererType: extra.wandererType,
      population: null,
      summary: null,
      reference,
      labelPosition: null,
    });
  }

  locations.places.sort((a, b) => a.name.localeCompare(b.name, "en"));
  fs.writeFileSync(locationsPath, `${JSON.stringify(locations, null, 2)}\n`);

  overlays.worldBounds = { sw: [0, 0], ne: [cellH * 3, cellW * 3] };

  for (const overlay of overlays.overlays) {
    if (!overlay.gridCell) continue;
    if (overlay.kind === "WTM" || overlay.id === "u-c5-last-frontier") {
      const primary = overlay.gridCell.split(",")[0].trim();
      const b = cellBounds(primary, cellW, cellH);
      if (b) overlay.bounds = b;
      continue;
    }
    if (overlay.kind === "compilation") {
      const corners = [
        applyAffine(affine, 0, 0),
        applyAffine(affine, WANDERER_SIZE.width, 0),
        applyAffine(affine, WANDERER_SIZE.width, WANDERER_SIZE.height),
        applyAffine(affine, 0, WANDERER_SIZE.height),
      ];
      overlay.bounds = {
        sw: [
          Math.min(...corners.map((c) => c.y)),
          Math.min(...corners.map((c) => c.x)),
        ],
        ne: [
          Math.max(...corners.map((c) => c.y)),
          Math.max(...corners.map((c) => c.x)),
        ],
      };
      continue;
    }
    overlay.bounds = null;
  }

  fs.writeFileSync(overlaysPath, `${JSON.stringify(overlays, null, 2)}\n`);

  const gridCells = [
    ["u-c5", "U-C5", "U-C5 The Last Frontier"],
    ["u-c6", "U-C6", "U-C6 Misty Sea"],
    ["u-d4", "U-D4", "U-D4 Forgotten North"],
    ["u-d5", "U-D5", "U-D5 Tablelands"],
    ["u-d6", "U-D6", "U-D6 Dead Lands"],
    ["u-e4", "U-E4", "U-E4 Northern Anattan Coast"],
    ["u-e5", "U-E5", "U-E5 Anattan Coast"],
  ];

  const features = gridCells.map(([id, cell, name]) => {
    const b = cellBounds(cell, cellW, cellH);
    const [latSw, lngSw] = b.sw;
    const [latNe, lngNe] = b.ne;
    return {
      type: "Feature",
      properties: {
        id,
        name,
        kind: "grid-cell",
        overlayId: wtmOverlayId(overlays.overlays, cell),
        docSlug: `world/regions/${id}`,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lngSw, latSw],
            [lngNe, latSw],
            [lngNe, latNe],
            [lngSw, latNe],
            [lngSw, latSw],
          ],
        ],
      },
    };
  });

  const geo = { type: "FeatureCollection", features };
  fs.writeFileSync(regionsPath, `${JSON.stringify(geo, null, 2)}\n`);
  console.log("Georeferenced locations, overlays, and grid regions.");
}

main();
