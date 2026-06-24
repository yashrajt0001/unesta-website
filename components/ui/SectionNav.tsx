"use client";

import { useEffect, useState } from "react";

/**
 * Sticky in-page section nav (desktop). Highlights the section currently in
 * view and smooth-scrolls to a section on click. Sections are referenced by
 * the `id` set on their wrapper element.
 */
export function SectionNav({
  sections,
}: {
  sections: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  function jump(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <nav className="hidden lg:flex items-center gap-1 sticky top-20 z-30 bg-surface/70 backdrop-blur-md rounded-full p-1 w-fit border border-outline-variant/20 shadow-soft">
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => jump(s.id)}
            aria-current={isActive ? "true" : undefined}
            className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${
              isActive
                ? "text-on-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {isActive && (
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-primary-container shadow-glow-primary" />
            )}
            <span className="relative">{s.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
