"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastKind = "success" | "error" | "info";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  show: (message: string, kind?: ToastKind) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = "info") => {
      idRef.current += 1;
      const id = idRef.current;
      setToasts((current) => [...current, { id, kind, message }]);
      window.setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss],
  );

  const success = useCallback((m: string) => show(m, "success"), [show]);
  const error = useCallback((m: string) => show(m, "error"), [show]);
  const info = useCallback((m: string) => show(m, "info"), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto pointer-events-none"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: number) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [dragX, setDragX] = useState(0);
  const dragStart = useRef<number | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 10);
    return () => window.clearTimeout(t);
  }, []);

  const palette: Record<
    ToastKind,
    { ring: string; icon: string; iconBg: string; bar: string }
  > = {
    success: {
      ring: "ring-secondary/30",
      icon: "check_circle",
      iconBg: "bg-secondary-container text-on-secondary-container",
      bar: "bg-secondary",
    },
    error: {
      ring: "ring-error/30",
      icon: "error",
      iconBg: "bg-error-container text-on-error-container",
      bar: "bg-error",
    },
    info: {
      ring: "ring-primary/30",
      icon: "info",
      iconBg: "bg-primary-container text-on-primary-container",
      bar: "bg-primary",
    },
  };

  const p = palette[toast.kind];
  const dragging = dragStart.current !== null;

  function onPointerDown(e: React.PointerEvent) {
    dragStart.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragStart.current === null) return;
    setDragX(Math.max(0, e.clientX - dragStart.current));
  }
  function onPointerUp() {
    if (dragStart.current === null) return;
    dragStart.current = null;
    if (dragX > 80) onDismiss(toast.id);
    else setDragX(0);
  }

  return (
    <div
      role="status"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{
        transform: dragX ? `translateX(${dragX}px)` : undefined,
        opacity: dragX ? Math.max(0, 1 - dragX / 160) : undefined,
        transition: dragging ? "none" : "transform 0.25s, opacity 0.25s",
      }}
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 bg-surface-container-lowest border border-outline-variant/40 ring-1 ${p.ring} shadow-float rounded-2xl px-4 py-3 touch-pan-y ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-3"
      }`}
    >
      <span
        className={`material-symbols-outlined p-1.5 rounded-full text-sm ${p.iconBg}`}
        style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
      >
        {p.icon}
      </span>
      <p className="flex-1 text-sm font-medium text-on-surface leading-snug">
        {toast.message}
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
        className="text-on-surface-variant hover:text-on-surface transition-colors"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
      <span
        className={`absolute bottom-0 left-0 h-0.5 ${p.bar} opacity-60 toast-progress`}
      />
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
