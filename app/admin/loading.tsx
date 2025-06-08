import { Suspense, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

// Memoize repeatable skeleton components for better performance
const SidebarItem = memo(function SidebarItem() {
  return <Skeleton className="h-10 w-full" />;
});

const StatCard = memo(function StatCard() {
  return (
    <Card className="p-4">
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-8 w-24" />
    </Card>
  );
});

export default function AdminLoading() {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex">
      {/* Sidebar Skeleton */}
      <Suspense>
        <div className="hidden md:flex w-64 border-r border-slate-200 flex-col">
          <div className="h-16 border-b border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SidebarItem key={i} />
            ))}
          </div>
        </div>
      </Suspense>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Skeleton */}
        <Suspense>
          <div className="h-16 border-b border-slate-200 bg-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 md:hidden" />
              <div className="hidden md:flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
          </div>
        </Suspense>

        {/* Content Skeleton */}
        <Suspense>
          <main className="flex-1 p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatCard key={i} />
              ))}
            </div>

            <Card className="p-4">
              <Skeleton className="h-64 w-full" />
            </Card>
          </main>
        </Suspense>
      </div>
    </div>
  );
}
