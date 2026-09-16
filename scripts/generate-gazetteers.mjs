#!/usr/bin/env node
/**
 * Generate gazetteer markdown stubs from locations.json (sources only, no invented lore).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOCATIONS = path.join(ROOT, "web", "data", "atlas", "locations.json");
const OVERLAYS = path.join(ROOT, "web", "data", "atlas", "overlays.json");

function frontmatter(place) {
  const sources = [];
  if (place.reference) sources.push(place.reference);
  sources.push("Digital Wanderer");
  const races = "[]";
  return `---
title: ${place.name}
kind: ${place.kind}
status: canon
era: FY 10
location: Tablelands
last_updated: 2026-09-16
sources: ${JSON.stringify([...new Set(sources)])}
population: ${place.population ? JSON.stringify(place.population) : "unknown"}
races: ${races}
ruler: unknown
culture: unknown
atlas_id: ${place.id}
---

## Summary

${place.summary ?? "Unknown."}

## Government

unknown

## People

unknown

## Trade

unknown

## Sites

unknown

## Notes

${place.reference ? `Reference: ${place.reference}` : ""}

## Unknowns

- Population breakdown by race not recorded in available sources.
- Ruler and culture pending campaign sources.
`;
}

function regionPage(id, name) {
  return `---
title: ${name}
kind: region
status: canon
era: FY 10
location: Athas
last_updated: 2026-09-16
sources: ["Athasian Cartographers' Guild"]
population: unknown
races: []
ruler: unknown
culture: unknown
atlas_id: ${id}
---

## Summary

Grid region ${name} per the [Athasian Cartographers' Guild](https://ds.daegmorgan.net/worldmaps.php).

## Borders

Borders follow the Guild world tile grid cell for this region.

## Sites

See linked settlement and landmark pages in this campaign bible.

## Unknowns

- Detailed gazetteer text pending table sources.
`;
}

function main() {
  const locations = JSON.parse(fs.readFileSync(LOCATIONS, "utf8"));
  const overlays = JSON.parse(fs.readFileSync(OVERLAYS, "utf8"));

  for (const place of locations.places) {
    if (!place.docSlug) continue;
    const file = path.join(ROOT, "docs", `${place.docSlug}.md`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, frontmatter(place));
    }
  }

  const regionIds = [
    ["u-c5", "U-C5 The Last Frontier"],
    ["u-c6", "U-C6 Misty Sea and Western Obsidian Plains"],
    ["u-d4", "U-D4 Forgotten North"],
    ["u-d5", "U-D5 Tablelands"],
    ["u-d6", "U-D6 Dead Lands"],
    ["u-e4", "U-E4 Northern Anattan Coast"],
    ["u-e5", "U-E5 Anattan Coast and Spiral Lands"],
  ];

  for (const overlay of overlays.overlays) {
    if (overlay.kind === "SRM" || overlay.kind === "LRM") {
      const id = overlay.id;
      const file = path.join(ROOT, "docs", "world", "regions", `${id}.md`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, regionPage(id, overlay.name));
      }
    }
  }

  for (const [id, name] of regionIds) {
    const file = path.join(ROOT, "docs", "world", "regions", `${id}.md`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, regionPage(id, name));
    }
  }

  const travel = path.join(ROOT, "docs", "world", "travel", "trade-routes.md");
  fs.mkdirSync(path.dirname(travel), { recursive: true });
  if (!fs.existsSync(travel)) {
    fs.writeFileSync(
      travel,
      `# Trade routes and distance

Distances follow the **2e major trade routes** used by the [Athas.org distance calculator](https://athas.org/tools/distance).

## Rules

- Routes use mapped trade roads only, not crow-flies desert travel.
- Miles are 2e Tablelands miles.
- Travel time uses terrain modifier **0.75** (average of highway and trackless desert per Gab / Athas.org).
- Hours = miles ÷ (speed factor × 0.75). Speed factors: 20 ft = 2, 30 ft = 3, 40 ft = 4, 50 ft = 5.
- 3.5 overland days assume **8-hour** travel days.

## Source

Distance data: Chay0s and Bobby Stewart; web tool by Gabriel Cormier (Athas.org).

## Calculator

Use the **Directions** panel on [\`/map\`](/map).
`,
    );
  }

  const sources = path.join(ROOT, "docs", "reference", "atlas-sources.md");
  fs.mkdirSync(path.dirname(sources), { recursive: true });
  if (!fs.existsSync(sources)) {
    fs.writeFileSync(
      sources,
      `# Atlas sources

| Source | URL | Use |
| --- | --- | --- |
| Athasian Cartographers' Guild | https://ds.daegmorgan.net/worldmaps.php | WTM/SRM/LRM tiles, grid borders |
| Digital Wanderer atlas | https://www.digitalwanderer.net/darksun/ | 74 POI coordinates and summaries |
| Athas.org distance calculator | https://athas.org/tools/distance | Trade-route graph (2e miles) |

## Local cache

Map PNGs are fetched to \`web/public/atlas/source/\` (gitignored). Run \`node scripts/fetch-atlas-assets.mjs\` from the repo root.

## Attribution

Dark Sun © Wizards of the Coast. Guild maps © Raven Daegmorgan / Wild Hunt Studios. Wanderer atlas © Randy Ostridge.
`,
    );
  }

  console.log("Gazetteer stubs generated.");
}

main();
