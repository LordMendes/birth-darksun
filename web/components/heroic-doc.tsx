import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rewriteDocHref } from "@/lib/doc-links";
import {
  parseHeroicCatalog,
  parseHeroicIndex,
  parseHeroicReligion,
  type HeroicEntry,
  type HeroicIndexEntry,
  type HeroicTableSection,
} from "@/lib/parse-heroic-page";

function HeroicCopy({
  content,
  dirSlug,
}: {
  content: string;
  dirSlug: string[];
}) {
  if (!content.trim()) return null;
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        a({ href, children }) {
          const next = rewriteDocHref(href, dirSlug);
          if (!next) return <span>{children}</span>;
          if (next.startsWith("#")) return <a href={next}>{children}</a>;
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

function JumpNav({
  items,
}: {
  items: { href: string; label: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <nav className="race-jump" aria-label="On this page">
      {items.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

function EntryCards({
  entries,
  dirSlug,
}: {
  entries: HeroicEntry[];
  dirSlug: string[];
}) {
  if (entries.length === 0) return null;
  return (
    <dl className="race-traits">
      {entries.map((entry) => (
        <div
          key={entry.id}
          id={entry.id}
          className={entry.body ? "race-trait" : "race-trait is-bare"}
        >
          <dt>{entry.name}</dt>
          {entry.body ? (
            <dd>
              <HeroicCopy content={entry.body} dirSlug={dirSlug} />
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

function TableSections({
  tables,
  dirSlug,
}: {
  tables: HeroicTableSection[];
  dirSlug: string[];
}) {
  if (tables.length === 0) return null;
  return (
    <>
      {tables.map((table) => (
        <section
          key={table.id}
          className="race-group heroic-table-group"
          aria-labelledby={table.id}
        >
          <h2 id={table.id}>{table.heading}</h2>
          <HeroicCopy content={table.body} dirSlug={dirSlug} />
        </section>
      ))}
    </>
  );
}

function IndexCard({
  entry,
  dirSlug,
}: {
  entry: HeroicIndexEntry;
  dirSlug: string[];
}) {
  const href = rewriteDocHref(entry.href, dirSlug) ?? entry.href;
  return (
    <Link href={href} className="race-index-card">
      <span className="race-index-name">{entry.name}</span>
      {entry.summary ? (
        <span className="race-support-copy">{entry.summary}</span>
      ) : null}
    </Link>
  );
}

export function HeroicIndexDoc({
  content,
  dirSlug,
}: {
  content: string;
  dirSlug: string[];
}) {
  const page = parseHeroicIndex(content);
  return (
    <>
      <header className="race-header">
        <h1>{page.title}</h1>
        {page.quote ? (
          <figure className="race-quote">
            <blockquote>
              <p>{page.quote}</p>
            </blockquote>
            {page.attribution ? (
              <figcaption>— {page.attribution}</figcaption>
            ) : null}
          </figure>
        ) : null}
        {page.intro ? (
          <div className="race-overview">
            <HeroicCopy content={page.intro} dirSlug={dirSlug} />
          </div>
        ) : null}
      </header>
      <h2 id="chapter-contents">Chapter contents</h2>
      <div className="race-index-grid">
        {page.sections.map((entry) => (
          <IndexCard key={entry.name} entry={entry} dirSlug={dirSlug} />
        ))}
      </div>
    </>
  );
}

export function HeroicCatalogDoc({
  content,
  dirSlug,
  wideTable = false,
}: {
  content: string;
  dirSlug: string[];
  wideTable?: boolean;
}) {
  const page = parseHeroicCatalog(content);
  const jumps = [
    page.tables.length ? { href: "#tables", label: "Tables" } : null,
    page.entries.length ? { href: "#entries", label: "Entries" } : null,
    page.sidebar ? { href: "#notes", label: "Notes" } : null,
  ].filter((item): item is { href: string; label: string } => item !== null);

  return (
    <>
      <header className="race-header">
        <h1>{page.title}</h1>
        {page.quote ? (
          <figure className="race-quote">
            <blockquote>
              <p>{page.quote}</p>
            </blockquote>
            {page.attribution ? (
              <figcaption>— {page.attribution}</figcaption>
            ) : null}
          </figure>
        ) : null}
        {page.intro ? (
          <div className="race-overview">
            <HeroicCopy content={page.intro} dirSlug={dirSlug} />
          </div>
        ) : null}
      </header>
      <JumpNav items={jumps} />
      {page.tables.length > 0 ? (
        <section
          id="tables"
          className={`race-group heroic-table-group${wideTable ? " heroic-skills-table" : ""}`}
          aria-labelledby="tables-heading"
        >
          <h2 id="tables-heading">Tables</h2>
          <TableSections tables={page.tables} dirSlug={dirSlug} />
        </section>
      ) : null}
      {page.entries.length > 0 ? (
        <section className="race-group" aria-labelledby="entries">
          <h2 id="entries">Entries</h2>
          <EntryCards entries={page.entries} dirSlug={dirSlug} />
        </section>
      ) : null}
      {page.sidebar ? (
        <aside className="class-literacy-note" aria-labelledby="notes">
          <h2 id="notes">Notes</h2>
          <HeroicCopy content={page.sidebar} dirSlug={dirSlug} />
        </aside>
      ) : null}
    </>
  );
}

export function HeroicReligionDoc({
  content,
  dirSlug,
}: {
  content: string;
  dirSlug: string[];
}) {
  const page = parseHeroicReligion(content);
  const jumps = page.groups.map((group) => ({
    href: `#${group.id}`,
    label: group.heading,
  }));

  return (
    <>
      <header className="race-header">
        <h1>{page.title}</h1>
        {page.intro ? (
          <div className="race-overview">
            <HeroicCopy content={page.intro} dirSlug={dirSlug} />
          </div>
        ) : null}
      </header>
      <JumpNav items={jumps} />
      {page.groups.map((group) => (
        <section key={group.id} className="race-group" aria-labelledby={group.id}>
          <h2 id={group.id}>{group.heading}</h2>
          {group.intro ? (
            <div className="race-traits-intro">
              <HeroicCopy content={group.intro} dirSlug={dirSlug} />
            </div>
          ) : null}
          <EntryCards entries={group.entries} dirSlug={dirSlug} />
        </section>
      ))}
      {page.tableNote ? (
        <footer className="race-sources">
          <h2 id="table-note">Table note</h2>
          <HeroicCopy content={page.tableNote} dirSlug={dirSlug} />
        </footer>
      ) : null}
    </>
  );
}
