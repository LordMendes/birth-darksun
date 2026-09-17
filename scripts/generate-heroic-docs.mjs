#!/usr/bin/env node
/**
 * Generate docs/heroic/*.md from DS3 v8 Chapter 3 extract (AnyFlip text).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "docs", "heroic");
const SOURCE = path.resolve(
  "C:/Users/User/.cursor/projects/c-Users-User-Documents-darksun/agent-tools/a27e2de6-fc75-438c-9363-a9cf2e65d061.txt",
);

const CLASS_COLS = [
  "Brn",
  "Brd",
  "Clr",
  "Drd",
  "Ftr",
  "Gld",
  "Psi Ego",
  "Psi Kin",
  "Psi Nom",
  "Psi Ser",
  "Psi Shp",
  "Psi Tel",
  "PsW",
  "Rgr",
  "Rog",
  "Tmp",
  "Wld",
  "Wiz",
];

/** Book-order feat names per summary table (DS3 v8 Chapter 3). */
const TABLE_FEAT_NAMES = {
  3: [
    "Ancestral Knowledge",
    "Arena Clamor",
    "Brutal Attack",
    "Bug Trainer",
    "Commanding Presence",
    "Concentrated Fire",
    "Cornered Fighter",
    "Defender of the Land",
    "Dissimulate",
    "Drake's Child",
    "Elemental Cleansing",
    "Faithful Follower",
    "Fearsome",
    "Field Officer",
    "Greasing the Wheels",
    "Hard as Rock",
    "Implacable Defender",
    "Improved Familiar",
    "Improved Sigil",
    "Improviser",
    "Innate Hunter",
    "Intimidating Presence",
    "Inspiring Presence",
    "Kiltektet",
    "Linguist",
    "Mastyrial Blood",
    "Path Dexter",
    "Path Sinister",
    "Protective",
    "Psionic Mimicry",
    "Psionic Schooling",
    "Raised by Beasts",
    "Rotate Lines",
    "Secular Authority",
    "Favorite",
    "Shield Wall",
    "Sniper",
    "Spear Wall",
    "Tactical Expertise",
    "Teamwork",
    "Trader",
    "Wastelander",
  ],
  4: [
    "Elemental Affinity",
    "Elemental Might",
    "Elemental Vengeance",
    "Superior Blessing",
  ],
  5: [
    "Elemental Manifestation",
    "Focused Mind",
    "Improved Hidden Talent",
    "Greater Hidden Talent",
    "Improved Dwarven Focus",
    "Improved Elf Run",
    "Jump Charge",
    "Pterran Telepathy",
  ],
  6: [
    "Agonizing Radius",
    "Sickening Raze",
    "Controlled Raze",
    "Distance Raze",
    "Destructive Raze",
    "Efficient Raze",
    "Exterminating Raze",
    "Fast Raze",
  ],
  7: [
    "Active Glands",
    "Advanced Antennae",
    "Blend",
    "Blessed by the Ancestors",
    "Cannibalism Ritual",
    "Tikchak",
    "Dwarven Vision",
    "Elfeater",
    "Improved Gyth'sa",
    "Tokchak",
  ],
  8: [
    "Artisan",
    "Astrologer",
    "Companion",
    "Disciplined",
    "Freedom",
    "Giant Killer",
    "Jungle Fighter",
    "Legerdemain",
    "Mansabdar",
    "Mekillothead",
    "Metalsmith",
    "Nature's Child",
    "Paranoid",
    "Performance Artist",
    "Tarandan Method",
  ],
};

const SKILL_NAMES = [
  "Appraise",
  "Autohypnosis",
  "Balance",
  "Bluff",
  "Climb",
  "Concentration",
  "Craft (Alchemy)",
  "Craft",
  "Decipher Script",
  "Diplomacy",
  "Disable Device",
  "Disguise",
  "Escape Artist",
  "Forgery",
  "Gather Info.",
  "Handle Animal",
  "Heal",
  "Hide",
  "Intimidate",
  "Jump",
  "Know. (Anc. Hist.)",
  "Know. (Arcana)",
  "Know. (Arch., Eng.)",
  "Know. (Dung.)",
  "Know. (Geo.)",
  "Know. (History)",
  "Know. (Local)",
  "Know. (Nature)",
  "Know. (Nob., Roy.)",
  "Know. (Psionics)",
  "Know. (Religion)",
  "Know. (The Planes)",
  "Know. (Warcraft)",
  "Listen",
  "Literacy",
  "Move Silently",
  "Open Lock",
  "Perform",
  "Profession",
  "Psicraft",
  "Ride",
  "Search",
  "Sense Motive",
  "Sleight of Hand",
  "Speak Language",
  "Spellcraft",
  "Spot",
  "Survival",
  "Swim",
  "Tumble",
  "Use Magic Device",
  "Use Psionic Device",
  "Use Rope",
];

