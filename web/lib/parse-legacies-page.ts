export type LegacyProfileField = {
  label: string;
  body: string;
};

export type LegacyProfile = {
  name: string;
  id: string;
  kind: string;
  summary: string;
  fields: LegacyProfileField[];
};

export type ParsedLegaciesPage = {
  intro: string;
  profiles: LegacyProfile[];
  rest: string;
};

const SEVEN_HEADING = "## The seven legacies";
const RANKS_HEADING = "## Legacy types (ranks)";

const LEGACY_KIND: Record<string, string> = {
  Sun: "Elemental",
  Storm: "Elemental",
  Sea: "Elemental",
  Stone: "Elemental",
  Mind: "Psionic",
  Defiler: "Defiling",
  Dragon: "Draconic",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseProfile(block: string): LegacyProfile | null {
  const trimmed = block.trim();
  if (!trimmed) return null;

  const newline = trimmed.indexOf("\n");
  const name = (newline === -1 ? trimmed : trimmed.slice(0, newline)).trim();
  if (!name) return null;

  const body = (newline === -1 ? "" : trimmed.slice(newline + 1))
    .replace(/^---\s*$/gm, "")
    .trim();

  const parts = body.split(/^\*\*(.+?):\*\*\s*/m);
  const summary = (parts[0] ?? "").trim();
  const fields: LegacyProfileField[] = [];

  for (let i = 1; i < parts.length; i += 2) {
    const label = parts[i]?.trim();
    const fieldBody = parts[i + 1]?.trim();
    if (!label || !fieldBody) continue;
    fields.push({ label, body: fieldBody });
  }

  return {
    name,
    id: slugify(name),
    kind: LEGACY_KIND[name] ?? "",
    summary,
    fields,
  };
}

export function parseLegaciesPage(content: string): ParsedLegaciesPage {
  const sevenIdx = content.indexOf(SEVEN_HEADING);
  const ranksIdx = content.indexOf(RANKS_HEADING);

  if (sevenIdx < 0 || ranksIdx < 0 || ranksIdx <= sevenIdx) {
    return { intro: content, profiles: [], rest: "" };
  }

  const intro = content.slice(0, sevenIdx).trim().replace(/\n---\s*$/, "");
  const sevenBlock = content.slice(sevenIdx + SEVEN_HEADING.length, ranksIdx);
  const rest = content.slice(ranksIdx).trim();
  const profiles = sevenBlock
    .split(/^### /m)
    .map(parseProfile)
    .filter((profile): profile is LegacyProfile => profile !== null);

  return { intro, profiles, rest };
}

export function splitTypicalPowers(body: string): string[] {
  return body
    .split(",")
    .map((part) => part.trim().replace(/\.$/, ""))
    .filter(Boolean);
}
