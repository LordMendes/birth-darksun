"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { LegacyPowerEntry } from "@/lib/legacy-power-types";

const TYPE_LABELS: Record<string, string> = {
  Ex: "Extraordinary",
  Su: "Supernatural",
  Sp: "Spell-like",
};

export function LegacyPowerTip({
  power,
  label,
}: {
  power: LegacyPowerEntry;
  label: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width, 260), 360);
    const left = Math.min(
      Math.max(12, rect.left),
      window.innerWidth - width - 12,
    );
    const belowTop = rect.bottom + 8;
    const popoverHeight = popoverRef.current?.offsetHeight ?? 220;
    const top =
      belowTop + popoverHeight > window.innerHeight - 12
        ? Math.max(12, rect.top - popoverHeight - 8)
        : belowTop;

    setPosition({ top, left, width });
  }, []);

  const toggle = useCallback(() => {
    setOpen((current) => {
      const next = !current;
      if (next) {
        requestAnimationFrame(updatePosition);
      }
      return next;
    });
  }, [updatePosition]);

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const onLayout = () => updatePosition();

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onLayout);
    window.addEventListener("scroll", onLayout, true);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onLayout);
      window.removeEventListener("scroll", onLayout, true);
    };
  }, [open, updatePosition]);

  const typeLabel = TYPE_LABELS[power.type] ?? power.type;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="legacy-power-tip"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        onClick={toggle}
      >
        {label}
      </button>
      {open &&
        createPortal(
          <div
            ref={popoverRef}
            id={tooltipId}
            role="tooltip"
            className="legacy-power-popover"
            style={{
              top: position.top,
              left: position.left,
              width: position.width,
            }}
          >
            <div className="legacy-power-popover-header">
              <strong>{power.name}</strong>
              <span>
                {power.legacy} · {power.tier} · {typeLabel}
              </span>
            </div>
            <p>{power.effect}</p>
          </div>,
          document.body,
        )}
    </>
  );
}