const FEAT_CATEGORIES = [
  {
    file: "general-feats.md",
    title: "General Feats",
    start: "General Feats",
    end: "Divine Feats",
    table: 3,
    intro: null,
    extraNames: ["Gladiatorial Entertainer"],
  },
  {
    file: "divine-feats.md",
    title: "Divine Feats",
    start: "Divine Feats",
    end: "Item Creation Feats",
    table: 4,
    intro:
      "Divine feats can be selected only by characters with the ability to turn or rebuke undead.",
    extraNames: [],
  },
  {
    file: "item-creation.md",
    title: "Item Creation Feats",
    start: "Item Creation Feats",
    end: "Psionic Feats",
    table: null,
    intro: null,
    extraNames: ["Brew Potion", "Scribe Scroll"],
  },
  {
    file: "psionic-feats.md",
    title: "Psionic Feats",
    start: "Psionic Feats",
    end: "Raze Feats",
    table: 5,
    intro: "Psionic feats can be selected only by those with the psionic subtype.",
    extraNames: [],
    sidebar:
      "Behind the Veil: Hidden Talents The Hidden Talent feat (XPH 67) can replace the Wild Talent feat found in the same book, since Athas can be considered a high-psionic world, if the DM allows it.",
  },
  {
    file: "raze-feats.md",
    title: "Raze Feats",
    start: "Raze Feats",
    end: "Racial Feats",
    table: 6,
    intro:
      "Raze feats are feats that require an arcane spellcaster to be a defiler. They can only be applied when defiling. Multiple raze feats can be applied simultaneously. For example, a defiler who has Distance Raze, Destructive Raze, and Fast Raze can benefit from all of them when casting a single spell. A wizard's bonus feats can be used to acquire Raze feats if the wizard fulfills the feat prerequisites.",
    extraNames: [],
  },
  {
    file: "racial-feats.md",
    title: "Racial Feats",
    start: "Racial Feats",
    end: "Regional Feats",
    table: 7,
    intro: "Racial feats can be selected only by characters of a certain race.",
    extraNames: [],
  },
  {
    file: "regional-feats.md",
    title: "Regional Feats",
    start: "Regional Feats",
    end: "Religion On Athas",
    table: 8,
    intro: null,
    extraNames: [],
  },
];

const RELIGION_GROUPS = [
  {
    heading: "Introduction",
    entries: [],
    endAt: "The Elements",
  },
  {
    heading: "The Elements",
    entries: ["Air", "Earth", "Fire", "Water"],
    endAt: "The Paraelements",
  },
  {
    heading: "The Paraelements",
    entries: ["Magma", "Rain", "Silt", "Sun"],
    endAt: "Nature",
  },
  {
    heading: "Nature",
    entries: [],
    endAt: "The Sorcerer-Kings",
  },
  {
    heading: "Sorcerer-Kings",
    entries: [
      "Abalach-Re",
      "Andropinis",
      "Borys",
      "Daskinor",
      "Dregoth",
      "Hamanu",
      "Kalak",
      "Lalali-Puy",
      "Nibenay",
      "Oronis",
      "Tectuktitlay",
    ],
    endAt: "Other Religions",
  },
  {
    heading: "Other Religions",
    entries: [
      "Coraanu Star Racer",
      "The Cerulean Storm",
      "The Great One",
      "The Earth Mother",
      "Astrology",
      "The Old Gods",
    ],
    endAt: null,
  },
];

function loadChapter3() {
  const raw = fs.readFileSync(SOURCE, "utf8");
  const start = raw.indexOf("Chapter 3:");
  if (start < 0) throw new Error("Chapter 3 not found in source extract");
  const end = raw.indexOf("Pages:", start);
  return raw
    .slice(start, end > start ? end : undefined)
    .replace(/\s+Dark Sun 3\.5e Core Rulebook – V8 \d+/g, "\n\n")
    .replace(/\u2013/g, "–")
    .replace(/\u2014/g, "—")
    .replace(/\u2019/g, "'")
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"')
    .trim();
}

function frontmatter({ title, kind }) {
  return `---
title: ${title}
kind: ${kind}
status: canon
last_updated: 2026-09-17
sources: ["Athas.org DS3 v8"]
---

`;
}

