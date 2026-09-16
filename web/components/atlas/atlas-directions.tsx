"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TradeGraph, TravelSpeed } from "@/lib/atlas/types";
import { computeRoute } from "@/lib/atlas/dijkstra";

export type DirectionsResult = {
  originId: string;
  destId: string;
  speed: TravelSpeed;
  route: NonNullable<ReturnType<typeof computeRoute>>;
};

type Props = {
  graph: TradeGraph;
  onRoute: (result: DirectionsResult | null) => void;
};

export function AtlasDirections({ graph, onRoute }: Props) {
  const [open, setOpen] = useState(false);
  const [originId, setOriginId] = useState("");
  const [destId, setDestId] = useState("");
  const [speed, setSpeed] = useState<TravelSpeed>(30);
  const rootRef = useRef<HTMLDivElement>(null);

  const nodes = useMemo(
    () => [...graph.nodes].sort((a, b) => a.name.localeCompare(b.name, "en")),
    [graph.nodes],
  );

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function calculate() {
    if (!originId || !destId) {
      onRoute(null);
      return;
    }
    const route = computeRoute(graph, originId, destId, speed);
    if (!route) {
      onRoute(null);
      return;
    }
    onRoute({ originId, destId, speed, route });
    setOpen(false);
  }

  return (
    <div className="atlas-directions" ref={rootRef}>
      <button
        type="button"
        className="atlas-directions-toggle"
        aria-expanded={open}
        aria-controls="atlas-directions-panel"
        onClick={() => setOpen((value) => !value)}
      >
        Directions
      </button>
      {open ? (
        <div id="atlas-directions-panel" className="atlas-directions-popover">
          <p className="muted atlas-directions-hint">
            Plan travel along known trade routes.
          </p>
          <div className="atlas-directions-fields">
            <label>
              Origin
              <select
                aria-label="Origin"
                className="ui-select"
                value={originId}
                onChange={(event) => setOriginId(event.target.value)}
              >
                <option value="">Choose origin</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Destination
              <select
                aria-label="Destination"
                className="ui-select"
                value={destId}
                onChange={(event) => setDestId(event.target.value)}
              >
                <option value="">Choose destination</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </label>
            <fieldset>
              <legend>Speed</legend>
              <div className="atlas-speed-options">
                {([20, 30, 40, 50] as TravelSpeed[]).map((s) => (
                  <label key={s} className="atlas-speed-option">
                    <input
                      type="radio"
                      name="speed"
                      value={s}
                      checked={speed === s}
                      onChange={() => setSpeed(s)}
                    />
                    {s} ft.
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="button" className="atlas-calc-btn" onClick={calculate}>
              Calculate route
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
