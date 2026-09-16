"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Tools", match: (path: string) => path === "/" },
  { href: "/map", label: "Atlas", match: (path: string) => path.startsWith("/map") },
  {
    href: "/docs",
    label: "Bible",
    match: (path: string) => path.startsWith("/docs"),
  },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <Link href="/" className="site-brand">
        <span className="site-mark">Dark Sun</span>
        <span className="site-subtitle">Athas tools</span>
      </Link>
      <nav className="site-nav" aria-label="Main">
        {NAV.map(({ href, label, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={active ? "site-nav-link is-active" : "site-nav-link"}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
