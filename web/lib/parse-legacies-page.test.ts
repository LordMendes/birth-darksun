import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { parseLegaciesPage, splitTypicalPowers } from "./parse-legacies-page";

const fixture = `# Primordial legacies

Intro paragraph.

## Legacy kinds

Kinds table.

## The seven legacies

### Sun

Fire, radiance, and endurance.

**Origin:** Green Age fire champions.

**Who carries it:** Desert fighters.

**Mark:** Gold or amber eyes.

**On Athas:** Sun scions drink less.

**Typical powers:** Heat resistance, Solar Weapon, Sunburst.

---

### Dragon

Dragonhood and transformation.

**Origin:** Exposure to a Dragon. **Extremely rare.**

**Who carries it:** SK heirs.

**Mark:** Scale patches.

**On Athas:** A political event.

**Typical powers:** Scaled skin, Path to Dragonhood.

---

## Legacy types (ranks)

Rank text.
`;

describe("parseLegaciesPage", () => {
  it("splits intro, seven profiles, and remaining sections", () => {
    const parsed = parseLegaciesPage(fixture);
    assert.match(parsed.intro, /Intro paragraph/);
    assert.equal(parsed.profiles.length, 2);
    assert.equal(parsed.profiles[0]?.name, "Sun");
    assert.equal(parsed.profiles[0]?.kind, "Elemental");
    assert.equal(parsed.profiles[0]?.fields.length, 5);
    assert.equal(parsed.profiles[1]?.name, "Dragon");
    assert.equal(parsed.profiles[1]?.kind, "Draconic");
    assert.match(parsed.profiles[1]?.fields[0]?.body ?? "", /Extremely rare/);
    assert.match(parsed.rest, /## Legacy types \(ranks\)/);
  });

  it("parses the campaign bible file", () => {
    const file = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../docs/rules/legacies.md",
    );
    const parsed = parseLegaciesPage(fs.readFileSync(file, "utf8"));
    assert.equal(parsed.profiles.length, 7);
    assert.deepEqual(
      parsed.profiles.map((profile) => profile.name),
      ["Sun", "Storm", "Sea", "Stone", "Mind", "Defiler", "Dragon"],
    );
    for (const profile of parsed.profiles) {
      assert.equal(profile.fields.length, 5);
      assert.ok(profile.summary.length > 20);
    }
  });
});

describe("splitTypicalPowers", () => {
  it("splits comma-separated powers", () => {
    assert.deepEqual(splitTypicalPowers("Heat resistance, Solar Weapon, Sunburst."), [
      "Heat resistance",
      "Solar Weapon",
      "Sunburst",
    ]);
  });
});
