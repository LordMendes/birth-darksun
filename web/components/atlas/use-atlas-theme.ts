"use client";

export type AtlasThemeColors = {
  sun: string;
  rust: string;
  background: string;
  surface: string;
};

const FALLBACK: AtlasThemeColors = {
  sun: "#f0b04a",
  rust: "#d4652a",
  background: "#120a06",
  surface: "#1c120b",
};

export function useAtlasTheme(): AtlasThemeColors {
  if (typeof window === "undefined") return FALLBACK;

  const style = getComputedStyle(document.documentElement);
  return {
    sun: style.getPropertyValue("--sun").trim() || FALLBACK.sun,
    rust: style.getPropertyValue("--rust").trim() || FALLBACK.rust,
    background:
      style.getPropertyValue("--background").trim() || FALLBACK.background,
    surface: style.getPropertyValue("--surface").trim() || FALLBACK.surface,
  };
}
