"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function DocsShell({
  nav,
  children,
}: {
  nav: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState({ path: pathname, open: false });
  const open = drawer.open && drawer.path === pathname;

  function toggleDrawer() {
    setDrawer((current) =>
      current.path === pathname
        ? { path: pathname, open: !current.open }
        : { path: pathname, open: true },
    );
  }

  function closeDrawer() {
    setDrawer({ path: pathname, open: false });
  }

  return (
    <div className="docs-shell">
      <div className="docs-toolbar">
        <button
          type="button"
          className="docs-menu-button"
          aria-expanded={open}
          aria-controls="docs-sidebar"
          onClick={toggleDrawer}
        >
          {open ? "Close index" : "Open index"}
        </button>
      </div>
      {open ? (
        <button
          type="button"
          className="docs-backdrop"
          aria-label="Close index"
          onClick={closeDrawer}
        />
      ) : null}
      <aside
        id="docs-sidebar"
        className={open ? "docs-sidebar is-open" : "docs-sidebar"}
      >
        {nav}
      </aside>
      <div className="docs-main">{children}</div>
    </div>
  );
}
