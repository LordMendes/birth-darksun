import Link from "next/link";

export default function NotFound() {
  return (
    <main className="tools-home">
      <p className="lede">404</p>
      <h1>Page not found</h1>
      <p className="tools-intro">
        That route is not part of this app, or the note does not exist in the
        campaign bible.
      </p>
      <div className="not-found-actions">
        <Link href="/" className="ui-btn ui-btn-primary">
          Back to tools
        </Link>
        <Link href="/docs" className="ui-btn">
          Open bible
        </Link>
        <Link href="/map" className="ui-btn">
          Open atlas
        </Link>
      </div>
    </main>
  );
}
