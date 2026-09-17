# Brth-Darksun

Working title for a **D&D 3.5 Dark Sun** campaign bible and table tools. Birthright-style legacy powers on Athas — not full domain play.

## Setting

Athas is a dying world under a crimson sun. Sorcerer-kings rule city-states. Merchant houses cross the Tablelands. Defilers drain life from the land; preservers fight to hold the line. The era is **FY 10**; travel uses the 2e Tablelands atlas and miles.

This table adds one house-rule layer on top of [Athas.org DS3](https://www.athas.org/products/ds3): **the gods of the Green Age died** at [Godshold](docs/world/landmarks/godshold.md). Something destroyed the pantheon there. The exact cause is **unknown**.

When the last gods died, no power remained to recycle life through the world. Divine essence did not vanish; it **leaked** and **fractured** into:

1. **Primordial legacies** — scion bloodlines (Sun, Storm, Sea, Stone, Mind, Defiler, Dragon)
2. **Covenant** — loyalty and recognition channeled through legacy cults and factions
3. **Source wounds** — defiling nodes, the Gray, dying oases

Athas loses a little more life every season because nothing divine remains to close the wound. Sorcerer-kings are the greatest scions. Cults remember god-portfolios, not living deities.

> The gods died at Godshold. Their power broke into **legacies** — sun, storm, stone, mind, and worse. Sorcerer-kings are the greatest scions. You carry a legacy in your blood, the Way in your mind, or both. Power taken from the world has a cost.

Full Birthright domain turns are **deferred**. Legacy powers and psionics are documented in the bible.

**Still unknown at the table:** the exact events of the Shattering; whether Athas can be saved or only delayed.

Full premise and rules: [docs/campaign/premise.md](docs/campaign/premise.md) · [docs/](docs/README.md)

## The run

Campaign notes live in `docs/`. The Next.js app in `web/` is a read-only viewer and atlas. From the repo root, with [pnpm](https://pnpm.io/):

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000):

- **Atlas** — `/map`
- **Campaign bible** — `/docs`

Other commands:

```bash
pnpm build
pnpm start
pnpm lint
```

Note schema and folder layout: [docs/README.md](docs/README.md).
