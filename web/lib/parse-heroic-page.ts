import { slugifyHeading } from "./parse-race-page";

export type HeroicPageKind = "index" | "catalog" | "religion";

export type HeroicEntry = {
  name: string;
  id: string;
  body: string;
};

export type HeroicTableSection = {
  heading: string;
  id: string;
  body: string;
};

export type HeroicIndexEntry = {
  name: string;
  href: string;
  summary: string;
};

export type ParsedHeroicIndex = {
  title: string;
  quote: string | null;
  attribution: string | null;
  intro: string;
  sections: HeroicIndexEntry[];
};

export type ParsedHeroicCatalog = {
  title: string;
  quote: string | null;
  attribution: string | null;
  intro: string;
  tables: HeroicTableSection[];
  entries: HeroicEntry[];
  sidebar: string;
};

export type HeroicReligionGroup = {
  heading: string;
  id: string;
  intro: string;
  entries: HeroicEntry[];
};

export type ParsedHeroicReligion = {
  title: string;
  intro: string;
  groups: HeroicReligionGroup[];
  tableNote: string;
};

function stripFrontmatter(content: string): string {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "");
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
      if (line.startsWith(">")) quoteLines.push(line.replace(/^>\s?/, ""));
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

function parseEntriesFromBody(body: string): HeroicEntry[] {
  const parts = body.split(/^### /m);
  if (parts.length <= 1) return [];

  return parts.slice(1).map((block) => {
    const trimmed = block.trim();
    const newline = trimmed.indexOf("\n");
    const name = (newline === -1 ? trimmed : trimmed.slice(0, newline)).trim();
    const entryBody = (newline === -1 ? "" : trimmed.slice(newline + 1)).trim();
    return { name, id: slugifyHeading(name), body: entryBody };
  });
}

function isTableHeading(heading: string): boolean {
  return /^Table /i.test(heading);
}

function parseLinkCell(cell: string): { name: string; href: string } {
  const match = cell.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  if (match) return { name: match[1], href: match[2] };
  return { name: cell, href: "" };
}

function parseIndexTable(block: string): HeroicIndexEntry[] {
  const entries: HeroicIndexEntry[] = [];
  for (const line of block.split("\n")) {
    if (!line.startsWith("|")) continue;
    if (/^\|\s*:?-/.test(line)) continue;
    const cells = line
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((cell) => cell.trim());
    if (cells.length < 2 || cells[0] === "Section") continue;
    const link = parseLinkCell(cells[0] ?? "");
    entries.push({
      name: link.name,
      href: link.href,
      summary: cells[1] ?? "",
    });
  }
  return entries;
}

export function heroicPageKind(relPath: string): HeroicPageKind | null {
  if (!relPath.startsWith("heroic/") || !relPath.endsWith(".md")) return null;
  if (relPath === "heroic/README.md") return "index";
  if (relPath === "heroic/religion.md") return "religion";
  return "catalog";
}

export function parseHeroicIndex(content: string): ParsedHeroicIndex {
  const body = stripFrontmatter(content);
  const parts = body.split(/^## /m);
  const preface = (parts[0] ?? "").trim();
  const { title, quote, attribution, rest } = parseQuoteBlock(preface);

  let intro = rest;
  const sections: HeroicIndexEntry[] = [];

  for (const block of parts.slice(1)) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const newline = trimmed.indexOf("\n");
    const heading = (newline === -1 ? trimmed : trimmed.slice(0, newline)).trim();
    const sectionBody = (newline === -1 ? "" : trimmed.slice(newline + 1)).trim();
    if (heading.toLowerCase() === "chapter contents") {
      sections.push(...parseIndexTable(sectionBody));
      continue;
    }
    intro = sectionBody || intro;
  }

  return { title, quote, attribution, intro, sections };
}

function extractTableBody(sectionBody: string): string {
  const featStart = sectionBody.search(/^### /m);
  return featStart >= 0 ? sectionBody.slice(0, featStart).trim() : sectionBody.trim();
}

export function parseHeroicCatalog(content: string): ParsedHeroicCatalog {
  const body = stripFrontmatter(content);
  const parts = body.split(/^## /m);
  const preface = (parts[0] ?? "").trim();
  const { title, quote, attribution, rest } = parseQuoteBlock(preface);

  let intro = rest;
  const tables: HeroicTableSection[] = [];
  const skillEntries: HeroicEntry[] = [];
  let sidebar = "";
  const globalEntries = parseEntriesFromBody(body);

  for (const block of parts.slice(1)) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const newline = trimmed.indexOf("\n");
    const heading = (newline === -1 ? trimmed : trimmed.slice(0, newline)).trim();
    const sectionBody = (newline === -1 ? "" : trimmed.slice(newline + 1)).trim();

    if (isTableHeading(heading)) {
      tables.push({
        heading,
        id: slugifyHeading(heading),
        body: extractTableBody(sectionBody),
      });
      continue;
    }

    if (/footnotes/i.test(heading)) {
      sidebar = sectionBody;
      continue;
    }

    if (/^Behind the Veil/i.test(heading)) {
      sidebar = `${heading}\n\n${sectionBody}`.trim();
      continue;
    }

    skillEntries.push({
      name: heading,
      id: slugifyHeading(heading),
      body: sectionBody,
    });
  }

  const featCatalog =
    tables.some((table) => /Table 3–[3-8]/i.test(table.heading)) &&
    globalEntries.length > 2;
  const entries = featCatalog
    ? globalEntries
    : skillEntries.length > 0
      ? skillEntries
      : globalEntries;

  return { title, quote, attribution, intro, tables, entries, sidebar };
}

export function parseHeroicReligion(content: string): ParsedHeroicReligion {
  const body = stripFrontmatter(content);
  const parts = body.split(/^## /m);
  const preface = (parts[0] ?? "").trim();
  const { title, rest } = parseQuoteBlock(preface);

  const introParts: string[] = [];
  const groups: HeroicReligionGroup[] = [];
  let tableNote = "";

  for (const block of parts.slice(1)) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const newline = trimmed.indexOf("\n");
    const heading = (newline === -1 ? trimmed : trimmed.slice(0, newline)).trim();
    const sectionBody = (newline === -1 ? "" : trimmed.slice(newline + 1)).trim();

    if (/table note/i.test(heading)) {
      tableNote = sectionBody;
      continue;
    }

    const nested = parseEntriesFromBody(sectionBody);
    if (nested.length > 0) {
      const introEnd = sectionBody.indexOf("### ");
      const groupIntro = introEnd >= 0 ? sectionBody.slice(0, introEnd).trim() : "";
      groups.push({
        heading,
        id: slugifyHeading(heading),
        intro: groupIntro,
        entries: nested,
      });
      continue;
    }

    if (groups.length === 0 && !tableNote) {
      introParts.push(sectionBody);
      continue;
    }

    groups.push({
      heading,
      id: slugifyHeading(heading),
      intro: sectionBody,
      entries: [],
    });
  }

  const intro = [rest, ...introParts].filter(Boolean).join("\n\n").trim();

  return { title, intro, groups, tableNote };
}
