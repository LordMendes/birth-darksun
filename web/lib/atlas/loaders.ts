import fs from "node:fs";
import path from "node:path";
import type {
  LocationsCatalog,
  OverlaysCatalog,
  RegionsGeoJSON,
  TradeGraph,
} from "@/lib/atlas/types";

const DATA_ROOT = path.join(process.cwd(), "data", "atlas");
const ATLAS_PUBLIC = path.join(process.cwd(), "public", "atlas");

function readJson<T>(file: string): T {
  const raw = fs.readFileSync(path.join(DATA_ROOT, file), "utf8");
  return JSON.parse(raw) as T;
}

export function getLocations(): LocationsCatalog {
  return readJson<LocationsCatalog>("locations.json");
}

export function getOverlays(): OverlaysCatalog {
  return readJson<OverlaysCatalog>("overlays.json");
}

export function getTradeGraph(): TradeGraph {
  return readJson<TradeGraph>("trade-graph.json");
}

export function getRegions(): RegionsGeoJSON {
  return readJson<RegionsGeoJSON>("regions.geojson");
}

export function resolveAtlasAssetPath(
  localPath: string | null,
  available: Set<string>,
): string | null {
  if (!localPath) return null;
  const cropped = `cropped/${path.basename(localPath).replace(/\.(jpe?g)$/i, ".png")}`;
  if (available.has(cropped)) return cropped;
  if (available.has(localPath)) return localPath;
  return null;
}

export function getAvailableAtlasPaths(): Set<string> {
  const fromDisk = new Set<string>();
  for (const folder of ["source", "cropped"] as const) {
    const dir = path.join(ATLAS_PUBLIC, folder);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (/\.(png|jpe?g|webp)$/i.test(name)) fromDisk.add(`${folder}/${name}`);
    }
  }

  const paths = new Set<string>(fromDisk);
  const manifestPath = path.join(DATA_ROOT, "available-assets.json");
  if (fs.existsSync(manifestPath)) {
    const manifest = readJson<{ paths: string[] }>("available-assets.json");
    for (const p of manifest.paths) {
      // Locally, public/atlas is on disk — ignore a stale committed manifest.
      // On Vercel the lambda often has no public files; trust the build
      // manifest so ImageOverlay URLs match the CDN copies of those PNGs.
      if (fromDisk.size > 0 && !fromDisk.has(p)) continue;
      paths.add(p);
    }
  }
  return paths;
}

export function hasAtlasAssets(): boolean {
  const overlays = getOverlays();
  const available = getAvailableAtlasPaths();
  return overlays.overlays.some(
    (overlay) =>
      (overlay.kind === "WTM" || overlay.id === "u-c5-last-frontier") &&
      resolveAtlasAssetPath(overlay.localPath, available) != null,
  );
}
