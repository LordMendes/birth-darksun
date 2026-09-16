import type { WorldBounds } from "@/lib/atlas/types";

/** Default world extent until georeference sets overlays.json worldBounds */
export const DEFAULT_WORLD_BOUNDS: WorldBounds = {
  sw: [0, 0],
  ne: [8565, 12573],
};

export function boundsToLeaflet(bounds: WorldBounds): [[number, number], [number, number]] {
  return [bounds.sw, bounds.ne];
}

/** Wanderer atlas: Leaflet lat = 2400 - y, lng = x */
export function wandererToLeaflet(
  x: number,
  y: number,
  imageHeight = 2400,
): [number, number] {
  return [imageHeight - y, x];
}
