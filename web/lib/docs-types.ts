export type DocTreeNode = {
  name: string;
  title: string;
  href: string;
  slug: string[];
  type: "file" | "dir";
  children: DocTreeNode[];
};

export type DocListingItem = {
  title: string;
  href: string;
};

export type DocPage =
  | {
      kind: "file";
      title: string;
      content: string;
      relPath: string;
      dirSlug: string[];
      meta: Record<string, string>;
    }
  | {
      kind: "listing";
      title: string;
      dirSlug: string[];
      listing: DocListingItem[];
    };
