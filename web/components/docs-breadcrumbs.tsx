import Link from "next/link";
import { breadcrumbsFromSlug } from "@/lib/docs-nav-utils";

export function DocsBreadcrumbs({ slug }: { slug: string[] }) {
  const items = breadcrumbsFromSlug(slug);

  return (
    <nav className="docs-breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.href}>
            {index > 0 && <span className="docs-breadcrumb-sep">/</span>}
            {isLast ? (
              <span className="docs-breadcrumb-current">{item.label}</span>
            ) : (
              <Link href={item.href}>{item.label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
