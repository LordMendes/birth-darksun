import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  heroicPageKind,
  parseHeroicCatalog,
  parseHeroicIndex,
  parseHeroicReligion,
} from "./parse-heroic-page.ts";

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../docs",
);

function readDoc(rel: string): string {
  return fs.readFileSync(path.join(docsRoot, rel), "utf8");
}

describe("heroicPageKind", () => {
  it("classifies heroic docs", () => {
    assert.equal(heroicPageKind("heroic/README.md"), "index");
    assert.equal(heroicPageKind("heroic/skills.md"), "catalog");
    assert.equal(heroicPageKind("heroic/religion.md"), "religion");
    assert.equal(heroicPageKind("classes/fighter.md"), null);
  });
});

describe("parseHeroicIndex", () => {
  it("parses chapter index cards", () => {
    const parsed = parseHeroicIndex(readDoc("heroic/README.md"));
    assert.equal(parsed.title, "Heroic Characteristics");
    assert.match(parsed.quote ?? "", /gith hunches before it leaps/);
    assert.equal(parsed.attribution, "The Oracle, Blue Shrine Scrolls");
    assert.equal(parsed.sections.length, 3);
    assert.equal(parsed.sections[0]?.name, "Skills");
  });
});

describe("parseHeroicCatalog", () => {
  it("splits skills tables and entries", () => {
    const parsed = parseHeroicCatalog(readDoc("heroic/skills.md"));
    assert.equal(parsed.title, "Skills");
    assert.ok(parsed.tables.some((table) => table.heading.includes("3–1")));
    assert.ok(parsed.entries.some((entry) => entry.name.startsWith("Bluff")));
    assert.ok(parsed.entries.some((entry) => entry.name.includes("Literacy")));
  });

  it("splits general feat table and descriptions", () => {
    const parsed = parseHeroicCatalog(readDoc("heroic/general-feats.md"));
    assert.equal(parsed.title, "General Feats");
    assert.ok(parsed.tables.some((table) => table.heading.includes("3–3")));
    assert.ok(parsed.entries.some((entry) => entry.name === "Ancestral Knowledge"));
    assert.ok(parsed.entries.some((entry) => entry.name === "Secular Authority"));
  });
});

describe("parseHeroicReligion", () => {
  it("groups faith entries under section headings", () => {
    const parsed = parseHeroicReligion(readDoc("heroic/religion.md"));
    assert.equal(parsed.title, "Religion");
    assert.match(parsed.intro, /true gods don't exist/);
    const elements = parsed.groups.find((group) => group.heading === "The Elements");
    assert.ok(elements);
    assert.ok(elements.entries.some((entry) => entry.name === "Air"));
    const kings = parsed.groups.find((group) => group.heading === "Sorcerer-Kings");
    assert.ok(kings);
    assert.ok(kings.entries.some((entry) => entry.name === "Kalak"));
    assert.match(parsed.tableNote, /campaign\/premise/);
  });
});