function slug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractTable(ch3, num) {
  const re = new RegExp(`Table 3–${num}:([^]*?)(?=Table 3–|$)`);
  const m = ch3.match(re);
  return m ? m[1].trim() : "";
}

function stripTableFootnotes(body) {
  return body
    .replace(/\s+\d+\.?\s+You must expend your psionic focus[\s\S]*?(?=Behind the Veil|$)/, "")
    .replace(/\s+\d+\.?\s+You must be psionically focused[\s\S]*?(?=Behind the Veil|$)/, "")
    .replace(/\s+Behind the Veil:[\s\S]*$/, "")
    .replace(/\s+\d+\s+A fighter may select[\s\S]*$/, "")
    .replace(/\s+\d+\s+You can gain this feat[\s\S]*$/, "")
    .replace(/\s+\d+\s+You can gain[\s\S]*$/, "")
    .trim();
}

function findNextInText(text, name, fromIndex) {
  const idx = text.indexOf(name, fromIndex);
  return idx >= 0 ? idx : text.length;
}

function splitPrereqBenefitSummary(summary) {
  const markers = ["—", "Int ", "Cha ", "Str ", "Wis ", "Dex ", "Con ", "Handle ", "Ability ", "Access ", "Defiler", "Thri-kreen", "Base attack", "Wild shape", "Sigil ", "Track", "Diplomacy", "Bluff ", "Preserver", "Perform", "Improved ", "Power Attack", "Extra Turning", "Negotiator", "Diehard", "Shield ", "Hide ", "Halfling", "Dwarf", "Elf", "Mul ", "Nibenay", "Draj", "Kurn ", "Tyr ", "Gulg", "Raam", "Urik", "Sea of", "Forest ", "Gladiator", "Character level", "Manifester", "Pterran", "Psionic Fist", "Jump ", "missive ", "Agonizing", "Salt View", "Balic", "Eldaarich", "Preserver.", "Defiler."];
  let prereq = summary;
  let benefit = "";
  for (const marker of markers) {
    const idx = summary.indexOf(marker);
    if (idx > 0) {
      prereq = summary.slice(0, idx).trim();
      benefit = summary.slice(idx).trim();
      break;
    }
  }
  return { prereq, benefit };
}

function parseFeatTableRows(tableText, tableNum) {
  const names = TABLE_FEAT_NAMES[tableNum];
  if (!tableText || !names?.length) return [];
  let body = tableText.replace(/^[\s\S]*?Feat Prerequisites Benefits\s*/i, "");
  body = stripTableFootnotes(body);
  const rows = [];
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const start = body.indexOf(name);
    if (start < 0) continue;
    const end = findNextInText(body, names[i + 1], start + name.length);
    let chunk = body.slice(start, end).trim();
    chunk = chunk.replace(new RegExp(`^${name}\\d?\\s*`), "");
    let summary = chunk.trim();
    for (const other of names) {
      if (other === name) continue;
      const cut = summary.indexOf(` ${other} `);
      if (cut > 0) {
        summary = summary.slice(0, cut).trim();
        break;
      }
    }
    const descCut = summary.search(
      /\b(You |Your |The |Benefits:|Prerequisites:|Normal:|Special:)/,
    );
    if (descCut > 0) summary = summary.slice(0, descCut).trim();
    const { prereq, benefit } = splitPrereqBenefitSummary(summary);
    rows.push({ name, prereq, benefit, summary });
  }
  return rows;
}

function featNameVariants(name) {
  return [
    name,
    name.replace(/-/g, "–"),
    name.replace(/–/g, "-"),
    name.replace("Drake's", "Drake's").replace("Drake's", "Drake's"),
  ];
}

const FEAT_DESC_FOLLOWERS = [
  "You ",
  "The ",
  "Your ",
  "As ",
  "Choose ",
  "With ",
  "When ",
  "Once ",
  "If ",
  "While ",
  "All ",
  "Each ",
  "Any ",
  "One ",
  "In ",
  "Due ",
  "Plant ",
  "Creatures ",
  "Undead ",
  "Can ",
  "May ",
  "Must ",
  "Have ",
  "Are ",
  "Add ",
  "Gain ",
  "Get ",
  "Use ",
  "Make ",
  "Spend ",
  "Receive ",
];

