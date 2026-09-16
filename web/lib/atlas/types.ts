/** Atlas data contracts — schema freeze for Wave 0+. Do not rename fields. */

export type PlaceKind =
  | "city-state"
  | "city"
  | "village"
  | "fort"
  | "oasis"
  | "ruins"
  | "landmark"
  | "region";

export type PixelPoint = {
  x: number;
  y: number;
};

export type WorldBounds = {
  /** Leaflet Simple CRS: south-west corner [lat, lng] */
  sw: [number, number];
  /** Leaflet Simple CRS: north-east corner [lat, lng] */
  ne: [number, number];
};

export type AtlasPlace = {
  id: string;
  name: string;
  kind: PlaceKind;
  /** Wanderer atlas pixel coords (xposition, yposition from XML) */
  wandererPixels: PixelPoint | null;
  /** World CRS coords after georeference; null until Wave 2A */
  world: PixelPoint | null;
  docSlug: string | null;
  overlayId: string | null;
  /** From Wanderer XML */
  wandererType: string | null;
  population: string | null;
  summary: string | null;
  reference: string | null;
  labelPosition: "top" | "bottom" | null;
};

export type LocationsCatalog = {
  version: 1;
  era: "FY 10";
  scale: "2e-miles";
  places: AtlasPlace[];
};

export type OverlayKind = "WTM" | "SRM" | "LRM" | "inset" | "compilation";

export type OverlaySpec = {
  id: string;
  name: string;
  kind: OverlayKind;
  gridCell: string | null;
  parentId: string | null;
  sourceUrl: string | null;
  localPath: string | null;
  /** World CRS bounds; null until georeferenced */
  bounds: WorldBounds | null;
  minZoom: number;
  maxZoom: number;
  overlaps: string[];
  attribution: string;
};

export type OverlaysCatalog = {
  version: 1;
  worldBounds: WorldBounds | null;
  overlays: OverlaySpec[];
};

export type TradeNode = {
  id: string;
  name: string;
  atlasId: string | null;
};

export type TradeEdge = {
  from: string;
  to: string;
  miles: number;
};

export type TradeGraph = {
  version: 1;
  scale: "2e-miles";
  nodes: TradeNode[];
  edges: TradeEdge[];
};

export type RegionProperties = {
  id: string;
  name: string;
  kind: "grid-cell" | "geographic";
  overlayId: string | null;
  docSlug: string | null;
};

export type RegionsGeoJSON = GeoJSON.FeatureCollection<
  GeoJSON.Polygon | GeoJSON.MultiPolygon,
  RegionProperties
>;

export type TravelSpeed = 20 | 30 | 40 | 50;

export type RouteResult = {
  path: string[];
  pathNames: string[];
  miles: number;
  hours: number;
  days35: number;
};
