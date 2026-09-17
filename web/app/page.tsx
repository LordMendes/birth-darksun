import Link from "next/link";

const SHORTCUTS = [
  { href: "/docs/campaign", label: "Campaign" },
  { href: "/docs/world", label: "World" },
  { href: "/docs/races", label: "Races" },
  { href: "/docs/classes", label: "Classes" },
  { href: "/docs/heroic", label: "Heroic" },
  { href: "/docs/rules", label: "Rules" },
  { href: "/docs/sessions", label: "Sessions" },
  { href: "/docs/people", label: "People" },
] as const;

export default function Home() {
  return (
    <main className="tools-home">
      <p className="lede">D&amp;D 3.5 · Athas</p>
      <h1>Campaign tools</h1>
      <p className="tools-intro">
        Map the Tablelands, plan trade-route travel, and read every campaign note
        in one place.
      </p>
      <div className="tool-grid">
        <Link className="tool-card" href="/map">
          <span className="tool-card-label">Explore</span>
          <h2>Athas atlas</h2>
          <p>
            Pan the map, search settlements, hover regions, and calculate travel
            along trade routes.
          </p>
          <span className="tool-card-action">Open atlas →</span>
        </Link>
        <Link className="tool-card" href="/docs">
          <span className="tool-card-label">Reference</span>
          <h2>Campaign bible</h2>
          <p>
            Browse world notes, sessions, rules, and NPCs with search and a folder
            index.
          </p>
          <span className="tool-card-action">Open bible →</span>
        </Link>
      </div>
      <section className="shortcuts-section" aria-labelledby="bible-shortcuts">
        <h2 id="bible-shortcuts">Jump into the bible</h2>
        <div className="shortcuts-grid">
          {SHORTCUTS.map(({ href, label }) => (
            <Link key={href} href={href} className="shortcut-link">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