function findDescriptionStart(text, name) {
  const variants = featNameVariants(name);
  let best = null;
  for (const variant of variants) {
    for (const follow of FEAT_DESC_FOLLOWERS) {
      const needle = `${variant} ${follow}`;
      let from = 0;
      while (from < text.length) {
        const idx = text.indexOf(needle, from);
        if (idx < 0) break;
        if (!best || idx > best.idx) best = { idx, len: variant.length };
        from = idx + needle.length;
      }
    }
  }
  return best;
}

function parseFeatDescriptions(sectionText, names) {
  const text = sectionText
    .replace(
      /Terrain Type Examples Survival DC Modifier[\s\S]*?(?=Table 3–|[A-Z][a-z]+ )/,
      "\n",
    )
    .replace(/Behind the Veil:[\s\S]*?(?=\n\n|$)/, "\n");

  const positions = [];
  for (const name of names) {
    const hit = findDescriptionStart(text, name);
    if (hit) positions.push({ name, idx: hit.idx, len: hit.len });
  }
  positions.sort((a, b) => a.idx - b.idx);

  return positions.map((p, i) => {
    const end = positions[i + 1]?.idx ?? text.length;
    const body = text.slice(p.idx + p.len, end).trim();
    return { name: p.name, body };
  });
}

function cleanFeatBody(body) {
  return body
    .replace(/Terrain Type Examples[\s\S]*?(?=Table 3–|$)/, "")
    .replace(
      /\s*Abundant Forests, oceans, gardens \+0[\s\S]*?Void Obsidian Plains \+25/,
      "",
    )
    .replace(/\s*Table 3–\d+:[\s\S]*$/, "")
    .replace(/\s+\d+\s+A fighter may select[\s\S]*$/, "")
    .replace(/\s+\d+\s+You can gain this feat[\s\S]*$/, "")
    .trim();
}

function splitPrereqBenefit(body) {
  const prereqIdx = body.indexOf("Prerequisites:");
  const prereqIdxAlt = body.indexOf("Prerequisite:");
  const benefitIdx = body.indexOf("Benefits:");
  const benefitIdxAlt = body.indexOf("Benefit:");
  if (prereqIdx >= 0 || prereqIdxAlt >= 0) {
    const p = prereqIdx >= 0 ? prereqIdx : prereqIdxAlt;
    const flavor = body.slice(0, p).trim();
    const rest = body.slice(p).trim();
    return flavor ? `${flavor}\n\n${rest}` : rest;
  }
  if (benefitIdx >= 0 || benefitIdxAlt >= 0) {
    const b = benefitIdx >= 0 ? benefitIdx : benefitIdxAlt;
    const flavor = body.slice(0, b).trim();
    const rest = body.slice(b).trim();
    return flavor ? `${flavor}\n\n${rest}` : rest;
  }
  return body.trim();
}

function extractPrereqBenefitFromBody(body) {
  const cleaned = cleanFeatBody(body);
  const prereqMatch = cleaned.match(
    /Prerequisites?:\s*([\s\S]*?)(?:\.\s*(?:Benefits?:|Benefit:|Normal:|Special:)|$)/i,
  );
  const benefitMatch = cleaned.match(
    /Benefits?:\s*([\s\S]*?)(?:\.\s*(?:Normal:|Special:)|$)/i,
  );
  const prereq = prereqMatch?.[1]?.replace(/\.\s*$/, "").trim() || "—";
  const benefit = benefitMatch?.[1]?.replace(/\.\s*$/, "").trim() || "";
  return { prereq, benefit };
}

function buildTableRowsFromDescriptions(names, descByName) {
  return names
    .filter((name) => descByName.has(name))
    .map((name) => {
      const { prereq, benefit } = extractPrereqBenefitFromBody(
        descByName.get(name),
      );
      return { name, prereq, benefit };
    });
}

function formatFeatTableMarkdown(tableNum, title, rows) {
  if (!rows.length) return "";
  const lines = [
    `## Table 3–${tableNum}: ${title}`,
    "",
    "| Feat | Prerequisites | Benefits |",
    "| --- | --- | --- |",
  ];
  for (const row of rows) {
    const prereq = (row.prereq ?? "—").replace(/\|/g, "\\|");
    const benefit = (row.benefit ?? row.summary ?? "").replace(/\|/g, "\\|");
    lines.push(`| ${row.name} | ${prereq} | ${benefit} |`);
  }
  lines.push("");
  return lines.join("\n");
}

