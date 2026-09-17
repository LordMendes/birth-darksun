import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { rewriteDocHref } from "@/lib/doc-links";
import {
  parseRacePage,
  parseRacesIndex,
  parseRegionsPage,
  type RaceIndexEntry,
  type RaceSection,
} from "@/lib/parse-race-page";

function RaceCopy({
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
  sections: RaceSection[];
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
              <RaceCopy content={section.body} dirSlug={dirSlug} />
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

export function RaceDoc({
  content,
  dirSlug,
  meta,
}: {
  content: string;
  dirSlug: string[];
  meta: Record<string, string>;
}) {
  const race = parseRacePage(content);
  const jumps = [
    race.culture.length ? { href: "#culture", label: "Culture" } : null,
    race.beliefs.length ? { href: "#beliefs", label: "Beliefs" } : null,
    race.play.length ? { href: "#at-the-table", label: "Play" } : null,
    race.traits.length ? { href: "#racial-traits", label: "Traits" } : null,
  ].filter((item): item is { href: string; label: string } => item !== null);

  return (
    <>
      <header className="race-header">
        <h1>{race.title}</h1>
        <dl className="race-stats">
          <Stat label="Type" value={meta.creature_type} />
          <Stat label="Size" value={meta.size} />
          <Stat label="Level adj." value={meta.level_adjustment} />
          <Stat label="Favored class" value={meta.favored_class} />
        </dl>
        {race.quote ? (
          <figure className="race-quote">
            <blockquote>
              <p>{race.quote}</p>
            </blockquote>
            {race.attribution ? (
              <figcaption>— {race.attribution}</figcaption>
            ) : null}
          </figure>
        ) : null}
        {race.overview ? (
          <div className="race-overview">
            <RaceCopy content={race.overview} dirSlug={dirSlug} />
          </div>
        ) : null}
      </header>
      <JumpNav items={jumps} />
      <FieldGroup
        id="culture"
        title="Culture"
        sections={race.culture}
        dirSlug={dirSlug}
      />
      <FieldGroup
        id="beliefs"
        title="Beliefs and speech"
        sections={race.beliefs}
        dirSlug={dirSlug}
      />
      <FieldGroup
        id="at-the-table"
        title="At the table"
        sections={race.play}
        dirSlug={dirSlug}
      />
      {race.traits.length > 0 || race.traitsIntro ? (
        <section className="race-group race-traits-group" aria-labelledby="racial-traits">
          <h2 id="racial-traits">Racial traits</h2>
          {race.traitsIntro ? (
            <div className="race-traits-intro">
              <RaceCopy content={race.traitsIntro} dirSlug={dirSlug} />
            </div>
          ) : null}
          {race.traits.length > 0 ? (
            <dl className="race-traits">
              {race.traits.map((trait, index) => (
                <div
                  key={`${trait.name}-${index}`}
                  className={trait.body ? "race-trait" : "race-trait is-bare"}
                >
                  {trait.name ? <dt>{trait.name}</dt> : null}
                  {trait.body ? (
                    <dd>
                      <RaceCopy content={trait.body} dirSlug={dirSlug} />
                    </dd>
                  ) : null}
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ) : null}
      {race.sources ? (
        <footer className="race-sources">
          <h2 id="sources">Sources</h2>
          <RaceCopy content={race.sources} dirSlug={dirSlug} />
        </footer>
      ) : null}
    </>
  );
}

function IndexCard({
  entry,
  dirSlug,
  kind,
}: {
  entry: RaceIndexEntry;
  dirSlug: string[];
  kind: "race" | "support";
}) {
  const href = rewriteDocHref(entry.href, dirSlug) ?? entry.href;
  return (
    <Link href={href} className={kind === "race" ? "race-index-card" : "race-support-card"}>
      <span className="race-index-name">{entry.name}</span>
      {kind === "race" ? (
        <dl className="race-index-meta">
          <div>
            <dt>Ability</dt>
            <dd>{entry.ability}</dd>
          </div>
          <div>
            <dt>Favored</dt>
            <dd>{entry.favored}</dd>
          </div>
          <div>
            <dt>LA</dt>
            <dd>{entry.levelAdjustment}</dd>
          </div>
        </dl>
      ) : (
        <span className="race-support-copy">{entry.summary}</span>
      )}
    </Link>
  );
}

export function RacesIndexDoc({
  content,
  dirSlug,
}: {
  content: string;
  dirSlug: string[];
}) {
  const page = parseRacesIndex(content);
  return (
    <>
      <h1>Character races</h1>
      <div className="race-overview">
        <RaceCopy content={page.intro} dirSlug={dirSlug} />
      </div>
      <h2 id="playable-races">Playable races</h2>
      <div className="race-index-grid">
        {page.races.map((entry) => (
          <IndexCard key={entry.name} entry={entry} dirSlug={dirSlug} kind="race" />
        ))}
      </div>
      <h2 id="supporting-pages">Supporting pages</h2>
      <div className="race-support-grid">
        {page.supporting.map((entry) => (
          <IndexCard key={entry.name} entry={entry} dirSlug={dirSlug} kind="support" />
        ))}
      </div>
      {page.sources ? (
        <footer className="race-sources">
          <h2 id="sources">Sources</h2>
          <RaceCopy content={page.sources} dirSlug={dirSlug} />
        </footer>
      ) : null}
    </>
  );
}

export function RegionsDoc({
  content,
  dirSlug,
}: {
  content: string;
  dirSlug: string[];
}) {
  const page = parseRegionsPage(content);
  return (
    <>
      <h1>Region of origin</h1>
      <div className="race-overview">
        <RaceCopy content={page.intro} dirSlug={dirSlug} />
      </div>
      <JumpNav
        items={page.regions.map((region) => ({
          href: `#${region.id}`,
          label: region.name,
        }))}
      />
      <div className="region-grid">
        {page.regions.map((region) => (
          <article key={region.id} className="region-card">
            <h2 id={region.id}>{region.name}</h2>
            {region.summary ? (
              <div className="region-summary">
                <RaceCopy content={region.summary} dirSlug={dirSlug} />
              </div>
            ) : null}
            {region.fields.length > 0 ? (
              <dl className="race-fields region-fields">
                {region.fields.map((field, index) => (
                  <div key={`${field.label}-${index}`} className="race-field">
                    {field.label ? <dt>{field.label}</dt> : null}
                    <dd>
                      <RaceCopy content={field.body} dirSlug={dirSlug} />
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </article>
        ))}
      </div>
      {page.sources ? (
        <footer className="race-sources">
          <h2 id="sources">Sources</h2>
          <RaceCopy content={page.sources} dirSlug={dirSlug} />
        </footer>
      ) : null}
    </>
  );
}
