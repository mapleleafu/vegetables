import { Skeleton } from "@/components/ui/skeleton";

interface BackgroundGridSkeletonProps {
  count?: number;
  wrap?: boolean;
}

export const BackgroundGridSkeleton = ({
  count = 10,
  wrap = true,
}: BackgroundGridSkeletonProps) => {
  const items = Array.from({ length: count }).map((_, i) => (
    <div
      key={`skeleton-${i}`}
      className="relative overflow-hidden rounded-xl border-4 border-transparent"
    >
      {/* Image area */}
      <div className="bg-secondary/20 aspect-square w-full">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Text area */}
      <div className="bg-secondary/50 flex justify-center px-2 py-2">
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>
    </div>
  ));

  if (!wrap) {
    return <>{items}</>;
  }

  return (
    <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
      {items}
    </div>
  );
};
