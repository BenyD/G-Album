"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Clock } from "lucide-react";
import { useRole } from "@/components/admin/role-context";
import { useRouter } from "next/navigation";

const supabase = createClient();

interface ActivityLog {
  id: string;
  action: string;
  details: Record<string, unknown> | string | null;
  created_at: string;
  user_id: string;
  admin_profiles?: { full_name: string | null };
}

export default function ActivityPage() {
  const router = useRouter();
  const { hasPermission } = useRole();
  const [userId, setUserId] = useState<string | null>(null);
  const [globalLogs, setGlobalLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logUserFilter, setLogUserFilter] = useState<string>("");
  const [logActionFilter, setLogActionFilter] = useState<string>("");
  const [logPage, setLogPage] = useState(1);
  const LOGS_PER_PAGE = 50;
  const [userOptions, setUserOptions] = useState<
    { id: string; full_name: string | null }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      setIsLoading(false);
    };
    getUser();
  }, []);

  // Check if user has permission
  useEffect(() => {
    if (!isLoading && !hasPermission("view_activity_logs")) {
      router.push("/admin/dashboard");
    }
  }, [hasPermission, router, isLoading]);

  // Fetch admin profiles for user name mapping
  useEffect(() => {
    if (hasPermission("view_activity_logs")) {
      supabase
        .from("admin_profiles")
        .select("id, full_name")
        .then(({ data }) => {
          if (data) setUserOptions(data);
        });
    }
  }, [hasPermission]);

  // Fetch logs
  useEffect(() => {
    if (hasPermission("view_activity_logs")) {
      const fetchLogs = async () => {
        try {
          let query = supabase
            .from("activity_logs")
            .select(
              `
              *,
              admin_profiles!admin_profile_id (
                full_name
              )
            `
            )
            .order("created_at", { ascending: false })
            .range((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE - 1);

          if (logUserFilter) {
            query = query.eq("user_id", logUserFilter);
          }
          if (logActionFilter) {
            query = query.ilike("action", `%${logActionFilter}%`);
          }

          const { data, error } = await query;
          if (error) {
            console.error("Error in fetchLogs:", error);
            throw error;
          }

          setGlobalLogs(data || []);
        } catch (error) {
          console.error("Error fetching logs:", error);
          throw error;
        }
      };

      setIsLoadingLogs(true);
      fetchLogs()
        .catch((err) => {
          console.error("Failed to fetch logs:", err);
          toast.error("Failed to fetch activity logs: " + err.message);
        })
        .finally(() => {
          setIsLoadingLogs(false);
        });
    }
  }, [hasPermission, logUserFilter, logActionFilter, logPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  // If user doesn't have permission, don't render anything
  if (!hasPermission("view_activity_logs")) {
    return null;
  }

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-2xl font-bold text-red-900">Activity Logs</h1>
        <p className="text-muted-foreground">
          View all recent actions in the admin panel
        </p>
        <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
      </div>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" />
            Global Activity Log
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            View all recent actions by any user in the admin panel
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={logUserFilter}
              onChange={(e) => {
                setLogUserFilter(e.target.value);
                setLogPage(1);
              }}
            >
              <option value="">All Users</option>
              {userOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name || u.id}
                </option>
              ))}
            </select>
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="Filter by action..."
              value={logActionFilter}
              onChange={(e) => {
                setLogActionFilter(e.target.value);
                setLogPage(1);
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingLogs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-red-600" />
            </div>
          ) : globalLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No activity logs found
            </div>
          ) : (
            <>
              {globalLogs.some(
                (log) => new Date(log.created_at) > new Date()
              ) && (
                <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
                  Warning: Some logs have a future timestamp. Please check your
                  server time settings.
                </div>
              )}
              <div className="max-h-[600px] overflow-y-auto space-y-3">
                {globalLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg"
                  >
                    <Clock className="w-4 h-4 text-red-600 mt-1" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-red-900">
                        {log.action
                          .split("_")
                          .map(
                            (word: string) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </p>
                      <p className="text-xs text-red-600">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        User:{" "}
                        {userOptions.find((u) => u.id === log.user_id)
                          ?.full_name || log.user_id}
                      </p>
                      {log.details && (
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                          {typeof log.details === "string"
                            ? log.details
                            : JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
