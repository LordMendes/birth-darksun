export type LegacyPowerEntry = {
  name: string;
  legacy: string;
  tier: "Minor" | "Major" | "Great";
  type: string;
  effect: string;
};

export function normalizeLegacyPowerName(raw: string): string {
  return raw.replace(/\*+$/, "").trim();
}
