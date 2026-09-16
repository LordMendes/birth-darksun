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
| `factions/` | Organizations with their own agenda (houses, templars, Veiled Alliance, tribes) |
| `rules/` | 3.5 + Dark Sun mechanics in play, house rules, character creation |
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

Atlas gazetteer and interactive map (`/map`) are in progress under `world/`. Other folders appear as campaign notes land.
