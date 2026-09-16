# Dark Sun (D&D 3.5)

Campaign bible and table tools for a future *Dark Sun* game.

## Layout

| Path | Role |
| --- | --- |
| `docs/` | Campaign notes. Schema and conventions live in [`docs/README.md`](docs/README.md). |
| `web/` | Next.js web tools. The docs viewer reads `docs/` as a site. |

## Web tools

From the repo root, with [pnpm](https://pnpm.io/):

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000). The campaign bible viewer is at `/docs`.

```bash
pnpm build
pnpm start
pnpm lint
```