function parseTable31(ch3) {
  const block = extractTable(ch3, 1);
  let body = block.replace(/^[\s\S]*?WizAbil\s*/, "");
  const footnoteMatch = body.match(
    /\*\*Additional details in Dark Sun 3 Rulebook[\s\S]*?x2 for Swim/,
  );
  const footnotes = footnoteMatch
    ? footnoteMatch[0]
        .replace(/\*\*Additional details in Dark Sun 3 Rulebook\s*/, "")
        .trim()
    : "";
  body = body.replace(/\*\*Additional details[\s\S]*$/, "").trim();

  const rows = [];
  let cursor = 0;
  for (let i = 0; i < SKILL_NAMES.length; i++) {
    const name = SKILL_NAMES[i];
    const start = body.indexOf(name, cursor);
    if (start < 0) continue;
    cursor = start + name.length;
    const end = findNextInText(body, SKILL_NAMES[i + 1], cursor);
    const chunk = body.slice(start, end).trim();
    const m = chunk.match(
      /^(.+?)\s*((?:C\s*)*)(Int|Wis|Dex|Cha|Str|Con|N\/A)(A)?/,
    );
    if (!m) continue;
    let skillLabel = m[1].trim();
    const csCount = (m[2].match(/C/g) ?? []).length;
    const ability = m[3];
    const armor = m[4] === "A";
    skillLabel = skillLabel
      .replace(/U(?=$|\s)/, " U")
      .replace(/\*\*(?=$|\s)/, " **")
      .replace(/\*(?=$|\s)/, " *");
    const cols = CLASS_COLS.map((_, idx) => (idx < csCount ? "C" : "—"));
    rows.push({
      skill: skillLabel,
      cols,
      ability: armor ? `${ability}†` : ability,
    });
  }
  return { rows, footnotes };
}

function renderTable31({ rows, footnotes }) {
  const header = ["Skill", ...CLASS_COLS, "Abil"].join(" | ");
  const sep = ["---", ...CLASS_COLS.map(() => "---"), "---"].join(" | ");
  const lines = [
    "## Table 3–1: Skills",
    "",
    `| ${header} |`,
    `| ${sep} |`,
  ];
  for (const row of rows) {
    lines.push(`| ${row.skill} | ${row.cols.join(" | ")} | ${row.ability} |`);
  }
  lines.push("");
  if (footnotes) {
    lines.push("**Table 3–1 footnotes**");
    lines.push("");
    lines.push(
      [
        "** Additional details in Dark Sun 3 Rulebook",
        "**U** Skill can be used untrained",
        "**\\*** Additional details in Expanded Psionics Handbook",
        "**A** Armor check penalty applies to checks. ×2 for Swim",
      ].join("\n"),
    );
    lines.push("");
    lines.push("† Armor check penalty applies to checks. ×2 for Swim.");
    lines.push("");
  }
  return lines.join("\n");
}

const LANGUAGE_ROWS = [
  ["Aquan", "Water-based creatures", "Elven"],
  ["Auran", "Air-based creatures, aarakocra", "Saurian"],
  ["Common", "Humans, half-elves, halfgiants", "Common"],
  ["Druidic", "Druids (only)", "Druidic"],
  ["Dwarven", "Dwarves, muls", "Dwarven"],
  ["Elven", "Elves, half-elves", "Elven"],
  ["Entomic", "Insectoid creatures, scrabs", "Kreen"],
  ["Giant", "Giants", "Dwarven"],
  ["Gith", "Gith", "Elven"],
  ["Halfling", "Halflings", "Halfling"],
  ["Ignan", "Fire-based creatures", "Saurian"],
  ["Thri-Kreen", "Thri-kreen, tohr-kreen", "Kreen"],
  ["Tohr-Kreen", "Thri-kreen, tohr-kreen, zik-chil", "Kreen"],
  ["Rhul-thaun", "Rhul-thaun", "Rhulisti"],
  ["Saurian", "Jozhals, pterrans, ssurrans", "Saurian"],
  ["Sylvan", "Druids, halflings", "Halfling"],
  ["Terran", "Earth-based creatures, tari", "Dwarven"],
  ["Yuan-ti", "Yuan-ti", "Saurian"],
];

function parseTable32(ch3) {
  const deadLangMatch = ch3.match(
    /In addition to the table above, each city-state[\s\S]*?Yaramukite\./,
  );
  const deadLanguages = deadLangMatch ? deadLangMatch[0].trim() : "";
  const rows = LANGUAGE_ROWS.map(([language, speakers, alphabet]) => ({
    language,
    speakers,
    alphabet,
  }));
  return { rows, deadLanguages };
}

