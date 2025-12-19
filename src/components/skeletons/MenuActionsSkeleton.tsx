import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function MenuActionsSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col gap-2">
      {/* Navigation Links Area */}
      <div className="flex flex-col gap-1">
        {/* Main menu items*/}
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-md" />
        ))}

        {/* Quick Test Button */}
        <Skeleton className="mt-2 mr-5 ml-5 h-8 rounded-md" />
      </div>

      <Separator className="my-2" />

      {/* Settings Area */}
      <div className="flex flex-col gap-1">
        {/* "Settings" Label */}
        <Skeleton className="mb-2 h-3 w-16 px-2" />
        {/* Theme Toggle */}
        <Skeleton className="h-9 w-full rounded-md" />
      </div>

      {/* Footer / User Area */}
      <div className="mt-auto border-t pt-4">
        <div className="mb-4 flex flex-row items-center justify-between px-2 py-2">
          {/* Username */}
          <Skeleton className="h-5 w-24" />
          {/* Avatar */}
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}
