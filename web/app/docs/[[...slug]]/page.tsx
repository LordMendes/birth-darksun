import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsBreadcrumbs } from "@/components/docs-breadcrumbs";
import { LegaciesDoc } from "@/components/legacies-doc";
import { MarkdownDoc } from "@/components/markdown-doc";
import { RaceDoc, RacesIndexDoc, RegionsDoc } from "@/components/race-doc";
import { getDocPage } from "@/lib/docs";
import { getLegacyPowerRecord } from "@/lib/legacy-powers";
import { racePageKind } from "@/lib/parse-race-page";

function proseClassName(relPath: string): string {
  const classes = ["prose-doc"];
  if (relPath === "rules/legacies.md") classes.push("legacies-doc");
  if (relPath === "rules/blood-abilities/descriptions.md") {
    classes.push("power-descriptions-doc");
  }
  if (relPath === "rules/blood-abilities/legacy-tables.md") {
    classes.push("legacy-tables-doc");
  }
  const raceKind = racePageKind(relPath);
  if (raceKind) classes.push("races-doc");
  if (raceKind === "vital") classes.push("vital-stats-doc");
  return classes.join(" ");
}

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

  const legacyPowers =
    page.relPath === "rules/blood-abilities/legacy-tables.md"
      ? getLegacyPowerRecord()
      : undefined;
  const raceKind = racePageKind(page.relPath);

  return (
    <article className={proseClassName(page.relPath)}>
      <DocsBreadcrumbs slug={slug ?? []} />
      {page.relPath === "rules/legacies.md" ? (
        <LegaciesDoc content={page.content} dirSlug={page.dirSlug} />
      ) : raceKind === "entity" ? (
        <RaceDoc
          content={page.content}
          dirSlug={page.dirSlug}
          meta={page.meta}
        />
      ) : raceKind === "index" ? (
        <RacesIndexDoc content={page.content} dirSlug={page.dirSlug} />
      ) : raceKind === "regions" ? (
        <RegionsDoc content={page.content} dirSlug={page.dirSlug} />
      ) : (
        <MarkdownDoc
          content={page.content}
          dirSlug={page.dirSlug}
          legacyPowers={legacyPowers}
        />
      )}
    </article>
  );
}
