import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsBreadcrumbs } from "@/components/docs-breadcrumbs";
import { MarkdownDoc } from "@/components/markdown-doc";
import { getDocPage } from "@/lib/docs";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/docs/[[...slug]]">) {
  const { slug } = await props.params;
  const page = getDocPage(slug ?? []);
  return {
    title: page ? `${page.title} · Dark Sun` : "Not found · Dark Sun",
  };
}

function listingKind(href: string): string {
  if (href.endsWith("/README") || href === "/docs") return "Overview";
  return "Note";
}

export default async function DocsPage(props: PageProps<"/docs/[[...slug]]">) {
  const { slug } = await props.params;
  const page = getDocPage(slug ?? []);
  if (!page) notFound();

  if (page.kind === "listing") {
    return (
      <article>
        <DocsBreadcrumbs slug={page.dirSlug} />
        <h1>{page.title}</h1>
        {page.listing.length === 0 ? (
          <p className="muted">No notes in this folder yet.</p>
        ) : (
          <div className="docs-listing-grid">
            {page.listing.map((item) => (
              <Link key={item.href} href={item.href} className="docs-listing-card">
                <span className="docs-listing-title">{item.title}</span>
                <span className="docs-listing-kind">{listingKind(item.href)}</span>
              </Link>
            ))}
          </div>
        )}
      </article>
    );
  }

  return (
    <article className="prose-doc">
      <DocsBreadcrumbs slug={slug ?? []} />
      <MarkdownDoc content={page.content} dirSlug={page.dirSlug} />
    </article>
  );
}
