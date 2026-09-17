export type RacePageKind = "index" | "entity" | "regions" | "vital" | "other";

export type RaceSection = {
  heading: string;
  id: string;
  body: string;
};

export type RaceTrait = {
  name: string;
  body: string;
};

export type ParsedRacePage = {
  title: string;
  quote: string | null;
  attribution: string | null;
  overview: string;
  culture: RaceSection[];
  beliefs: RaceSection[];
  play: RaceSection[];
  traitsIntro: string;
  traits: RaceTrait[];
  sources: string;
};

export type RaceIndexEntry = {
  name: string;
  href: string;
  ability: string;
  favored: string;
  levelAdjustment: string;
  summary?: string;
};

export type ParsedRacesIndex = {
  intro: string;
  races: RaceIndexEntry[];
  supporting: RaceIndexEntry[];
  sources: string;
};

export type RegionField = {
  label: string;
  body: string;
};

export type ParsedRegion = {
  name: string;
  id: string;
  summary: string;
  fields: RegionField[];
};

export type ParsedRegionsPage = {
  intro: string;
  regions: ParsedRegion[];
  sources: string;
};

const CULTURE_HEADINGS = new Set([
  "personality",
  "physical description",
  "relations",
  "alignment",
  "lands",
]);

const BELIEF_HEADINGS = new Set([
  "magic",
  "psionics",
  "religion",
  "language",
  "names",
]);

const PLAY_HEADINGS = new Set([
  "adventurers",
  "society",
  "roleplaying suggestions",
]);

export function racePageKind(relPath: string): RacePageKind | null {
  if (!relPath.startsWith("races/") || !relPath.endsWith(".md")) return null;
  if (relPath === "races/README.md") return "index";
  if (relPath === "races/region-of-origin.md") return "regions";
  if (relPath === "races/vital-statistics.md") return "vital";
  if (relPath === "races/other-races.md") return "other";
  return "entity";
}

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

function splitSections(content: string): { preface: string; sections: RaceSection[] } {
  const parts = stripFrontmatter(content).split(/^## /m);
  const preface = (parts[0] ?? "").trim();
  const sections = parts.slice(1).map((block) => {
    const newline = block.indexOf("\n");
    const heading = (newline === -1 ? block : block.slice(0, newline)).trim();
    const body = (newline === -1 ? "" : block.slice(newline + 1)).trim();
    return { heading, id: slugifyHeading(heading), body };
  });
  return { preface, sections };
}

function parseQuoteBlock(preface: string): {
  title: string;
  quote: string | null;
  attribution: string | null;
  rest: string;
} {
  const lines = preface.split("\n");
  const titleLine = lines.find((line) => line.startsWith("# "));
  const title = titleLine ? titleLine.slice(2).trim() : "";

  const quoteLines: string[] = [];
  let afterQuote = false;
  const restLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("# ")) continue;
    if (!afterQuote && (line.startsWith(">") || (quoteLines.length > 0 && line.trim() === ""))) {
      if (line.startsWith(">")) {
        quoteLines.push(line.replace(/^>\s?/, ""));
      }
      continue;
    }
    if (quoteLines.length > 0) afterQuote = true;
    restLines.push(line);
  }

  let attribution: string | null = null;
  if (quoteLines.length > 0) {
    const last = quoteLines[quoteLines.length - 1] ?? "";
    if (/^[—–-]\s+/.test(last)) {
      attribution = last.replace(/^[—–-]\s+/, "").trim();
      quoteLines.pop();
    }
  }

  const quote = quoteLines.join(" ").replace(/^["“]|["”]$/g, "").trim() || null;
  return { title, quote, attribution, rest: restLines.join("\n").trim() };
}

export function parseRaceTraits(body: string): { intro: string; traits: RaceTrait[] } {
  const listStart = body.search(/^- /m);
  const intro = (listStart === -1 ? body : body.slice(0, listStart)).trim();
  const list = (listStart === -1 ? "" : body.slice(listStart)).trim();
  const traits: RaceTrait[] = [];

  for (const raw of list.split(/^- /m)) {
    const item = raw.trim();
    if (!item) continue;
    traits.push(parseTraitItem(item));
  }

  return { intro, traits };
}

function parseTraitItem(item: string): RaceTrait {
  const colonInside = item.match(/^\*\*(.+?):\*\*\s*(.*)$/s);
  if (colonInside) {
    return { name: colonInside[1].trim(), body: colonInside[2].trim() };
  }

  const colonAfter = item.match(/^\*\*(.+?)\*\*:\s*(.*)$/s);
  if (colonAfter) {
    return { name: colonAfter[1].trim(), body: colonAfter[2].trim() };
  }

  const bold = item.match(/^\*\*(.+?)\*\*\s*(.*)$/s);
  if (!bold) return { name: "", body: item };

  const name = bold[1].replace(/[:.]+$/, "").trim();
  const rest = bold[2].replace(/^\.\s*/, "").trim();
  if (rest && /^[a-z]/.test(rest)) {
    return { name: `${name} ${rest}`.replace(/[.]$/, ""), body: "" };
  }
  return { name, body: rest };
}

