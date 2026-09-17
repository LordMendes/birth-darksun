import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownDoc } from "@/components/markdown-doc";
import { rewriteDocHref } from "@/lib/doc-links";
import {
  parseLegaciesPage,
  splitTypicalPowers,
  type LegacyProfile,
} from "@/lib/parse-legacies-page";

function DocInline({
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
        p({ children }) {
          return <>{children}</>;
        },
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

function TypicalPowers({ body }: { body: string }) {
  const powers = splitTypicalPowers(body);
  return (
    <ul className="legacy-power-pills">
      {powers.map((power) => (
        <li key={power}>{power}</li>
      ))}
    </ul>
  );
}

function LegacyCard({
  profile,
  dirSlug,
}: {
  profile: LegacyProfile;
  dirSlug: string[];
}) {
  return (
    <article
      className="legacy-card"
      data-legacy={profile.id}
      data-kind={profile.kind.toLowerCase()}
    >
      <header className="legacy-card-header">
        <h3 id={profile.id}>{profile.name}</h3>
        {profile.kind ? <span className="legacy-card-kind">{profile.kind}</span> : null}
      </header>
      <p className="legacy-card-lede">
        <DocInline content={profile.summary} dirSlug={dirSlug} />
      </p>
      <dl className="legacy-card-fields">
        {profile.fields.map((field) => (
          <div key={field.label} className="legacy-card-field">
            <dt>{field.label}</dt>
            <dd>
              {field.label === "Typical powers" ? (
                <TypicalPowers body={field.body} />
              ) : (
                <DocInline content={field.body} dirSlug={dirSlug} />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

export function LegaciesDoc({
  content,
  dirSlug,
}: {
  content: string;
  dirSlug: string[];
}) {
  const { intro, profiles, rest } = parseLegaciesPage(content);

  return (
    <>
      <MarkdownDoc content={intro} dirSlug={dirSlug} />
      <h2 id="the-seven-legacies">The seven legacies</h2>
      <nav className="legacy-jump" aria-label="The seven legacies">
        {profiles.map((profile) => (
          <a key={profile.id} href={`#${profile.id}`}>
            {profile.name}
          </a>
        ))}
      </nav>
      <div className="legacy-profiles">
        {profiles.map((profile) => (
          <LegacyCard key={profile.id} profile={profile} dirSlug={dirSlug} />
        ))}
      </div>
      <MarkdownDoc content={rest} dirSlug={dirSlug} />
    </>
  );
}
