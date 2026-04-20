"use client";

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  mode: "stays" | "experiences";
}

export default function SearchModal({ open, onClose, mode }: SearchModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-on-surface/20 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest w-full rounded-t-[3rem] p-4 sm:p-8 space-y-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-12 h-1 bg-surface-container-highest rounded-full mx-auto" />

        <header className="flex justify-between items-center">
          <h4 className="text-lg sm:text-xl font-headline font-bold">Refine your search</h4>
          <button
            className="p-2 bg-surface-container-low rounded-full"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {mode === "stays" ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 bg-surface-container-high rounded-lg flex justify-between items-center">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                  Location
                </p>
                <p className="font-medium text-sm">Udaipur, Rajasthan</p>
              </div>
              <span className="material-symbols-outlined text-primary">location_on</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-surface-container-high rounded-lg">
                <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                  Check In
                </p>
                <p className="font-medium text-sm">Select date</p>
              </div>
              <div className="p-3 sm:p-4 bg-surface-container-high rounded-lg">
                <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                  Check Out
                </p>
                <p className="font-medium text-sm">Select date</p>
              </div>
            </div>
            <div className="p-3 sm:p-4 bg-surface-container-high rounded-lg flex justify-between items-center">
              <div className="space-y-0.5">
                <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant">
                  Guests
                </p>
                <p className="font-medium text-sm">2 Adults, 1 Child</p>
              </div>
              <span className="material-symbols-outlined text-primary">group</span>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <input
              className="w-full bg-surface-container-high border-none rounded-full py-4 px-6 text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search for experiences..."
              type="text"
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
}