function renderTable32({ rows, deadLanguages }) {
  const lines = [
    "## Table 3–2: Athasian Common Languages and Their Alphabets",
    "",
    "| Language | Typical Speakers | Alphabet |",
    "| --- | --- | --- |",
  ];
  for (const row of rows) {
    lines.push(`| ${row.language} | ${row.speakers} | ${row.alphabet} |`);
  }
  lines.push("");
  if (deadLanguages) {
    lines.push(deadLanguages);
    lines.push("");
  }
  return lines.join("\n");
}

function parseSurvivalTerrain(ch3) {
  const m = ch3.match(
    /Terrain Type Examples Survival DC Modifier Abundant([^]*?)Void Obsidian Plains \+25/,
  );
  if (!m) return null;
  const body = "Abundant" + m[1] + "Void Obsidian Plains +25";
  const terrains = [
    "Abundant",
    "Fertile",
    "Infertile",
    "Barren",
    "Desolate",
    "Void",
  ];
  const rows = [];
  for (const t of terrains) {
    const re = new RegExp(`${t} ([^+]+)\\+(-?\\d+)`, "i");
    const hit = body.match(re);
    if (hit) rows.push({ terrain: t, examples: hit[1].trim(), modifier: hit[2] });
  }
  return rows;
}

function renderSurvivalTerrain(rows) {
  if (!rows?.length) return "";
  const lines = [
    "### Survival terrain DCs",
    "",
    "Terrain types affect the amount of food and water available through hunting and foraging. The DC of the check depends on the conditions of the climb. Compare the task in the Player's Handbook with those on the following table to determine an appropriate DC.",
    "",
    "| Terrain Type | Examples | Survival DC Modifier |",
    "| --- | --- | --- |",
  ];
  for (const row of rows) {
    lines.push(`| ${row.terrain} | ${row.examples} | +${row.modifier.replace(/^\+/, "")} |`);
  }
  lines.push("");
  return lines.join("\n");
}

function extractSkillSections(ch3) {
  const skillsEnd = ch3.indexOf("Feats ");
  const skills = ch3.slice(0, skillsEnd);
  const markers = [
    { heading: "Bluff (Cha)", start: "Bluff (Cha)" },
    { heading: "Craft (Int)", start: "Craft (Int)" },
    { heading: "Craft (Alchemy) (Int; Trained Only)", start: "Craft (Alchemy) (Int; Trained Only)" },
    { heading: "Knowledge (Ancient History) (Int; Trained Only)", start: "Knowledge (Ancient History) (Int; Trained Only)" },
    { heading: "Table 3–1", start: "Table 3–1" },
    { heading: "Knowledge (Warcraft) (Int)", start: "Knowledge (Warcraft) (Int)" },
    { heading: "Literacy (None; Trained Only)", start: "Literacy (None; Trained Only)" },
    { heading: "Speak Language (None; Trained Only)", start: "Speak Language (None; Trained Only)" },
    { heading: "Survival (Wis)", start: "Survival (Wis)" },
    { heading: "Swim (Str)", start: "Swim (Str)" },
  ];
  const sections = [];
  for (let i = 0; i < markers.length; i++) {
    const start = skills.indexOf(markers[i].start);
    const end =
      i + 1 < markers.length ? skills.indexOf(markers[i + 1].start) : skillsEnd;
    if (start < 0) continue;
    sections.push({
      heading: markers[i].heading,
      body: skills.slice(start + markers[i].start.length, end).trim(),
    });
  }
  return sections;
}

function buildSkillsMd(ch3) {
  const skillsIntro = ch3.match(
    /Skills A few skills have new uses[\s\S]*?(?=Bluff \(Cha\))/,
  );
  const sections = extractSkillSections(ch3);
  const table31 = parseTable31(ch3);
  const table32 = parseTable32(ch3);
  const terrain = parseSurvivalTerrain(ch3);

  const parts = [
    frontmatter({ title: "Skills", kind: "catalog" }),
    "# Skills",
    "",
    skillsIntro ? skillsIntro[0].replace(/^Skills\s*/, "").trim() : "",
    "",
  ];

  for (const section of sections) {
    if (section.heading.startsWith("Table 3–1")) {
      parts.push(renderTable31(table31));
      continue;
    }
    if (section.heading.startsWith("Speak Language")) {
      parts.push(`## ${section.heading}`);
      parts.push("");
      parts.push(section.body.split("Table 3–2")[0]?.trim() ?? section.body);
      parts.push("");
      parts.push(renderTable32(table32));
      continue;
    }
    if (section.heading.startsWith("Survival")) {
      parts.push(`## ${section.heading}`);
      parts.push("");
      const survivalBody = section.body.split("Terrain Type")[0]?.trim();
      if (survivalBody) parts.push(survivalBody);
      parts.push("");
      parts.push(renderSurvivalTerrain(terrain));
      continue;
    }
    parts.push(`## ${section.heading}`);
    parts.push("");
    parts.push(section.body);
    parts.push("");
  }
  return parts.join("\n").replace(/\n{3,}/g, "\n\n");
}

