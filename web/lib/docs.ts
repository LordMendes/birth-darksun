import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { DocPage, DocTreeNode } from "@/lib/docs-types";

export type { DocListingItem, DocPage, DocTreeNode } from "@/lib/docs-types";

function resolveDocsRoot(): string {
  const fromCwd = path.resolve(/*turbopackIgnore: true*/ process.cwd(), "docs");
  if (fs.existsSync(/*turbopackIgnore: true*/ fromCwd)) return fromCwd;
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), "..", "docs");
}

export const DOCS_ROOT = resolveDocsRoot();

function exists(file: string): boolean {
  return fs.existsSync(/*turbopackIgnore: true*/ file);
}

function stat(file: string): fs.Stats {
  return fs.statSync(/*turbopackIgnore: true*/ file);
}

function readText(file: string): string {
  return fs.readFileSync(/*turbopackIgnore: true*/ file, "utf8");
}

function listDir(dir: string): fs.Dirent[] {
  return fs.readdirSync(/*turbopackIgnore: true*/ dir, { withFileTypes: true });
}

function joinPath(...parts: string[]): string {
  return path.join(/*turbopackIgnore: true*/ ...parts);
}

function assertInsideDocs(resolved: string): boolean {
  const rel = path.relative(DOCS_ROOT, resolved);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

function titleCaseWords(value: string): string {
  return value
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function humanizeStem(stem: string): string {
  const dated = stem.match(/^(\d{4}-\d{2}-\d{2})(?:-(.*))?$/);
  if (dated) {
    const rest = dated[2] ? ` ${titleCaseWords(dated[2])}` : "";
    return `${dated[1]}${rest}`;
  }
  return titleCaseWords(stem.replace(/-/g, " "));
}

export function titleFromMarkdown(filePath: string, fallback: string): string {
  const raw = readText(filePath);
  const { data, content } = matter(raw);
  if (typeof data.title === "string" && data.title.trim()) {
    return data.title.trim();
  }
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  return humanizeStem(fallback);
}

function findReadme(dir: string): string | null {
  for (const name of ["README.md", "readme.md"]) {
    const candidate = joinPath(dir, name);
    if (exists(candidate) && stat(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
}

export function getDocsTree(): DocTreeNode[] {
  if (!exists(DOCS_ROOT)) return [];
  return readDir(DOCS_ROOT, []);
}

function readDir(dir: string, slugPrefix: string[]): DocTreeNode[] {
  const entries = listDir(dir)
    .filter((entry) => !entry.name.startsWith("."))
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
      return a.name.localeCompare(b.name, "en");
    });

  const nodes: DocTreeNode[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const slug = [...slugPrefix, entry.name];
      nodes.push({
        name: entry.name,
        title: humanizeStem(entry.name),
        href: `/docs/${slug.join("/")}`,
        slug,
        type: "dir",
        children: readDir(joinPath(dir, entry.name), slug),
      });
      continue;
    }

    if (!entry.name.toLowerCase().endsWith(".md")) continue;

    const stem = entry.name.replace(/\.md$/i, "");
    const isReadme = stem.toLowerCase() === "readme";
    if (isReadme && slugPrefix.length > 0) continue;

    const slug = isReadme ? slugPrefix : [...slugPrefix, stem];
    const href = slug.length === 0 ? "/docs" : `/docs/${slug.join("/")}`;
    const abs = joinPath(dir, entry.name);

    nodes.push({
      name: entry.name,
      title: isReadme ? "Overview" : titleFromMarkdown(abs, stem),
      href,
      slug,
      type: "file",
      children: [],
    });
  }

  return nodes;
}

export function getDocPage(slug: string[] = []): DocPage | null {
  const safeSlug = slug.filter((part) => part && part !== "." && part !== "..");
  if (safeSlug.length !== slug.length) return null;

  const asFile = `${path.resolve(/*turbopackIgnore: true*/ DOCS_ROOT, ...safeSlug)}.md`;
  if (assertInsideDocs(asFile) && exists(asFile) && stat(asFile).isFile()) {
    return filePage(asFile, safeSlug, safeSlug.slice(0, -1));
  }

  const asDir = path.resolve(/*turbopackIgnore: true*/ DOCS_ROOT, ...safeSlug);
  if (!assertInsideDocs(asDir) || !exists(asDir) || !stat(asDir).isDirectory()) {
    return null;
  }

  const readme = findReadme(asDir);
  if (readme) return filePage(readme, safeSlug, safeSlug);

  return {
    kind: "listing",
    title:
      safeSlug.length === 0
        ? "Campaign bible"
        : humanizeStem(safeSlug[safeSlug.length - 1] ?? "Docs"),
    dirSlug: safeSlug,
    listing: readDir(asDir, safeSlug).map((node) => ({
      title: node.title,
      href: node.href,
    })),
  };
}

function filePage(
  filePath: string,
  slug: string[],
  dirSlug: string[],
): DocPage {
  const raw = readText(filePath);
  const { content } = matter(raw);
  const stem = path.basename(filePath, path.extname(filePath));
  const relPath = path.relative(DOCS_ROOT, filePath).split(path.sep).join("/");
  return {
    kind: "file",
    title: titleFromMarkdown(filePath, slug[slug.length - 1] ?? stem),
    content,
    relPath,
    dirSlug,
  };
}
