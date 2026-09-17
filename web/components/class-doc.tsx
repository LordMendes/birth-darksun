import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rewriteDocHref } from "@/lib/doc-links";
import {
  parseClassPage,
  parseClassesIndex,
  type ClassIndexEntry,
  type ClassSection,
  type ClassSupportEntry,
} from "@/lib/parse-class-page";

function ClassCopy({
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

function FieldGroup({
  id,
  title,
  sections,
  dirSlug,
}: {
  id: string;
  title: string;
  sections: ClassSection[];
  dirSlug: string[];
}) {
  if (sections.length === 0) return null;
  return (
    <section className="race-group" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <dl className="race-fields">
        {sections.map((section) => (
          <div key={section.id} className="race-field">
            <dt id={section.id}>{section.heading}</dt>
            <dd>
              <ClassCopy content={section.body} dirSlug={dirSlug} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="race-stat">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatBab(value?: string): string | undefined {
  if (!value) return undefined;
  const map: Record<string, string> = {
    full: "Full",
    "three-quarters": "3/4",
    half: "1/2",
  };
  return map[value] ?? value;
}

function formatSave(value?: string): string | undefined {
  if (!value) return undefined;
  return value === "good" ? "Good" : value === "poor" ? "Poor" : value;
}

export function ClassDoc({
  content,
  dirSlug,
  meta,
}: {
  content: string;
  dirSlug: string[];
  meta: Record<string, string>;
}) {
  const cls = parseClassPage(content);
  const jumps = [
    cls.making.length ? { href: "#making", label: "Making" } : null,
    cls.featuresIntro || cls.features.length
      ? { href: "#class-features", label: "Features" }
      : null,
    cls.play.length ? { href: "#play", label: "Play" } : null,
    cls.society.length ? { href: "#society", label: "Society" } : null,
    cls.packages ? { href: "#starting-packages", label: "Packages" } : null,
  ].filter((item): item is { href: string; label: string } => item !== null);

  return (
    <>
      <header className="race-header">
        <h1>{cls.title}</h1>
        <dl className="race-stats class-stats">
          <Stat label="Hit die" value={meta.hit_die} />
          <Stat label="BAB" value={formatBab(meta.bab)} />
          <Stat label="Fort" value={formatSave(meta.fort)} />
          <Stat label="Ref" value={formatSave(meta.ref)} />
          <Stat label="Will" value={formatSave(meta.will)} />
          <Stat label="Skills" value={meta.skill_points ? `${meta.skill_points}/level` : undefined} />
        </dl>
        {cls.quote ? (
          <figure className="race-quote">
            <blockquote>
              <p>{cls.quote}</p>
            </blockquote>
            {cls.attribution ? (
              <figcaption>— {cls.attribution}</figcaption>
            ) : null}
          </figure>
        ) : null}
        {cls.overview ? (
          <div className="race-overview">
            <ClassCopy content={cls.overview} dirSlug={dirSlug} />
          </div>
        ) : null}
      </header>
      <JumpNav items={jumps} />
      <FieldGroup
        id="making"
        title="Making the class"
        sections={cls.making}
        dirSlug={dirSlug}
      />
      {cls.featuresIntro || cls.features.length ? (
        <section className="race-group class-features-group" aria-labelledby="class-features">
          <h2 id="class-features">Class features</h2>
          {cls.featuresIntro ? (
            <div className="class-features-intro">
              <ClassCopy content={cls.featuresIntro} dirSlug={dirSlug} />
            </div>
          ) : null}
          {cls.features.length > 0 ? (
            <dl className="race-traits class-features">
              {cls.features.map((feature, index) => (
                <div
                  key={`${feature.name}-${index}`}
                  className={feature.body ? "race-trait" : "race-trait is-bare"}
                >
                  {feature.name ? <dt>{feature.name}</dt> : null}
                  {feature.body ? (
                    <dd>
                      <ClassCopy content={feature.body} dirSlug={dirSlug} />
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ) : null}
      <FieldGroup id="play" title="At the table" sections={cls.play} dirSlug={dirSlug} />
      <FieldGroup id="society" title="Society" sections={cls.society} dirSlug={dirSlug} />
      {cls.packages ? (
        <section className="race-group" aria-labelledby="starting-packages">
          <h2 id="starting-packages">Starting packages</h2>
          <ClassCopy content={cls.packages} dirSlug={dirSlug} />
        </section>
      ) : null}
      {cls.sources ? (
        <footer className="race-sources">
          <h2 id="sources">Sources</h2>
          <ClassCopy content={cls.sources} dirSlug={dirSlug} />
        </footer>
      ) : null}
    </>
  );
}

function ClassIndexCard({
  entry,
  dirSlug,
}: {
  entry: ClassIndexEntry;
  dirSlug: string[];
}) {
  const href = rewriteDocHref(entry.href, dirSlug) ?? entry.href;
  return (
    <Link href={href} className="race-index-card class-index-card">
      <span className="race-index-name">{entry.name}</span>
      <dl className="race-index-meta">
        <div>
          <dt>HD</dt>
          <dd>{entry.hitDie}</dd>
        </div>
        <div>
          <dt>BAB</dt>
          <dd>{entry.bab}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{entry.role}</dd>
        </div>
      </dl>
      {entry.delta ? <span className="class-index-delta">{entry.delta}</span> : null}
    </Link>
  );
}

function SupportCard({
  entry,
  dirSlug,
}: {
  entry: ClassSupportEntry;
  dirSlug: string[];
}) {
  const href = rewriteDocHref(entry.href, dirSlug) ?? entry.href;
  return (
    <Link href={href} className="race-support-card">
      <span className="race-index-name">{entry.name}</span>
      <span className="race-support-copy">{entry.summary}</span>
    </Link>
  );
}

export function ClassesIndexDoc({
  content,
  dirSlug,
}: {
  content: string;
  dirSlug: string[];
}) {
  const page = parseClassesIndex(content);
  return (
    <>
      <h1>Character classes</h1>
      <div className="race-overview">
        <ClassCopy content={page.intro} dirSlug={dirSlug} />
      </div>
      {page.literacy ? (
        <section className="class-literacy-note" aria-labelledby="literacy">
          <h2 id="literacy">Literacy</h2>
          <ClassCopy content={page.literacy} dirSlug={dirSlug} />
        </section>
      ) : null}
      <h2 id="class-index">Class index</h2>
      <div className="race-index-grid">
        {page.classes.map((entry) => (
          <ClassIndexCard key={entry.name} entry={entry} dirSlug={dirSlug} />
        ))}
      </div>
      <h2 id="supporting-pages">Supporting pages</h2>
      <div className="race-support-grid">
        {page.supporting.map((entry) => (
          <SupportCard key={entry.name} entry={entry} dirSlug={dirSlug} />
        ))}
      </div>
      {page.sources ? (
        <footer className="race-sources">
          <h2 id="sources">Sources</h2>
          <ClassCopy content={page.sources} dirSlug={dirSlug} />
        </footer>
      ) : null}
    </>
  );
}
