import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  classPageKind,
  parseClassPage,
  parseClassesIndex,
} from "./parse-class-page.ts";

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../docs",
);

function readDoc(rel: string): string {
  return fs.readFileSync(path.join(docsRoot, rel), "utf8");
}

describe("classPageKind", () => {
  it("classifies class docs", () => {
    assert.equal(classPageKind("classes/README.md"), "index");
    assert.equal(classPageKind("classes/fighter.md"), "entity");
    assert.equal(classPageKind("classes/cleric-domains.md"), "domains");
    assert.equal(classPageKind("classes/templar-spells.md"), "spells");
    assert.equal(classPageKind("classes/excluded-classes.md"), "excluded");
    assert.equal(classPageKind("races/dwarf.md"), null);
  });
});

describe("parseClassPage", () => {
  it("groups fighter sections and extracts table intro", () => {
    const parsed = parseClassPage(readDoc("classes/fighter.md"));
    assert.equal(parsed.title, "Fighter");
    assert.match(parsed.quote ?? "", /wastelander can pick up a bone/);
    assert.equal(parsed.attribution, "Nikolos, human fighter");
    assert.equal(parsed.making.length, 1);
    assert.match(parsed.featuresIntro, /Hit Die.*d10/s);
    assert.ok(parsed.features.some((feature) => feature.name === "Table: The Fighter"));
    assert.deepEqual(
      parsed.play.map((section) => section.heading),
      ["Playing a Fighter", "Combat", "Advancement"],
    );
    assert.deepEqual(
      parsed.society.map((section) => section.heading),
      ["Religion", "Other classes"],
    );
    assert.match(parsed.packages, /Package 1/);
  });

  it("splits bard class features on table heading", () => {
    const parsed = parseClassPage(readDoc("classes/bard.md"));
    assert.equal(parsed.title, "Bard");
    assert.match(parsed.featuresIntro, /Hit Die.*d6/s);
    assert.ok(parsed.features.some((feature) => feature.name.includes("Athasian Bard")));
  });

  it("parses templar spell columns in features intro", () => {
    const parsed = parseClassPage(readDoc("classes/templar.md"));
    assert.equal(parsed.title, "Templar");
    assert.ok(parsed.features.some((feature) => feature.name.includes("Table 2-5")));
  });
});

describe("parseClassesIndex", () => {
  it("reads class index table and supporting pages", () => {
    const parsed = parseClassesIndex(readDoc("classes/README.md"));
    assert.equal(parsed.classes.length, 13);
    assert.equal(parsed.classes[0]?.name, "Barbarian");
    assert.equal(parsed.supporting.length, 3);
    assert.match(parsed.literacy, /illiterate/i);
  });
});
