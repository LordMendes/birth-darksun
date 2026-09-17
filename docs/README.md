# Dark Sun campaign bible (D&D 3.5)

Living documentation for a future *Dark Sun* campaign using **Dungeons & Dragons 3.5**. This folder is the table bible: what this campaign uses, changes, and remembers — not a dump of every official Athas source.

Canon is a starting point. Table rulings, house rules, and play records override sourcebooks when they conflict.

## How this repo is used

Notes are taken in conversation. The agent decides whether to update an existing file or create a new one, then checks whether the folder layout still fits the material that exists.

Do not invent lore, NPCs, or rulings. Record what was given. Mark unknowns as unknown.

The Next.js app in `web/` is a read-only view of this folder. Campaign notes stay here; do not put lore in the web app.

## Folder schema

Create a folder the first time that class of note appears. Do not add empty stubs.

| Path | What belongs there |
| --- | --- |
| `campaign/` | Premise, tone, themes, party goals, campaign-level plot |
| `sessions/` | Dated session notes, recaps, unresolved threads |
| `world/` | Athas geography: [`world/README.md`](world/README.md) indexes regions, settlements, landmarks, travel |
| `world/regions/` | Grid cells (WTM/SRM/LRM) and named lands |
| `world/settlements/` | Cities, villages, forts, oases |
| `world/landmarks/` | Ruins, shrines, terrain features |
| `world/travel/` | Trade routes and overland rules |
| `people/` | Player characters, NPCs, sorcerer-kings, templars, groups |
| `races/` | Athasian player races: culture, relations, and DS3 racial traits |
| `classes/` | Athasian character classes: DS3 v8 Chapter 2 rules and class features |
| `factions/` | Organizations with their own agenda (houses, templars, Veiled Alliance, tribes) |
| `adventures/` | Scenarios, set pieces, and planned encounters not yet tied to a session |
| `reference/` | Source list, conversions, and pointers to official material ([atlas sources](reference/atlas-sources.md)) |

If a note does not fit any row, add a folder (or a file under `docs/`) and update this table in the same change.

## File conventions

- Markdown only, one primary topic per file.
- Names: `kebab-case.md` (example: `tyrian-guard.md`).
- Session files: `YYYY-MM-DD-short-title.md` when the date is known.
- Link related pages instead of copying the same fact into several files.
- Put a short metadata block at the top of entity files (status, location, last updated, sources).

## Status

- **Campaign:** [Premise](campaign/premise.md) — gods died at the Shattering; primordial legacies and covenant
- **Rules:** [House rules](rules/README.md) — Athasian scion legacy powers, psionics (DS3 baseline + overrides)
- **Races:** [Character races](races/README.md) — DS3 v8 playable races and traits
- **Classes:** [Character classes](classes/README.md) — DS3 v8 classes, with PHB/XPH mechanics inlined where DS3 defers
- **World:** Atlas gazetteer and interactive map (`/map`) under `world/`

Browse everything at `/docs` in the web app.
