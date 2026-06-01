export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function SkeletonStayCard({ className = "flex-none w-72" }: { className?: string }) {
  return (
    <div className={`${className} space-y-3`}>
      <Skeleton className="aspect-[4/3.75] w-full rounded-3xl" />
      <div className="space-y-2 px-1">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
        <Skeleton className="h-5 w-1/3 rounded-md mt-2" />
      </div>
    </div>
  );
}
