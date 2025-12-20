import { Skeleton } from "@/components/ui/skeleton";
import Shadow from "@/components/ui/shadow";

export function CategoryGameSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl animate-pulse flex-col gap-4 p-4">
      {/* Navigation Breadcrumb Skeleton */}
      <div className="flex h-10 items-center justify-between">
        {/* Breadcrumbs (Left) */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Menu Button (Right) */}
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>

      <div className="flex flex-1 flex-col justify-center">
        {/* Top Decoration / Coins Area */}
        <div className="relative z-10 h-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform">
            <Shadow opacity="25" />
            {/* Coins Skeleton - Matched Shape & Border */}
            <div className="flex h-8 w-24 items-center justify-center gap-3 rounded-2xl rounded-br-none rounded-bl-none border-[2.5px] border-b-0 border-[#5d4037]/30 bg-[#ccb17c] px-4 shadow-sm">
              <Skeleton className="h-4 w-4 rounded-full bg-black/10" />
              <Skeleton className="h-4 w-6 rounded-md bg-black/10" />
            </div>
          </div>
        </div>

        {/* Main Game Card Skeleton */}
        <div className="border-paleBrown/50 relative rounded-2xl border-[2.5px] bg-[#ccb17c]/30 p-4 shadow-[0_0px_55px_25px_#00000020]">
          <Shadow opacity="20" />

          {/* Progress Bar Skeleton (Right Side) */}
          <div className="border-paleBrown/50 bg-darkBrown/10 absolute top-0 -right-3 flex h-full w-3 flex-col-reverse overflow-hidden rounded-full border-2 md:-right-6">
            <Skeleton className="h-1/4 w-full bg-black/10" />
          </div>

          {/* Title / Header Area - Widened */}
          <div className="relative mb-4 flex justify-center">
            <div className="border-gabs/30 relative flex w-full max-w-sm justify-center rounded-lg bg-transparent p-4">
              <Skeleton className="h-8 w-full rounded bg-black/10" />
            </div>
          </div>

          {/* Grid of Words */}
          <div className="mb-4 grid grid-cols-4 gap-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="relative aspect-square opacity-70">
                <Skeleton className="h-full w-full rounded-lg bg-black/10" />
              </div>
            ))}
          </div>

          {/* Question Text Skeleton */}
          <div className="mt-4 flex flex-col items-center gap-2 pb-6">
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
