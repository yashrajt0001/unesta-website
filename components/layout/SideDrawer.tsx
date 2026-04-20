"use client";

import Link from "next/link";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function SideDrawer({ open, onClose }: SideDrawerProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 h-full w-[280px] bg-surface-container-lowest z-[70] transition-transform duration-300 ease-in-out shadow-2xl ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">travel_explore</span>
              <h2 className="text-xl font-bold text-on-surface font-headline tracking-tight">
                UNesta
              </h2>
            </div>
            <button
              className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
              onClick={onClose}
              aria-label="Close menu"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-2">
            <Link
              href="/login"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors font-medium text-on-surface"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-on-surface-variant">person</span>
              Login / Sign up
            </Link>

            <div className="h-px bg-outline-variant/30 my-4" />

            <Link
              href="/experiences"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors font-medium text-on-surface"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-on-surface-variant">explore</span>
              Experiences
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors font-medium text-on-surface"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-on-surface-variant">home_work</span>
              Host your space
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors font-medium text-on-surface"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-on-surface-variant">event_available</span>
              Host your experience
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors font-medium text-on-surface"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-on-surface-variant">groups</span>
              Community Center
            </Link>
            <Link
              href="#"
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors font-medium text-on-surface"
              onClick={onClose}
            >
              <span className="material-symbols-outlined text-on-surface-variant">mail</span>
              Contact Us
            </Link>
          </nav>

          <div className="mt-auto">
            <p className="text-xs text-on-surface-variant/60 font-medium">© 2026 UNesta</p>
          </div>
        </div>
      </aside>
    </>
  );
}
