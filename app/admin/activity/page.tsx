"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Clock, Download } from "lucide-react";
import { useRole } from "@/components/admin/role-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays, format } from "date-fns";

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
  const [globalLogs, setGlobalLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logUserFilter, setLogUserFilter] = useState<string>("");
  const [logActionFilter, setLogActionFilter] = useState<string>("");
  const [logPage, setLogPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalLogs, setTotalLogs] = useState(0);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const LOGS_PER_PAGE = 20;
  const [userOptions, setUserOptions] = useState<
    { id: string; full_name: string | null }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionTypes, setActionTypes] = useState<string[]>([]);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      await supabase.auth.getUser();
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

  // Fetch unique action types
  useEffect(() => {
    if (hasPermission("view_activity_logs")) {
      supabase
        .from("activity_logs")
        .select("action")
        .then(({ data }) => {
          if (data) {
            const uniqueActions = [...new Set(data.map((log) => log.action))];
            setActionTypes(uniqueActions);
          }
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
            `,
              { count: "exact" }
            )
            .order("created_at", { ascending: false })
            .range((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE - 1);

          if (logUserFilter && logUserFilter !== "all") {
            query = query.eq("user_id", logUserFilter);
          }
          if (logActionFilter && logActionFilter !== "all") {
            query = query.eq("action", logActionFilter);
          }
          if (dateRange.from) {
            query = query.gte("created_at", dateRange.from.toISOString());
          }
          if (dateRange.to) {
            query = query.lte("created_at", dateRange.to.toISOString());
          }

          if (searchTerm) {
            query = query.or(
              `details.ilike.%${searchTerm}%,action.ilike.%${searchTerm}%`
            );
          }

          const { data, error, count } = await query;
          if (error) {
            console.error("Error in fetchLogs:", error);
            throw error;
          }

          setGlobalLogs(data || []);
          setTotalLogs(count || 0);
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
  }, [
    hasPermission,
    logUserFilter,
    logActionFilter,
    logPage,
    dateRange,
    searchTerm,
  ]);

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_logs")
        .select(
          `
          *,
          admin_profiles!admin_profile_id (
            full_name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const csvContent = [
        ["Timestamp", "Action", "User", "Details"],
        ...data.map((log) => [
          new Date(log.created_at).toLocaleString(),
          log.action,
          userOptions.find((u) => u.id === log.user_id)?.full_name ||
            log.user_id,
          typeof log.details === "string"
            ? log.details
            : JSON.stringify(log.details),
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting logs:", error);
      toast.error("Failed to export logs");
    }
  };

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

  const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE);

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-red-900">Activity Logs</h1>
            <p className="text-muted-foreground">
              View all recent actions in the admin panel
            </p>
          </div>
          <Button
            onClick={handleExport}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
      </div>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-600" />
            Global Activity Log
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">User</label>
              <Select
                value={logUserFilter}
                onValueChange={(value) => {
                  setLogUserFilter(value);
                  setLogPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {userOptions.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name || u.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Action
              </label>
              <Select
                value={logActionFilter}
                onValueChange={(value) => {
                  setLogActionFilter(value);
                  setLogPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionTypes.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Date Range
              </label>
              <DateRangePicker
                value={dateRange}
                onChange={(range) => {
                  if (range) {
                    setDateRange({
                      from: range.from || new Date(),
                      to: range.to || new Date(),
                    });
                    setLogPage(1);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Search
              </label>
              <Input
                placeholder="Search in details..."
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setLogPage(1);
                }}
              />
            </div>
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
              <div className="space-y-3">
                {globalLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-red-50/50 rounded-lg hover:bg-red-50 transition-colors"
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
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all bg-white/50 p-2 rounded mt-1">
                          {typeof log.details === "string"
                            ? log.details
                            : JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                    disabled={logPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {logPage} of {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setLogPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={logPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
