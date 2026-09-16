function normalizePosix(input: string): string {
  const parts: string[] = [];
  for (const part of input.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}

export function rewriteDocHref(
  href: string | undefined,
  dirSlug: string[],
): string | undefined {
  if (!href) return href;
  if (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("#")
  ) {
    return href;
  }

  const hashIndex = href.indexOf("#");
  const pathname = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  if (!pathname) return href;

  let raw = pathname;
  if (raw.startsWith("/")) {
    raw = raw.replace(/^\/+/, "");
    if (raw.startsWith("docs/")) raw = raw.slice("docs/".length);
  } else {
    const from = dirSlug.join("/");
    raw = normalizePosix(from ? `${from}/${raw}` : raw);
  }

  raw = raw.replace(/\.md$/i, "").replace(/\/README$/i, "");
  if (!raw) return `/docs${hash}`;
  return `/docs/${raw}${hash}`;
}