function buildFeatCatalogMd(ch3, category) {
  const start = ch3.indexOf(category.start);
  const end = ch3.indexOf(category.end);
  const section = ch3.slice(start, end);
  const tableText = category.table ? extractTable(ch3, category.table) : "";
  const tableRows = category.table
    ? parseFeatTableRows(tableText, category.table)
    : [];
  const tableNames =
    TABLE_FEAT_NAMES[category.table] ?? tableRows.map((r) => r.name);
  const allNames = [...new Set([...tableNames, ...(category.extraNames ?? [])])];

  if (category.file === "item-creation.md") {
    const brew = section.match(/Brew Potion Special:([\s\S]*?)(?=Scribe Scroll|$)/);
    const scribe = section.match(/Scribe Scroll Special:([\s\S]*?)(?=Psionic Feats|$)/);
    const parts = [
      frontmatter({ title: category.title, kind: "catalog" }),
      `# ${category.title}`,
      "",
      "### Brew Potion",
      "",
      "Special:" + (brew?.[1]?.trim() ?? ""),
      "",
      "### Scribe Scroll",
      "",
      "Special:" + (scribe?.[1]?.trim() ?? ""),
      "",
    ];
    return parts.join("\n");
  }

  let intro = category.intro;
  if (category.file === "regional-feats.md" && !intro) {
    intro = section
      .match(
        /Regional feats are feats that require[\s\S]*?compared to other feats\./,
      )?.[0]
      ?.replace(/^Regional Feats\s*/, "")
      ?.trim();
  }

  const descriptions = parseFeatDescriptions(section, allNames);
  const descByName = new Map(descriptions.map((d) => [d.name, d.body]));

  const orderedNames = [];
  for (const name of allNames) {
    if (descByName.has(name)) orderedNames.push(name);
  }
  for (const d of descriptions) {
    if (!orderedNames.includes(d.name)) orderedNames.push(d.name);
  }

  const parts = [
    frontmatter({ title: category.title, kind: "catalog" }),
    `# ${category.title}`,
    "",
  ];
  if (intro) {
    parts.push(intro);
    parts.push("");
  }
  if (category.table) {
    const rowsFromDescriptions = buildTableRowsFromDescriptions(
      tableNames,
      descByName,
    );
    const rows = rowsFromDescriptions.length ? rowsFromDescriptions : tableRows;
    if (rows.length) {
      parts.push(
        formatFeatTableMarkdown(
          category.table,
          category.title.replace(/ Feats$/, " Feats"),
          rows,
        ),
      );
    }
  }
  if (category.sidebar) {
    parts.push("> " + category.sidebar);
    parts.push("");
  }
  for (const name of orderedNames) {
    const body = descByName.get(name);
    if (!body) continue;
    parts.push(`### ${name}`);
    parts.push("");
    parts.push(splitPrereqBenefit(cleanFeatBody(body)));
    parts.push("");
  }
  return parts.join("\n").replace(/\n{3,}/g, "\n\n");
}

function normalizeReligionName(text, name) {
  if (name === "Lalali-Puy") {
    return text.includes("Lalali–Puy") ? "Lalali–Puy" : "Lalali-Puy";
  }
  return name;
}

