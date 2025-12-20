import { Skeleton } from "@/components/ui/skeleton";
import Screws from "@/components/ui/screws";
import Shadow from "@/components/ui/shadow";

export function CategoryGameSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl animate-pulse flex-col gap-4 p-4">
      {/* Navigation Breadcrumb Skeleton */}
      <div className="mb-2 flex h-10 items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        {/* Top Decoration / Coins Area */}
        <div className="relative z-10 h-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform">
            <Shadow opacity="25" />
            <Screws variant="sides" size="sm" />
            <Skeleton className="border-border/50 bg-background/50 h-10 w-24 rounded-full border-2" />
          </div>
        </div>

        {/* Main Game Card Skeleton */}
        {/* We use similar classes to CategoryGame to match dimensions and border styles */}
        <div className="border-paleBrown/50 relative rounded-2xl border-[2.5px] bg-[#ccb17c]/30 p-4 shadow-[0_0px_55px_25px_#00000020]">
          <Shadow opacity="20" />
          <Screws />

          {/* Progress Bar Skeleton (Right Side) */}
          <div className="border-paleBrown/50 bg-darkBrown/10 absolute top-0 -right-3 flex h-full w-3 flex-col-reverse overflow-hidden rounded-full border-2 md:-right-6">
            <Skeleton className="h-1/4 w-full bg-black/10" />
          </div>

          {/* Title / Header Area */}
          <div className="relative mb-4 flex justify-center">
            <div className="border-gabs/30 relative flex w-full max-w-[200px] justify-center rounded-lg border bg-transparent p-4">
              <Screws size="sm" />
              <Skeleton className="h-8 w-32 rounded bg-black/10" />
            </div>
          </div>

          {/* Grid of Words */}
          {/* Mimicking grid-gabs with standard grid classes */}
          <div className="mb-4 grid grid-cols-2 gap-4 p-2 md:grid-cols-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="relative aspect-square opacity-70">
                <Skeleton className="h-full w-full rounded-lg bg-black/10" />
              </div>
            ))}
          </div>

          {/* Question Text Skeleton */}
          <div className="mt-4 flex flex-col items-center gap-2 pb-6">
            <Skeleton className="h-8 w-3/4 rounded bg-black/10" />
            <Skeleton className="hidden h-8 w-1/2 rounded bg-black/10 md:block" />
          </div>

          {/* Action Button Skeleton */}
          <div className="flex justify-center pb-2">
            <Skeleton className="h-16 w-full max-w-sm rounded-md bg-black/10" />
          </div>
        </div>
      </div>
    </main>
  );
}