export function parseRacePage(content: string): ParsedRacePage {
  const { preface, sections } = splitSections(content);
  const { title, quote, attribution, rest } = parseQuoteBlock(preface);

  let overview = rest;
  const culture: RaceSection[] = [];
  const beliefs: RaceSection[] = [];
  const play: RaceSection[] = [];
  let traitsIntro = "";
  let traits: RaceTrait[] = [];
  let sources = "";

  for (const section of sections) {
    const key = section.heading.toLowerCase();
    if (key === "overview") {
      overview = section.body;
      continue;
    }
    if (CULTURE_HEADINGS.has(key)) {
      culture.push(section);
      continue;
    }
    if (BELIEF_HEADINGS.has(key)) {
      beliefs.push(section);
      continue;
    }
    if (PLAY_HEADINGS.has(key)) {
      play.push(section);
      continue;
    }
    if (key === "racial traits") {
      const parsed = parseRaceTraits(section.body);
      traitsIntro = parsed.intro;
      traits = parsed.traits;
      continue;
    }
    if (key === "sources") {
      sources = section.body;
      continue;
    }
    culture.push(section);
  }

  return {
    title,
    quote,
    attribution,
    overview,
    culture,
    beliefs,
    play,
    traitsIntro,
    traits,
    sources,
  };
}

function parseLinkCell(cell: string): { name: string; href: string } {
  const match = cell.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (match) return { name: match[1], href: match[2] };
  return { name: cell, href: "" };
}

function parseMarkdownTable(block: string): string[][] {
  return block
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"))
    .filter((line) => !/^\|\s*:?-/.test(line) && !/^\|(?:\s*-+\s*\|)+$/.test(line))
    .map((line) =>
      line
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim()),
    )
    .filter((row) => row.length > 1 && row[0] !== "Race" && row[0] !== "Page");
}

export function parseRacesIndex(content: string): ParsedRacesIndex {
  const { preface, sections } = splitSections(content);
  const { rest } = parseQuoteBlock(preface);
  let intro = rest;
  const races: RaceIndexEntry[] = [];
  const supporting: RaceIndexEntry[] = [];
  let sources = "";

  for (const section of sections) {
    const key = section.heading.toLowerCase();
    if (key === "playable races") {
      for (const row of parseMarkdownTable(section.body)) {
        const link = parseLinkCell(row[0] ?? "");
        races.push({
          name: link.name,
          href: link.href,
          ability: row[1] ?? "",
          favored: row[2] ?? "",
          levelAdjustment: row[3] ?? "—",
        });
      }
      continue;
    }
    if (key === "supporting pages") {
      for (const row of parseMarkdownTable(section.body)) {
        const link = parseLinkCell(row[0] ?? "");
        supporting.push({
          name: link.name,
          href: link.href,
          ability: "",
          favored: "",
          levelAdjustment: "",
          summary: row[1] ?? "",
        });
      }
      continue;
    }
    if (key === "sources") {
      sources = section.body;
    }
  }

  if (!intro) {
    const overview = sections.find((section) => section.heading.toLowerCase() === "overview");
    intro = overview?.body ?? "";
  }

  return { intro, races, supporting, sources };
}

export function parseRegionsPage(content: string): ParsedRegionsPage {
  const { preface, sections } = splitSections(content);
  const { rest } = parseQuoteBlock(preface);
  const regions: ParsedRegion[] = [];
  let sources = "";

  for (const section of sections) {
    if (section.heading.toLowerCase() === "sources") {
      sources = section.body;
      continue;
    }

    const listStart = section.body.search(/^- /m);
    const summary = (listStart === -1 ? section.body : section.body.slice(0, listStart)).trim();
    const list = (listStart === -1 ? "" : section.body.slice(listStart)).trim();
    const fields: RegionField[] = [];

    for (const raw of list.split(/^- /m)) {
      const item = raw.trim();
      if (!item) continue;
      const match = item.match(/^\*\*(.+?):\*\*\s*(.*)$/s);
      if (match) {
        fields.push({ label: match[1].trim(), body: match[2].trim() });
        continue;
      }
      fields.push({ label: "", body: item });
    }

    regions.push({
      name: section.heading,
      id: slugifyHeading(section.heading),
      summary,
      fields,
    });
  }

  return { intro: rest, regions, sources };
}
