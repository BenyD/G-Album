import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-b from-red-50/30 to-white py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-12 w-48 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
      </div>

      {/* Controls Section Skeleton */}
      <div className="bg-white border-b border-red-100 py-6">
        <div className="container mx-auto px-4">
          {/* Search and View Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <Skeleton className="h-10 w-full max-w-xl" />
            <Skeleton className="h-10 w-48" />
          </div>

          {/* Filter Section Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-32" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid Skeleton */}
      <div className="py-12 bg-gradient-to-b from-white to-red-50/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="relative aspect-[3/4] rounded-lg overflow-hidden"
              >
                <Skeleton className="absolute inset-0" />
                {/* Mobile title skeleton */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:hidden">
                  <Skeleton className="h-6 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
