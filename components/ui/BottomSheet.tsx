"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * A bottom sheet on mobile, centered dialog on larger screens.
 * Supports drag-to-dismiss from the grab handle / header, body-scroll lock,
 * ESC to close and a spring entrance. Used for search + reservation flows.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const dragStart = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      setDragY(0);
      dragStart.current = null;
    };
  }, [open, onClose]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only start a drag on the grab area (handle / header), not the body.
    dragStart.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = e.clientY - dragStart.current;
    setDragY(Math.max(0, delta));
  }, []);

  const onPointerUp = useCallback(() => {
    if (dragStart.current === null) return;
    dragStart.current = null;
    setDragY((d) => {
      if (d > 130) {
        onClose();
        return 0;
      }
      return 0;
    });
  }, [onClose]);

  if (!open) return null;

  const dragging = dragStart.current !== null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 glass-dark animate-overlay-in cursor-default"
      />

      <div
        ref={sheetRef}
        className="relative w-full sm:max-w-md bg-surface-container-lowest rounded-t-[2rem] sm:rounded-[2rem] shadow-float max-h-[92vh] flex flex-col animate-sheet-up sm:animate-scale-in"
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? "none" : "transform 0.35s var(--ease-spring)",
        }}
      >
        {/* Grab area — drag from here to dismiss */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="pt-3 px-5 sm:px-6 shrink-0 cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="w-10 h-1.5 bg-surface-container-highest rounded-full mx-auto sm:hidden" />
          <header className="flex items-center justify-between mt-3 mb-1">
            <h2 className="text-lg sm:text-xl font-headline font-semibold">
              {title}
            </h2>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid place-items-center w-9 h-9 bg-surface-container-low rounded-full hover:bg-surface-container press"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </header>
        </div>

        <div className="overflow-y-auto px-5 sm:px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
}
