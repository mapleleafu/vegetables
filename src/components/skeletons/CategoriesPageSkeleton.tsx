import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryCardSkeleton() {
  return (
    <Card className="flex h-full flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          {/* Title */}
          <Skeleton className="h-6 w-3/4" />
          {/* Badge */}
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        {/* Description/Subtitle */}
        <Skeleton className="mt-2 h-4 w-24" />
      </CardHeader>
      <CardFooter className="mt-auto flex flex-col gap-2 pt-0">
        {/* Progress Bar */}
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="mt-1 flex w-full items-center justify-between">
          {/* Percentage Text */}
          <Skeleton className="h-3 w-8" />
          {/* Action Icon */}
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function CategoriesPageSkeleton() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl animate-pulse flex-col gap-6 p-4 md:p-8">
      {/* Navigation Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-20" />
      </div>

      <section className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-48" /> {/* H1 Title */}
          <Skeleton className="h-5 w-full max-w-md" /> {/* Description */}
        </div>

        {/* Filters Area */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            {/* Search Input */}
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex gap-2">
            {/* Filter Select */}
            <Skeleton className="h-10 w-[140px]" />
            {/* Sort Select */}
            <Skeleton className="h-10 w-[140px]" />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-center">
          <Skeleton className="h-10 w-80 rounded-md" />
        </div>
      </section>
    </main>
  );
}
