"use client";

import Link from "next/link";
import type { AtlasPlace, RegionsGeoJSON } from "@/lib/atlas/types";
import type { DirectionsResult } from "@/components/atlas/atlas-directions";

type Props = {
  place: AtlasPlace | null;
  regions: RegionsGeoJSON;
  hoverRegionId: string | null;
  directions: DirectionsResult | null;
  onClear: () => void;
};

export function AtlasPanel({
  place,
  regions,
  hoverRegionId,
  directions,
  onClear,
}: Props) {
  const hovered = hoverRegionId
    ? regions.features.find((f) => f.properties.id === hoverRegionId)
    : null;

  const hasSelection = Boolean(place || hovered || directions);

  return (
    <aside className="atlas-panel">
      <div className="atlas-panel-header">
        <h2 className="atlas-panel-title">Atlas</h2>
        {hasSelection ? (
          <button
            type="button"
            className="ui-btn ui-btn-ghost atlas-panel-close"
            onClick={onClear}
          >
            Clear
          </button>
        ) : null}
      </div>
      {directions ? (
        <div className="atlas-panel-route">
          <h3>Route</h3>
          <p className="muted">{directions.route.pathNames.join(" → ")}</p>
          <p>
            <strong>{directions.route.miles}</strong> miles ·{" "}
            <strong>{directions.route.hours}</strong> hours ·{" "}
            <strong>{directions.route.days35}</strong> days (8 h/day)
          </p>
        </div>
      ) : null}
      {place ? (
        <div className="atlas-panel-body">
          <h3>{place.name}</h3>
          {place.wandererType && <p className="muted">Type: {place.wandererType}</p>}
          {place.population && (
            <p className="muted">Population: {place.population}</p>
          )}
          {place.summary && <p>{place.summary}</p>}
          {place.docSlug && (
            <Link href={`/docs/${place.docSlug}`} className="atlas-doc-link">
              Open gazetteer →
            </Link>
          )}
        </div>
      ) : hovered ? (
        <div className="atlas-panel-body">
          <h3>{hovered.properties.name}</h3>
          {hovered.properties.docSlug && (
            <Link
              href={`/docs/${hovered.properties.docSlug}`}
              className="atlas-doc-link"
            >
              Open region page →
            </Link>
          )}
        </div>
      ) : (
        <p className="muted atlas-panel-hint">
          Search a place, click a marker, hover a region, or use Directions to
          plan travel along trade routes.
        </p>
      )}
    </aside>
  );
}
