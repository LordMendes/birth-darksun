import { slugifyHeading } from "./parse-race-page";

export type ClassPageKind =
  | "index"
  | "entity"
  | "domains"
  | "spells"
  | "excluded";

export type ClassSection = {
  heading: string;
  id: string;
  body: string;
};

export type ClassFeature = {
  name: string;
  body: string;
};

export type ParsedClassPage = {
  title: string;
  quote: string | null;
  attribution: string | null;
  overview: string;
  making: ClassSection[];
  featuresIntro: string;
  features: ClassFeature[];
  play: ClassSection[];
  society: ClassSection[];
  packages: string;
  sources: string;
};

export type ClassIndexEntry = {
  name: string;
  href: string;
  hitDie: string;
  bab: string;
  role: string;
  delta: string;
};

export type ClassSupportEntry = {
  name: string;
  href: string;
  summary: string;
};

export type ParsedClassesIndex = {
  intro: string;
  literacy: string;
  classes: ClassIndexEntry[];
  supporting: ClassSupportEntry[];
  sources: string;
};

function stripFrontmatter(content: string): string {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
}

function splitSections(content: string): { preface: string; sections: ClassSection[] } {
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

function isMakingHeading(heading: string): boolean {
  return /^making a /i.test(heading);
}

function isFeaturesHeading(heading: string): boolean {
  return heading.toLowerCase() === "class features";
}

function isPlayHeading(heading: string): boolean {
  const key = heading.toLowerCase();
  return (
    key.startsWith("playing a ") ||
    key === "combat" ||
    key === "advancement"
  );
}

function isSocietyHeading(heading: string): boolean {
  const key = heading.toLowerCase();
  return key === "religion" || key === "other classes";
}

function isPackagesHeading(heading: string): boolean {
  return heading.toLowerCase() === "starting packages";
}

function parseClassFeatures(body: string): { intro: string; features: ClassFeature[] } {
  const parts = body.split(/^### /m);
  const intro = (parts[0] ?? "").trim();
  const features: ClassFeature[] = [];

  for (const raw of parts.slice(1)) {
    const item = raw.trim();
    if (!item) continue;
    const newline = item.indexOf("\n");
    const name = (newline === -1 ? item : item.slice(0, newline)).trim();
    const featureBody = (newline === -1 ? "" : item.slice(newline + 1)).trim();
    features.push({ name, body: featureBody });
  }

  if (features.length === 0 && intro) {
    const boldBlocks = intro.split(/\n(?=\*\*[^*]+\*\*)/);
    if (boldBlocks.length > 1) {
      const lead = boldBlocks[0]?.trim() ?? "";
      const parsed: ClassFeature[] = [];
      for (const block of boldBlocks.slice(1)) {
        const match = block.match(/^\*\*(.+?)\*\*:?\s*(.*)$/s);
        if (match) {
          parsed.push({ name: match[1].trim(), body: match[2].trim() });
        }
      }
      if (parsed.length > 0) {
        return { intro: lead, features: parsed };
      }
    }
  }

  return { intro, features };
}

export function classPageKind(relPath: string): ClassPageKind | null {
  if (!relPath.startsWith("classes/") || !relPath.endsWith(".md")) return null;
  if (relPath === "classes/README.md") return "index";
  if (relPath === "classes/cleric-domains.md") return "domains";
  if (relPath === "classes/templar-spells.md") return "spells";
  if (relPath === "classes/excluded-classes.md") return "excluded";
  return "entity";
}

export function parseClassPage(content: string): ParsedClassPage {
  const { preface, sections } = splitSections(content);
  const { title, quote, attribution, rest } = parseQuoteBlock(preface);

  let overview = rest;
  const making: ClassSection[] = [];
  const play: ClassSection[] = [];
  const society: ClassSection[] = [];
  let featuresIntro = "";
  let features: ClassFeature[] = [];
  let packages = "";
  let sources = "";

  for (const section of sections) {
    const key = section.heading.toLowerCase();
    if (key === "overview") {
      overview = section.body;
      continue;
    }
    if (isMakingHeading(section.heading)) {
      making.push(section);
      continue;
    }
    if (isFeaturesHeading(section.heading)) {
      const parsed = parseClassFeatures(section.body);
      featuresIntro = parsed.intro;
      features = parsed.features;
      continue;
    }
    if (isPlayHeading(section.heading)) {
      play.push(section);
      continue;
    }
    if (isSocietyHeading(section.heading)) {
      society.push(section);
      continue;
    }
    if (isPackagesHeading(section.heading)) {
      packages = section.body;
      continue;
    }
    if (key === "sources") {
      sources = section.body;
      continue;
    }
    play.push(section);
  }

  return {
    title,
    quote,
    attribution,
    overview,
    making,
    featuresIntro,
    features,
    play,
    society,
    packages,
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
    .filter((row) => row.length > 1 && row[0] !== "Class");
}

function parseSupportList(block: string): ClassSupportEntry[] {
  const entries: ClassSupportEntry[] = [];
  for (const line of block.split("\n")) {
    const match = line.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)\s*[—–-]\s*(.+)$/);
    if (match) {
      entries.push({
        name: match[1],
        href: match[2],
        summary: match[3].trim(),
      });
    }
  }
  return entries;
}

export function parseClassesIndex(content: string): ParsedClassesIndex {
  const { preface, sections } = splitSections(content);
  const { rest } = parseQuoteBlock(preface);
  let intro = rest;
  let literacy = "";
  const classes: ClassIndexEntry[] = [];
  const supporting: ClassSupportEntry[] = [];
  let sources = "";

  for (const section of sections) {
    const key = section.heading.toLowerCase();
    if (key === "literacy") {
      literacy = section.body;
      continue;
    }
    if (key === "class index") {
      for (const row of parseMarkdownTable(section.body)) {
        const link = parseLinkCell(row[0] ?? "");
        classes.push({
          name: link.name,
          href: link.href,
          hitDie: row[1] ?? "",
          bab: row[2] ?? "",
          role: row[3] ?? "",
          delta: row[4] ?? "",
        });
      }
      continue;
    }
    if (key === "supporting pages") {
      supporting.push(...parseSupportList(section.body));
      continue;
    }
    if (key === "sources") {
      sources = section.body;
    }
  }

  if (!intro) {
    const overview = sections.find((section) => section.heading.toLowerCase() === "overview");
    intro = overview?.body ?? rest;
  }

  return { intro, literacy, classes, supporting, sources };
}
