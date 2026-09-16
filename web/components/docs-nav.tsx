"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { DocTreeNode } from "@/lib/docs-types";
import {
  filterDocsTree,
  flattenDocsTree,
  getAncestorHrefs,
} from "@/lib/docs-nav-utils";

function isActive(pathname: string, href: string): boolean {
  if (href === "/docs") return pathname === "/docs";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({
  node,
  pathname,
  openFolders,
  onToggleFolder,
  forceOpen,
  ancestorHrefs,
}: {
  node: DocTreeNode;
  pathname: string;
  openFolders: Set<string>;
  onToggleFolder: (href: string) => void;
  forceOpen: boolean;
  ancestorHrefs: Set<string>;
}) {
  const active = isActive(pathname, node.href);
  const hasChildren = node.children.length > 0;
  const isOpen =
    forceOpen ||
    openFolders.has(node.href) ||
    ancestorHrefs.has(node.href);

  if (node.type === "dir" && hasChildren) {
    return (
      <li className={isOpen ? "docs-nav-folder is-open" : "docs-nav-folder"}>
        <div className="docs-nav-folder-row">
          <button
            type="button"
            className="docs-nav-folder-toggle"
            aria-expanded={isOpen}
            aria-label={`${isOpen ? "Collapse" : "Expand"} ${node.title}`}
            onClick={() => onToggleFolder(node.href)}
          >
            <span className="docs-nav-chevron" aria-hidden="true">
              ▸
            </span>
          </button>
          <Link
            href={node.href}
            className={active ? "docs-nav-link is-active" : "docs-nav-link"}
          >
            {node.title}
          </Link>
        </div>
        {isOpen ? (
          <ul>
            {node.children.map((child) => (
              <NavItem
                key={child.href}
                node={child}
                pathname={pathname}
                openFolders={openFolders}
                onToggleFolder={onToggleFolder}
                forceOpen={forceOpen}
                ancestorHrefs={ancestorHrefs}
              />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <li>
      <Link
        href={node.href}
        className={active ? "docs-nav-link is-active" : "docs-nav-link"}
      >
        {node.title}
      </Link>
      {hasChildren ? (
        <ul>
          {node.children.map((child) => (
            <NavItem
              key={child.href}
              node={child}
              pathname={pathname}
              openFolders={openFolders}
              onToggleFolder={onToggleFolder}
              forceOpen={forceOpen}
              ancestorHrefs={ancestorHrefs}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function DocsNav({ tree }: { tree: DocTreeNode[] }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [openFolders, setOpenFolders] = useState<Set<string>>(() => new Set());
  const ancestorHrefs = useMemo(() => getAncestorHrefs(pathname), [pathname]);

  const filteredTree = useMemo(
    () => filterDocsTree(tree, query),
    [tree, query],
  );

  const flatEntries = useMemo(() => flattenDocsTree(tree), [tree]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return flatEntries
      .filter(
        (entry) =>
          entry.title.toLowerCase().includes(q) ||
          entry.pathLabel.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [flatEntries, query]);

  const forceOpen = query.trim().length > 0;

  function toggleFolder(href: string) {
    setOpenFolders((current) => {
      const next = new Set(current);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  }

  return (
    <div className="docs-sidebar-inner">
      <label className="docs-search-label" htmlFor="docs-nav-search">
        Search bible
      </label>
      <input
        id="docs-nav-search"
        type="search"
        className="ui-input"
        placeholder="Search notes…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {searchResults.length > 0 ? (
        <ul className="docs-nav-list">
          {searchResults.map((entry) => (
            <li key={entry.href}>
              <Link
                href={entry.href}
                className={
                  isActive(pathname, entry.href)
                    ? "docs-nav-link is-active"
                    : "docs-nav-link"
                }
                onClick={() => setQuery("")}
              >
                {entry.title}
                <span className="muted"> · {entry.pathLabel}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : query.trim() ? (
        <p className="docs-nav-empty">No notes match that search.</p>
      ) : (
        <nav aria-label="Campaign docs">
          <ul className="docs-nav-list">
            {filteredTree.map((node) => (
              <NavItem
                key={node.href}
                node={node}
                pathname={pathname}
                openFolders={openFolders}
                onToggleFolder={toggleFolder}
                forceOpen={forceOpen}
                ancestorHrefs={ancestorHrefs}
              />
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
