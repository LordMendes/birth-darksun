"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AtlasPlace } from "@/lib/atlas/types";

type Props = {
  places: AtlasPlace[];
  onSelect: (place: AtlasPlace | null) => void;
};

export function AtlasSearch({ places, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = "atlas-search-results";

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return places
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [places, query]);

  const activeHighlight =
    results.length > 0
      ? Math.max(0, Math.min(highlightIndex, results.length - 1))
      : -1;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function choose(place: AtlasPlace) {
    onSelect(place);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setQuery("");
      return;
    }

    if (results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setHighlightIndex((index) =>
        results.length === 0 ? -1 : (Math.max(0, index) + 1) % results.length,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setHighlightIndex((index) =>
        results.length === 0
          ? -1
          : index <= 0
            ? results.length - 1
            : index - 1,
      );
    } else if (event.key === "Enter" && activeHighlight >= 0) {
      event.preventDefault();
      choose(results[activeHighlight]!);
    }
  }

  const showResults = open && results.length > 0;

  return (
    <div className="atlas-search" ref={rootRef}>
      <input
        type="search"
        placeholder="Search Athas…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setHighlightIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className="atlas-search-input ui-input"
        aria-label="Search places"
        aria-autocomplete="list"
        aria-controls={showResults ? listId : undefined}
        aria-expanded={showResults}
        role="combobox"
      />
      {showResults ? (
        <ul
          id={listId}
          className="atlas-search-results"
          role="listbox"
          aria-label="Place search results"
        >
          {results.map((place, index) => (
            <li key={place.id} role="option" aria-selected={index === activeHighlight}>
              <button
                type="button"
                className={
                  index === activeHighlight
                    ? "atlas-search-item is-highlighted"
                    : "atlas-search-item"
                }
                onMouseEnter={() => setHighlightIndex(index)}
                onClick={() => choose(place)}
              >
                {place.name}
                {place.wandererType && (
                  <span className="muted"> · {place.wandererType}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
