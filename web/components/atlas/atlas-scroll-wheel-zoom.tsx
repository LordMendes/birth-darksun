"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Reliable scroll-wheel zoom (Leaflet handler can stay disabled on some setups). */
export function AtlasScrollWheelZoom() {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.disable();

    const container = map.getContainer();
    let accumulated = 0;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    let debounceStart = 0;

    const performZoom = (event: WheelEvent) => {
      if (accumulated === 0) return;

      const zoom = map.getZoom();
      const step = accumulated > 0 ? -1 : 1;
      const next = Math.max(
        map.getMinZoom(),
        Math.min(map.getMaxZoom(), zoom + step),
      );
      accumulated = 0;
      debounceStart = 0;

      if (next === zoom) return;

      const point = map.mouseEventToContainerPoint(
        event as unknown as MouseEvent,
      );
      map.setZoomAround(map.containerPointToLatLng(point), next);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      accumulated += event.deltaY;
      if (!debounceStart) debounceStart = Date.now();

      const wait = Math.max(
        (map.options.wheelDebounceTime ?? 40) - (Date.now() - debounceStart),
        0,
      );

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => performZoom(event), wait);
    };

    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      clearTimeout(debounceTimer);
      container.removeEventListener("wheel", onWheel);
    };
  }, [map]);

  return null;
}
