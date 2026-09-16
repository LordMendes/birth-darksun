"use client";

import L from "leaflet";
import { useCallback, useMemo, useState } from "react";
import { MapContainer, Rectangle, ScaleControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type {
  AtlasPlace,
  LocationsCatalog,
  OverlaysCatalog,
  RegionsGeoJSON,
  TradeGraph,
} from "@/lib/atlas/types";
import { boundsToLeaflet, DEFAULT_WORLD_BOUNDS } from "@/lib/atlas/crs";
import { AtlasPanel } from "@/components/atlas/atlas-panel";
import { AtlasSearch } from "@/components/atlas/atlas-search";
import {
  AtlasDirections,
  type DirectionsResult,
} from "@/components/atlas/atlas-directions";
import { AtlasMapLayers } from "@/components/atlas/atlas-map-layers";
import { AtlasScrollWheelZoom } from "@/components/atlas/atlas-scroll-wheel-zoom";
import { AtlasLegend } from "@/components/atlas/atlas-legend";

type Props = {
  locations: LocationsCatalog;
  overlays: OverlaysCatalog;
  regions: RegionsGeoJSON;
  tradeGraph: TradeGraph;
  assetsReady: boolean;
  availablePaths: string[];
  initialPlaceId?: string | null;
};

function worldToLatLng(place: AtlasPlace): [number, number] | null {
  if (!place.world) return null;
  return [place.world.y, place.world.x];
}

export function AtlasMapClient({
  locations,
  overlays,
  regions,
  tradeGraph,
  assetsReady,
  availablePaths,
  initialPlaceId = null,
}: Props) {
  const availablePathSet = useMemo(
    () => new Set(availablePaths),
    [availablePaths],
  );
  const [selectedPlace, setSelectedPlace] = useState<AtlasPlace | null>(null);
  const [hoverRegionId, setHoverRegionId] = useState<string | null>(null);
  const [activeOverlayId, setActiveOverlayId] = useState<string | null>(null);
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [showTradeEdges, setShowTradeEdges] = useState(false);

  const worldBounds = overlays.worldBounds ?? DEFAULT_WORLD_BOUNDS;
  const leafletBounds = boundsToLeaflet(worldBounds);
  const paddedMaxBounds = useMemo((): [[number, number], [number, number]] => {
    const [[latSw, lngSw], [latNe, lngNe]] = leafletBounds;
    const padLat = (latNe - latSw) * 0.6;
    const padLng = (lngNe - lngSw) * 0.6;
    return [
      [latSw - padLat, lngSw - padLng],
      [latNe + padLat, lngNe + padLng],
    ];
  }, [leafletBounds]);

  const placeByNodeId = useMemo(() => {
    const m = new Map<string, AtlasPlace>();
    for (const node of tradeGraph.nodes) {
      const place = locations.places.find(
        (p) => p.id === node.atlasId || p.id === node.id,
      );
      if (place) m.set(node.id, place);
    }
    return m;
  }, [locations.places, tradeGraph.nodes]);

  const tradePath = useMemo((): [number, number][] | null => {
    if (!directions) return null;
    const pts: [number, number][] = [];
    for (const nodeId of directions.route.path) {
      const place = placeByNodeId.get(nodeId);
      const ll = place ? worldToLatLng(place) : null;
      if (ll) pts.push(ll);
    }
    return pts.length >= 2 ? pts : null;
  }, [directions, placeByNodeId]);

  const activePlace = useMemo(() => {
    if (selectedPlace) return selectedPlace;
    if (!initialPlaceId) return null;
    return locations.places.find((p) => p.id === initialPlaceId) ?? null;
  }, [selectedPlace, initialPlaceId, locations.places]);

  const onSelectPlace = useCallback((place: AtlasPlace | null) => {
    setSelectedPlace(place);
    if (place) {
      const url = new URL(window.location.href);
      url.searchParams.set("place", place.id);
      window.history.replaceState({}, "", url);
    }
  }, []);

  const onSelectRegion = useCallback(
    (regionId: string) => {
      const feature = regions.features.find((f) => f.properties.id === regionId);
      const overlayId = feature?.properties.overlayId;
      if (overlayId) setActiveOverlayId(overlayId);
      setHoverRegionId(regionId);
    },
    [regions.features],
  );

  const onClearPanel = useCallback(() => {
    setSelectedPlace(null);
    setHoverRegionId(null);
    setDirections(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("place");
    window.history.replaceState({}, "", url);
  }, []);

  return (
    <div className="atlas-shell">
      <div className="atlas-toolbar">
        <AtlasSearch places={locations.places} onSelect={onSelectPlace} />
        <AtlasDirections
          graph={tradeGraph}
          onRoute={setDirections}
        />
        <label className="atlas-toggle-edges">
          <input
            type="checkbox"
            checked={showTradeEdges}
            onChange={(e) => setShowTradeEdges(e.target.checked)}
          />
          Trade routes
        </label>
      </div>
      <div className="atlas-main">
        <div className="atlas-map-wrap">
          {!assetsReady && (
            <div className="atlas-banner">
              Map tiles not fetched yet. Run{" "}
              <code>node scripts/fetch-atlas-assets.mjs</code> from the repo root.
            </div>
          )}
          <MapContainer
            bounds={leafletBounds}
            maxBounds={paddedMaxBounds}
            crs={L.CRS.Simple}
            minZoom={-7}
            maxZoom={8}
            scrollWheelZoom={false}
            doubleClickZoom
            zoomControl
            className="atlas-map"
          >
            <AtlasScrollWheelZoom />
            <ScaleControl imperial={false} maxWidth={120} />
            <AtlasMapLayers
              places={locations.places}
              overlays={overlays}
              regions={regions}
              activeOverlayId={activeOverlayId}
              hoverRegionId={hoverRegionId}
              onHoverRegion={setHoverRegionId}
              onSelectPlace={onSelectPlace}
              onSelectRegion={onSelectRegion}
              directions={directions}
              showTradeEdges={showTradeEdges}
              tradePath={tradePath}
              tradeGraph={tradeGraph}
              placeByNodeId={placeByNodeId}
              availablePaths={availablePathSet}
            />
            {!assetsReady && (
              <Rectangle
                bounds={leafletBounds}
                pathOptions={{
                  color: "#d4652a",
                  weight: 1,
                  fillColor: "#1c120b",
                  fillOpacity: 0.85,
                }}
              />
            )}
          </MapContainer>
          <AtlasLegend />
          <footer className="atlas-attribution">
            Dark Sun © Wizards of the Coast · Guild maps © Raven Daegmorgan / Wild Hunt
            Studios · Wanderer atlas © Randy Ostridge · Distances: Chay0s, Bobby Stewart,
            Gab / Athas.org
          </footer>
        </div>
        <AtlasPanel
          place={activePlace}
          regions={regions}
          hoverRegionId={hoverRegionId}
          directions={directions}
          onClear={onClearPanel}
        />
      </div>
    </div>
  );
}
