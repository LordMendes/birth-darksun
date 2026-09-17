import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  parseRacePage,
  parseRacesIndex,
  parseRegionsPage,
  racePageKind,
} from "./parse-race-page.ts";

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../docs",
);

function readDoc(rel: string): string {
  return fs.readFileSync(path.join(docsRoot, rel), "utf8");
}

describe("racePageKind", () => {
  it("classifies race docs", () => {
    assert.equal(racePageKind("races/README.md"), "index");
    assert.equal(racePageKind("races/dwarf.md"), "entity");
    assert.equal(racePageKind("races/region-of-origin.md"), "regions");
    assert.equal(racePageKind("races/vital-statistics.md"), "vital");
    assert.equal(racePageKind("rules/README.md"), null);
  });
});

describe("parseRacePage", () => {
  it("groups dwarf headings and extracts traits", () => {
    const parsed = parseRacePage(readDoc("races/dwarf.md"));
    assert.equal(parsed.title, "Dwarf");
    assert.match(parsed.quote ?? "", /It can't be done/);
    assert.equal(parsed.attribution, "Sha'len, Nibenese trader");
    assert.match(parsed.overview, /focus/);
    assert.deepEqual(
      parsed.culture.map((section) => section.heading),
      ["Personality", "Physical description", "Relations", "Alignment", "Lands"],
    );
    assert.deepEqual(
      parsed.beliefs.map((section) => section.heading),
      ["Magic", "Psionics", "Religion", "Language", "Names"],
    );
    assert.deepEqual(
      parsed.play.map((section) => section.heading),
      ["Adventurers", "Society", "Roleplaying suggestions"],
    );
    assert.ok(parsed.traits.length >= 10);
    assert.equal(parsed.traits[0]?.name, "+2 Constitution, −2 Charisma");
    const poison = parsed.traits.find((trait) =>
      trait.name.toLowerCase().includes("poison"),
    );
    assert.equal(poison?.body, "");
    assert.match(poison?.name ?? "", /against poison/);
    assert.match(parsed.sources, /Character races/);
  });

  it("parses every playable race file", () => {
    const files = [
      "human",
      "aarakocra",
      "dwarf",
      "elf",
      "half-elf",
      "half-giant",
      "halfling",
      "mul",
      "pterran",
      "thri-kreen",
    ];
    for (const stem of files) {
      const parsed = parseRacePage(readDoc(`races/${stem}.md`));
      assert.ok(parsed.title, stem);
      assert.ok(parsed.overview.length > 20, stem);
      assert.ok(parsed.traits.length > 0, stem);
    }
  });
});

describe("parseRacesIndex", () => {
  it("reads the playable race table", () => {
    const parsed = parseRacesIndex(readDoc("races/README.md"));
    assert.equal(parsed.races.length, 10);
    assert.equal(parsed.races[0]?.name, "Human");
    assert.equal(parsed.races[0]?.href, "human.md");
    assert.equal(parsed.supporting.length, 3);
    assert.match(parsed.intro, /Athas is a world of many races/);
  });
});

describe("parseRegionsPage", () => {
  it("reads region cards", () => {
    const parsed = parseRegionsPage(readDoc("races/region-of-origin.md"));
    assert.ok(parsed.regions.length >= 15);
    assert.equal(parsed.regions[0]?.name, "Balic");
    assert.equal(parsed.regions[0]?.fields[0]?.label, "Classes");
    assert.match(parsed.sources, /World atlas/);
  });
});
