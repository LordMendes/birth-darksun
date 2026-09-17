"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rewriteDocHref } from "@/lib/doc-links";

function textFromNode(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).join("");
  if (typeof node === "object" && "props" in node) {
    const props = node as { props?: { children?: ReactNode } };
    return textFromNode(props.props?.children);
  }
  return "";
}

function headingId(children: ReactNode): string {
  return textFromNode(children)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function MarkdownDoc({
  content,
  dirSlug,
}: {
  content: string;
  dirSlug: string[];
}) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2({ children, node: _node, ...props }) {
          void _node;
          return (
            <h2 {...props} id={headingId(children)}>
              {children}
            </h2>
          );
        },
        h3({ children, node: _node, ...props }) {
          void _node;
          return (
            <h3 {...props} id={headingId(children)}>
              {children}
            </h3>
          );
        },
        a({ href, children }) {
          const next = rewriteDocHref(href, dirSlug);
          if (!next) return <span>{children}</span>;
          if (next.startsWith("#")) {
            return <a href={next}>{children}</a>;
          }
          if (
            next.startsWith("http://") ||
            next.startsWith("https://") ||
            next.startsWith("mailto:")
          ) {
            return (
              <a href={next} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          }
          return <Link href={next}>{children}</Link>;
        },
        table({ children }) {
          return (
            <div className="prose-doc-table-wrap">
              <table>{children}</table>
            </div>
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
}
