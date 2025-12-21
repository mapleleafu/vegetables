"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NumberPracticeSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl animate-pulse flex-col gap-4 p-4">
      {/* Navigation Breadcrumb Skeleton */}
      <div className="flex h-10 items-center justify-between">
        {/* Breadcrumbs (Left) */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-30" />
        </div>

        {/* Menu Button (Right) */}
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
      <div className="flex w-full flex-1 flex-col justify-center">
        <Card className="border-border/60 bg-card/50 border-2 border-dashed p-8 shadow-xl backdrop-blur-sm">
          <div className="space-y-8">
            {/* Tabs Skeleton */}
            <div className="space-y-4">
              <div className="w-full">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Content Area */}
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            </div>

            {/* Start Session Button */}
            <Skeleton className="h-14 w-full rounded-md" />
          </div>
        </Card>
      </div>
    </main>
  );
}
