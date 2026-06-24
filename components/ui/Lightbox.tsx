"use client";

import { useCallback, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE_OUT_SOFT } from "@/components/ui/motion";

/**
 * Full-screen image viewer. Opens from the gallery with a fade/scale, supports
 * keyboard arrows + ESC, swipe-to-change on touch, a counter and a thumbnail rail.
 */
export function Lightbox({
  images,
  index,
  alt,
  onClose,
  onIndex,
}: {
  images: { id?: string; url: string }[];
  index: number | null;
  alt: string;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const reduce = useReducedMotion();
  const open = index !== null;
  const count = images.length;

  const go = useCallback(
    (dir: number) => {
      if (index === null) return;
      onIndex((index + dir + count) % count);
    },
    [index, count, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, go]);

  return (
    <AnimatePresence>
      {open && index !== null && (
        <motion.div
          className="fixed inset-0 z-[70] flex flex-col bg-black/92 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 text-white shrink-0">
            <span className="text-sm font-semibold tabular-nums">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close viewer"
              className="grid place-items-center w-10 h-10 rounded-full glass-dark hover:bg-white/20 press"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Main stage */}
          <div className="relative flex-1 flex items-center justify-center px-2 sm:px-16 overflow-hidden">
            {count > 1 && (
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous photo"
                className="hidden sm:grid place-items-center absolute left-4 z-10 w-12 h-12 rounded-full glass-dark text-white hover:bg-white/20 press"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
            )}

            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={images[index].id ?? index}
                src={images[index].url}
                alt={alt}
                drag={count > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) go(1);
                  else if (info.offset.x > 80) go(-1);
                }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: EASE_OUT_SOFT }}
                className="max-h-full max-w-full object-contain rounded-2xl select-none cursor-grab active:cursor-grabbing"
              />
            </AnimatePresence>

            {count > 1 && (
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next photo"
                className="hidden sm:grid place-items-center absolute right-4 z-10 w-12 h-12 rounded-full glass-dark text-white hover:bg-white/20 press"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            )}
          </div>

          {/* Thumbnail rail */}
          {count > 1 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 sm:px-6 py-4 justify-start sm:justify-center shrink-0">
              {images.map((img, i) => (
                <button
                  key={img.id ?? i}
                  type="button"
                  onClick={() => onIndex(i)}
                  aria-label={`View photo ${i + 1}`}
                  className={`relative flex-none w-16 h-16 rounded-xl overflow-hidden transition-all duration-300 ${
                    i === index
                      ? "ring-2 ring-white opacity-100"
                      : "opacity-50 hover:opacity-90"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
