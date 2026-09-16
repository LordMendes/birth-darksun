"use client";

import { useState } from "react";

const TERRAIN = [
  { name: "Mountains", color: "#6b5340" },
  { name: "Rocky badlands", color: "#c47a3a" },
  { name: "Stony barrens", color: "#d4a05a" },
  { name: "Sandy wastes", color: "#e8c46a" },
  { name: "Dust sink", color: "#c4a070" },
  { name: "Mudflats", color: "#a88858" },
  { name: "Salt flats", color: "#f3e6c0" },
  { name: "Forest", color: "#6a7a28" },
  { name: "Verdant belts", color: "#8aaa3a" },
  { name: "Lake", color: "#4aa0d0" },
  { name: "Scrub plains", color: "#e2c24a" },
  { name: "Boulder fields", color: "#c9b07a" },
  { name: "Magma caldera", color: "#c43c28" },
  { name: "Swamp", color: "#5a7a48" },
  { name: "Obsidian / black silt", color: "#2a221c" },
];

const ROUTES = [
  { name: "Road", swatch: "solid" },
  { name: "Trade route", swatch: "dashed" },
];

const SETTLEMENTS = [
  { name: "City", glyph: "city" },
  { name: "Town", glyph: "town" },
  { name: "Village", glyph: "village" },
  { name: "Fort", glyph: "fort" },
  { name: "Encampment", glyph: "camp" },
  { name: "Special interest", glyph: "star" },
  { name: "Ruins", glyph: "ruins" },
  { name: "Oasis", glyph: "oasis" },
];

function SettlementGlyph({ kind }: { kind: string }) {
  return <span className={`atlas-legend-glyph atlas-legend-glyph-${kind}`} aria-hidden />;
}

export function AtlasLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`atlas-legend ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="atlas-legend-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Legend
        <span className="atlas-legend-chevron" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      {open && (
        <div className="atlas-legend-body">
          <section>
            <h3>Terrain</h3>
            <ul className="atlas-legend-list">
              {TERRAIN.map((row) => (
                <li key={row.name}>
                  <span
                    className="atlas-legend-swatch"
                    style={{ background: row.color }}
                  />
                  {row.name}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3>Routes</h3>
            <ul className="atlas-legend-list">
              {ROUTES.map((row) => (
                <li key={row.name}>
                  <span className={`atlas-legend-route atlas-legend-route-${row.swatch}`} />
                  {row.name}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3>Settlements</h3>
            <ul className="atlas-legend-list">
              {SETTLEMENTS.map((row) => (
                <li key={row.name}>
                  <SettlementGlyph kind={row.glyph} />
                  {row.name}
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
