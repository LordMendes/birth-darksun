# Atlas sources

| Source | URL | Use |
| --- | --- | --- |
| Athasian Cartographers' Guild | https://ds.daegmorgan.net/worldmaps.php | WTM/SRM/LRM tiles, grid borders |
| Digital Wanderer atlas | https://www.digitalwanderer.net/darksun/ | 74 POI coordinates and summaries |
| Athas.org distance calculator | https://athas.org/tools/distance | Trade-route graph (2e miles) |

## Local cache

Cropped world tiles live in `web/public/atlas/cropped/` and are committed (Vercel cannot serve gitignored files). Full Guild downloads go to `web/public/atlas/source/` (gitignored). From the repo root:

```bash
pnpm atlas:fetch
pnpm atlas:crop
```

`pnpm atlas:prepare` rebuilds cropped tiles if they are missing.

`atlas:crop` strips the Guild left-hand legend and white padding so markers sit on the painted geography. The atlas UI shows that legend as a collapsible tray.

## Related

[Rules sources](rules-sources.md) — BRCS, EPH, DS3, wild talent conversions.

## Attribution

Dark Sun © Wizards of the Coast. Guild maps © Raven Daegmorgan / Wild Hunt Studios. Wanderer atlas © Randy Ostridge.
