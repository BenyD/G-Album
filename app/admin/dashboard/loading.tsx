import { Suspense, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

// Memoize repeatable skeleton components
const MetricCard = memo(function MetricCard() {
  return (
    <Card className="p-4">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    </Card>
  );
});

const UsageCard = memo(function UsageCard() {
  return (
    <Card className="p-4">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </Card>
  );
});

export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      {/* Alert Skeleton */}
      <Suspense>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-4 w-full mt-2" />
        </Card>
      </Suspense>

      {/* Metrics Grid */}
      <Suspense>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCard key={i} />
          ))}
        </div>
      </Suspense>

      {/* Usage Stats */}
      <Suspense>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <UsageCard key={i} />
          ))}
        </div>
      </Suspense>

      {/* Charts Skeleton */}
      <Suspense>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-4">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-[200px] w-full" />
          </Card>
          <Card className="p-4">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-[200px] w-full" />
          </Card>
        </div>
      </Suspense>
    </div>
  );
}
