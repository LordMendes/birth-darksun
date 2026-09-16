import { AtlasMapDynamic } from "@/components/atlas/atlas-map-dynamic";
import {
  getAvailableAtlasPaths,
  getLocations,
  getOverlays,
  getRegions,
  getTradeGraph,
  hasAtlasAssets,
} from "@/lib/atlas/loaders";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Athas atlas · Dark Sun",
  description: "Interactive map of Athas for this D&D 3.5 Dark Sun campaign.",
};

export default async function MapPage(props: PageProps<"/map">) {
  const searchParams = await props.searchParams;
  const locations = getLocations();
  const overlays = getOverlays();
  const regions = getRegions();
  const tradeGraph = getTradeGraph();
  const assetsReady = hasAtlasAssets();
  const availablePaths = [...getAvailableAtlasPaths()];
  const initialPlaceId =
    typeof searchParams.place === "string" ? searchParams.place : null;

  return (
    <main className="atlas-page">
      <AtlasMapDynamic
        locations={locations}
        overlays={overlays}
        regions={regions}
        tradeGraph={tradeGraph}
        assetsReady={assetsReady}
        availablePaths={availablePaths}
        initialPlaceId={initialPlaceId}
      />
    </main>
  );
}
