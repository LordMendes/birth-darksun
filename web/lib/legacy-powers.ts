import fs from "node:fs";
import path from "node:path";
import { DOCS_ROOT } from "@/lib/docs";
import type { LegacyPowerEntry } from "@/lib/legacy-power-types";

const DESCRIPTIONS_PATH = path.join(
  DOCS_ROOT,
  "rules/blood-abilities/descriptions.md",
);

let cached: Map<string, LegacyPowerEntry> | null = null;

export function parseLegacyPowerDescriptions(text: string): Map<string, LegacyPowerEntry> {
  const map = new Map<string, LegacyPowerEntry>();
  let legacy = "";
  let tier: LegacyPowerEntry["tier"] = "Minor";

  for (const line of text.split("\n")) {
    const h2 = line.match(/^## (.+?) legacy/i);
    if (h2) {
      legacy = h2[1].trim();
      continue;
    }

    const h3 = line.match(/^### (Minor|Major|Great)/i);
    if (h3) {
      tier = h3[1] as LegacyPowerEntry["tier"];
      continue;
    }

    const row = line.match(/^\|\s*(.+?)\s*\|\s*(Ex|Su|Sp)\s*\|\s*(.+?)\s*\|$/);
    if (!row || row[1] === "Power" || row[1].startsWith("---")) continue;

    const name = row[1].trim();
    map.set(name, {
      name,
      legacy,
      tier,
      type: row[2],
      effect: row[3].trim(),
    });
  }

  return map;
}

export function getLegacyPowerIndex(): Map<string, LegacyPowerEntry> {
  if (cached) return cached;
  const text = fs.readFileSync(DESCRIPTIONS_PATH, "utf8");
  cached = parseLegacyPowerDescriptions(text);
  return cached;
}

export function getLegacyPowerRecord(): Record<string, LegacyPowerEntry> {
  return Object.fromEntries(getLegacyPowerIndex());
}
