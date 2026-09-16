import type { DocTreeNode } from "@/lib/docs-types";

export type FlatDocEntry = {
  title: string;
  href: string;
  pathLabel: string;
  type: "file" | "dir";
};

export function flattenDocsTree(
  nodes: DocTreeNode[],
  ancestors: string[] = [],
): FlatDocEntry[] {
  const entries: FlatDocEntry[] = [];

  for (const node of nodes) {
    const pathParts = [...ancestors, node.title];
    entries.push({
      title: node.title,
      href: node.href,
      pathLabel: pathParts.join(" / "),
      type: node.type,
    });

    if (node.children.length > 0) {
      entries.push(...flattenDocsTree(node.children, pathParts));
    }
  }

  return entries;
}

export function getAncestorHrefs(pathname: string): Set<string> {
  const hrefs = new Set<string>();
  if (pathname === "/docs") return hrefs;

  const parts = pathname.replace(/^\/docs\/?/, "").split("/").filter(Boolean);
  let current = "/docs";

  for (let i = 0; i < parts.length - 1; i += 1) {
    current += `/${parts[i]}`;
    hrefs.add(current);
  }

  return hrefs;
}

export function filterDocsTree(
  nodes: DocTreeNode[],
  query: string,
): DocTreeNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  const filtered: DocTreeNode[] = [];

  for (const node of nodes) {
    const titleMatch = node.title.toLowerCase().includes(q);
    const childMatches = filterDocsTree(node.children, query);

    if (titleMatch || childMatches.length > 0) {
      filtered.push({
        ...node,
        children: titleMatch ? node.children : childMatches,
      });
    }
  }

  return filtered;
}

export type BreadcrumbItem = {
  label: string;
  href: string;
};

export function breadcrumbsFromSlug(slug: string[]): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: "Bible", href: "/docs" }];

  if (slug.length === 0) return items;

  let href = "/docs";
  for (const part of slug) {
    href += `/${part}`;
    items.push({
      label: part
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      href,
    });
  }

  return items;
}
