export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-container-high rounded-md ${className}`}
    />
  );
}

export function SkeletonStayCard() {
  return (
    <div className="flex-none w-72 space-y-3">
      <Skeleton className="aspect-[4/3.75] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-5 w-1/3 mt-2" />
      </div>
    </div>
  );
}
