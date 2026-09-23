# Atlas assets

`cropped/` world tiles are committed so Vercel can serve `/atlas/cropped/*.png`. Full Guild downloads and generated XYZ tiles stay gitignored.

## Populate

From the repo root (full source cache, not required for the default map):

```bash
node scripts/fetch-atlas-assets.mjs
node scripts/crop-atlas-tiles.mjs
node scripts/build-atlas-tiles.mjs
```

Or `pnpm atlas:prepare` (rebuilds cropped tiles if they are missing).

## Layout

- `source/` — downloaded Guild and Wanderer images (gitignored)
- `cropped/` — legend/padding stripped; committed world tiles
- `tiles/` — pyramid tiles per overlay id (gitignored)

## Attribution

Dark Sun © Wizards of the Coast. Guild maps © Raven Daegmorgan / Wild Hunt Studios. Wanderer atlas © Randy Ostridge.
