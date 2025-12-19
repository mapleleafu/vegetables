import { Skeleton } from "@/components/ui/skeleton";

export const BackgroundGridSkeleton = () => {
  return (
    <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl border-4 border-transparent"
        >
          {/* Image area skeleton */}
          <div className="bg-secondary/20 aspect-square w-full">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
          {/* Text area skeleton */}
          <div className="bg-secondary/50 flex justify-center px-2 py-2">
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
