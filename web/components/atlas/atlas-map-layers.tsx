"use client";

import L from "leaflet";
import { useEffect } from "react";
import {
  GeoJSON,
  ImageOverlay,
  Marker,
  Polyline,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import type {
  AtlasPlace,
  OverlaysCatalog,
  RegionsGeoJSON,
  TradeGraph,
} from "@/lib/atlas/types";
import { boundsToLeaflet } from "@/lib/atlas/crs";
import type { DirectionsResult } from "@/components/atlas/atlas-directions";
import { useAtlasTheme } from "@/components/atlas/use-atlas-theme";

function overlayAssetUrl(
  localPath: string | null,
  availablePaths: Set<string>,
): string | null {
  if (!localPath) return null;
  const cropped = `cropped/${localPath.replace(/^source\//, "").replace(/\.(jpe?g)$/i, ".png")}`;
  if (availablePaths.has(cropped)) return `/atlas/${cropped}?v=4`;
  if (availablePaths.has(localPath)) return `/atlas/${localPath}?v=4`;
  return null;
}

const placeIcon = L.divIcon({
  className: "atlas-marker-dot",
  html: '<span class="atlas-marker-inner"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

type Props = {
  places: AtlasPlace[];
  overlays: OverlaysCatalog;
  regions: RegionsGeoJSON;
  activeOverlayId: string | null;
  hoverRegionId: string | null;
  onHoverRegion: (id: string | null) => void;
  onSelectPlace: (place: AtlasPlace) => void;
  onSelectRegion: (id: string) => void;
  directions: DirectionsResult | null;
  showTradeEdges: boolean;
  tradePath: [number, number][] | null;
  tradeGraph: TradeGraph;
  placeByNodeId: Map<string, AtlasPlace>;
  availablePaths: Set<string>;
};

function FitPlace({ place }: { place: AtlasPlace | null }) {
  const map = useMap();
  useEffect(() => {
    if (!place?.world) return;
    map.flyTo([place.world.y, place.world.x], map.getZoom(), { duration: 0.6 });
  }, [map, place]);
  return null;
}

export function AtlasMapLayers({
  places,
  overlays,
  regions,
  activeOverlayId,
  hoverRegionId,
  onHoverRegion,
  onSelectPlace,
  onSelectRegion,
  directions,
  showTradeEdges,
  tradePath,
  tradeGraph,
  placeByNodeId,
  availablePaths,
}: Props) {
  const theme = useAtlasTheme();

  const hasGuildTablelands =
    overlayAssetUrl("source/u-d4-forgotten-north.png", availablePaths) != null &&
    overlayAssetUrl("source/u-d5-tablelands.png", availablePaths) != null;

  const tradeEdges = showTradeEdges
    ? tradeGraph.edges.flatMap((edge) => {
        const a = placeByNodeId.get(edge.from);
        const b = placeByNodeId.get(edge.to);
        if (!a?.world || !b?.world) return [];
        return [
          [
            [a.world.y, a.world.x],
            [b.world.y, b.world.x],
          ] as [number, number][],
        ];
      })
    : [];
  const visibleOverlays = overlays.overlays.filter((o) => {
    if (!o.bounds || !overlayAssetUrl(o.localPath, availablePaths)) return false;
    if (o.kind === "compilation") return !hasGuildTablelands;
    if (activeOverlayId) return o.id === activeOverlayId;
    return o.kind === "WTM" || o.id === "u-c5-last-frontier";
  });

  return (
    <>
      {visibleOverlays.map((overlay) => {
        const bounds = boundsToLeaflet(overlay.bounds!);
        const localUrl = overlayAssetUrl(overlay.localPath, availablePaths);
        if (!localUrl) return null;
        return (
          <ImageOverlay
            key={overlay.id}
            url={localUrl}
            bounds={bounds}
            opacity={overlay.id === activeOverlayId ? 1 : 0.85}
          />
        );
      })}

      <GeoJSON
        key={hoverRegionId ?? "regions"}
        data={regions}
        style={(feature) => {
          const id = feature?.properties?.id;
          const hovered = id === hoverRegionId;
          return {
            color: hovered ? theme.sun : theme.rust,
            weight: hovered ? 2.5 : 1,
            fillColor: hovered ? theme.sun : theme.rust,
            fillOpacity: hovered ? 0.18 : 0.06,
          };
        }}
        onEachFeature={(feature, layer) => {
          layer.on({
            mouseover: () => onHoverRegion(feature.properties.id),
            mouseout: () => onHoverRegion(null),
            click: () => onSelectRegion(feature.properties.id),
          });
          layer.bindTooltip(feature.properties.name, { sticky: true });
        }}
      />

      {places
        .filter((p) => p.world)
        .map((place) => (
          <Marker
            key={place.id}
            position={[place.world!.y, place.world!.x]}
            icon={placeIcon}
            eventHandlers={{
              click: () => onSelectPlace(place),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <strong>{place.name}</strong>
              {place.wandererType && <> · {place.wandererType}</>}
              {place.population && <> · pop. {place.population}</>}
            </Tooltip>
            <Popup>
              <strong>{place.name}</strong>
              {place.summary && (
                <p style={{ maxWidth: 280, margin: "0.5rem 0" }}>
                  {place.summary.slice(0, 280)}
                  {place.summary.length > 280 ? "…" : ""}
                </p>
              )}
            </Popup>
          </Marker>
        ))}

      {tradeEdges.map((positions, i) => (
        <Polyline
          key={`edge-${i}`}
          positions={positions}
          pathOptions={{ color: theme.rust, weight: 1.5, opacity: 0.45 }}
        />
      ))}

      {tradePath && (
        <Polyline
          positions={tradePath}
          pathOptions={{ color: theme.sun, weight: 4, dashArray: "8 6" }}
        />
      )}

      {directions && (
        <FitPlace
          place={
            places.find((p) => p.id === directions.destId) ?? null
          }
        />
      )}
    </>
  );
}
