import { Suspense, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const MetricCard = memo(function MetricCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <div className="flex-1">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-24 mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

const ChartCard = memo(function ChartCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
});

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Suspense>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </Suspense>

      {/* Time Range Selector */}
      <Suspense>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-10 w-48 sm:ml-auto" />
            </div>
          </CardContent>
        </Card>
      </Suspense>

      {/* Key Metrics */}
      <Suspense>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCard key={i} />
          ))}
        </div>
      </Suspense>

      {/* Charts Grid */}
      <Suspense>
        <div className="grid gap-6">
          {/* Main Chart */}
          <ChartCard />

          {/* Secondary Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <ChartCard />
            <ChartCard />
          </div>
        </div>
      </Suspense>

      {/* Data Table */}
      <Suspense>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 border-b pb-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
              {/* Table Rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Suspense>
    </div>
  );
}
