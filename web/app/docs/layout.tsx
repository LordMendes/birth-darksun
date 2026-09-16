import { DocsNav } from "@/components/docs-nav";
import { DocsShell } from "@/components/docs-shell";
import { getDocsTree } from "@/lib/docs";

export const dynamic = "force-dynamic";

export default function DocsLayout({ children }: LayoutProps<"/docs">) {
  const tree = getDocsTree();

  return (
    <DocsShell nav={<DocsNav tree={tree} />}>{children}</DocsShell>
  );
}