function buildReligionMd(ch3) {
  const relStart = ch3.indexOf("Religion ");
  const rel = ch3.slice(relStart);
  const parts = [
    frontmatter({ title: "Religion", kind: "catalog" }),
    "# Religion",
    "",
  ];

  for (const group of RELIGION_GROUPS) {
    const groupStart = rel.indexOf(group.heading === "Introduction" ? "Religion " : group.heading);
    const groupEnd = group.endAt ? rel.indexOf(group.endAt) : rel.length;
    const chunk = rel.slice(groupStart, groupEnd).trim();

    if (group.heading === "Introduction") {
      const intro = chunk
        .replace(/^Religion\s*/, "")
        .replace(/Race and Religion:/, "\n\nRace and Religion:")
        .trim();
      parts.push(intro);
      parts.push("");
      continue;
    }

    parts.push(`## ${group.heading}`);
    parts.push("");

    let groupIntro = chunk.replace(new RegExp(`^${group.heading}\\s*`), "");
    for (const entry of group.entries) {
      const variant = normalizeReligionName(chunk, entry);
      const idx = groupIntro.indexOf(variant + " ");
      if (idx >= 0) {
        groupIntro = groupIntro.slice(0, idx).trim();
        break;
      }
    }
    if (groupIntro) {
      parts.push(groupIntro);
      parts.push("");
    }

    if (group.heading === "Nature") {
      const natureBody = chunk.replace(/^Nature\s*/, "").trim();
      parts.push(natureBody);
      parts.push("");
      continue;
    }

    for (const entry of group.entries) {
      const variant = normalizeReligionName(chunk, entry);
      const start = chunk.indexOf(variant + " ");
      if (start < 0) continue;
      let end = chunk.length;
      for (const other of group.entries) {
        if (other === entry) continue;
        const oVar = normalizeReligionName(chunk, other);
        const oIdx = chunk.indexOf(oVar + " ", start + variant.length);
        if (oIdx >= 0 && oIdx < end) end = oIdx;
      }
      if (group.endAt) {
        const gEnd = chunk.indexOf(group.endAt, start + 1);
        if (gEnd >= 0 && gEnd < end) end = gEnd;
      }
      const body = chunk.slice(start + variant.length, end).trim();
      parts.push(`### ${entry}`);
      parts.push("");
      parts.push(body);
      parts.push("");
    }
  }

  parts.push(
    "> **Campaign note:** This chapter describes Athasian religion as presented in DS3 v8 (no true gods on Athas). For this table's house rule on the Shattering and dead gods, see [campaign premise](../campaign/premise.md).",
  );
  parts.push("");
  return parts.join("\n").replace(/\n{3,}/g, "\n\n");
}

function buildReadmeMd(ch3) {
  const quoteMatch = ch3.match(/"([^"]+)"\s*―The Oracle, Blue Shrine Scrolls/);
  const quote = quoteMatch ? quoteMatch[1] : "";
  const introMatch = ch3.match(
    /A Dark Sun character is defined by far more than race and class\.[\s\S]*?truly unique\./,
  );
  const intro = introMatch ? introMatch[0] : "";

  return `${frontmatter({ title: "Heroic Characteristics", kind: "heroic/index" })}# Heroic Characteristics

> "${quote}"
> — The Oracle, Blue Shrine Scrolls

${intro}

## Chapter contents

| Section | Description |
| --- | --- |
| [Skills](skills.md) | Athasian skill changes, Table 3–1, languages, survival terrain |
| [Feats](feats.md) | General, divine, item creation, psionic, raze, racial, and regional feats |
| [Religion](religion.md) | Elements, paraelements, nature, sorcerer-kings, and other faiths |
`;
}

function buildFeatsIndexMd() {
  return `${frontmatter({ title: "Feats", kind: "catalog" })}# Feats

The new feats described in DS3 v8 Chapter 3 are summarized on Tables 3–3 through 3–8.

| Category | Page |
| --- | --- |
| [General feats](general-feats.md) | Table 3–3 |
| [Divine feats](divine-feats.md) | Table 3–4 |
| [Item creation](item-creation.md) | Athasian Brew Potion and Scribe Scroll |
| [Psionic feats](psionic-feats.md) | Table 3–5 |
| [Raze feats](raze-feats.md) | Table 3–6 |
| [Racial feats](racial-feats.md) | Table 3–7 |
| [Regional feats](regional-feats.md) | Table 3–8 |
`;
}

function main() {
  if (!fs.existsSync(SOURCE)) {
    throw new Error(`Source extract not found: ${SOURCE}`);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const ch3 = loadChapter3();

  const files = [
    ["README.md", buildReadmeMd(ch3)],
    ["skills.md", buildSkillsMd(ch3)],
    ["feats.md", buildFeatsIndexMd()],
    ...FEAT_CATEGORIES.map((cat) => [cat.file, buildFeatCatalogMd(ch3, cat)]),
    ["religion.md", buildReligionMd(ch3)],
  ];

  for (const [name, content] of files) {
    fs.writeFileSync(path.join(OUT, name), content, "utf8");
  }

  console.log("Wrote docs/heroic/:");
  for (const [name] of files) console.log(`  ${name}`);
}

main();
