"use client";

import dynamic from "next/dynamic";
import type {
  LocationsCatalog,
  OverlaysCatalog,
  RegionsGeoJSON,
  TradeGraph,
} from "@/lib/atlas/types";

type Props = {
  locations: LocationsCatalog;
  overlays: OverlaysCatalog;
  regions: RegionsGeoJSON;
  tradeGraph: TradeGraph;
  assetsReady: boolean;
  availablePaths: string[];
  initialPlaceId?: string | null;
};

const AtlasMapClient = dynamic(
  () =>
    import("@/components/atlas/atlas-map-client").then(
      (mod) => mod.AtlasMapClient,
    ),
  {
    ssr: false,
    loading: () => <div className="atlas-loading">Loading map…</div>,
  },
);

export function AtlasMapDynamic(props: Props) {
  return <AtlasMapClient {...props} />;
}
