import { Suspense, memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const SettingCard = memo(function SettingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

const ToggleCard = memo(function ToggleCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-11" />
        </div>
      </CardContent>
    </Card>
  );
});

export default function SettingsLoading() {
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
          </div>
        </div>
      </Suspense>

      <div className="grid gap-6">
        {/* General Settings */}
        <Suspense>
          <SettingCard />
        </Suspense>

        {/* Email Settings */}
        <Suspense>
          <SettingCard />
        </Suspense>

        {/* Notification Settings */}
        <Suspense>
          <div className="space-y-4">
            <div>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64 mt-1" />
            </div>
            <div className="grid gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ToggleCard key={i} />
              ))}
            </div>
          </div>
        </Suspense>

        {/* API Settings */}
        <Suspense>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <div className="grid gap-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Suspense>
      </div>
    </div>
  );
}
