"use client";

import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rewriteDocHref } from "@/lib/doc-links";

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
        a({ href, children }) {
          const next = rewriteDocHref(href, dirSlug);
          if (!next) return <span>{children}</span>;
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
