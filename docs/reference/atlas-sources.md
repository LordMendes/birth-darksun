# Atlas sources

| Source | URL | Use |
| --- | --- | --- |
| Athasian Cartographers' Guild | https://ds.daegmorgan.net/worldmaps.php | WTM/SRM/LRM tiles, grid borders |
| Digital Wanderer atlas | https://www.digitalwanderer.net/darksun/ | 74 POI coordinates and summaries |
| Athas.org distance calculator | https://athas.org/tools/distance | Trade-route graph (2e miles) |

## Local cache

Map PNGs are fetched to `web/public/atlas/source/` (gitignored). From the repo root:

```bash
pnpm atlas:fetch
pnpm atlas:crop
```

`atlas:crop` strips the Guild left-hand legend and white padding so markers sit on the painted geography. The atlas UI shows that legend as a collapsible tray.

## Attribution

Dark Sun © Wizards of the Coast. Guild maps © Raven Daegmorgan / Wild Hunt Studios. Wanderer atlas © Randy Ostridge.
