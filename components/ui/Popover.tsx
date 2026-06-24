"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT_SOFT } from "@/components/ui/motion";

/**
 * Click-to-open dropdown anchored to a trigger button. Closes on outside click
 * or ESC. The panel animates in with a spring-ish scale/fade from the top.
 */
export function Popover({
  label,
  icon,
  active = false,
  align = "left",
  children,
}: {
  label: ReactNode;
  icon?: string;
  active?: boolean;
  align?: "left" | "right";
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold border press transition-colors ${
          active || open
            ? "bg-primary-fixed/60 border-primary/40 text-primary"
            : "bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:border-primary/30"
        }`}
      >
        {icon && (
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        )}
        {label}
        <span
          className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: EASE_OUT_SOFT }}
            style={{ transformOrigin: "top" }}
            className={`absolute z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-surface-container-lowest rounded-3xl shadow-float border border-outline-variant/20 p-5 ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
