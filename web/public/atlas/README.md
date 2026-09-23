# Atlas asset cache (gitignored)

Fetched map PNGs and generated XYZ tiles live here. They are **not** committed to the repo. Production builds populate `cropped/` via `pnpm atlas:prepare` (wired into `web` `pnpm build`).

## Populate

From the repo root:

```bash
node scripts/fetch-atlas-assets.mjs
node scripts/crop-atlas-tiles.mjs
node scripts/build-atlas-tiles.mjs
```

Or `pnpm atlas:prepare` (map tiles only, skips work when cropped files already exist).

## Layout

- `source/` — downloaded Guild and Wanderer images
- `cropped/` — legend/padding stripped (run `pnpm atlas:crop`)
- `tiles/` — pyramid tiles per overlay id

## Attribution

Dark Sun © Wizards of the Coast. Guild maps © Raven Daegmorgan / Wild Hunt Studios. Wanderer atlas © Randy Ostridge.
