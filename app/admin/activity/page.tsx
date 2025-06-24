"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Download,
  User,
  ShoppingBag,
  Image,
  Building2,
  Settings,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit,
  Plus,
  Eye,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const supabase = createClient();

interface ActivityLog {
  id: string;
  action: string;
  details: Record<string, unknown> | string | null;
  created_at: string;
  user_id: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_name: string | null;
  user_name: string | null;
  user_email: string | null;
}

interface AdminProfile {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface Permission {
  name: string;
}

interface RolePermission {
  permission: Permission;
}

interface Role {
  name: string;
  role_permissions: RolePermission[];
}

interface Profile {
  id: string;
  role: Role;
}

const ENTITY_ICONS: Record<string, React.ElementType> = {
  customer: Building2,
  order: ShoppingBag,
  album: Image,
  settings: Settings,
  user: User,
  default: FileText,
};

const ACTION_ICONS: Record<string, React.ElementType> = {
  created: Plus,
  updated: Edit,
  deleted: Trash2,
  viewed: Eye,
  payment_received: CreditCard,
  balance_added: IndianRupee,
  balance_updated: IndianRupee,
  flagged: AlertTriangle,
  resolved: CheckCircle2,
  default: FileText,
};

const ACTION_COLORS: Record<string, string> = {
  created: "bg-green-50 text-green-700 border-green-200",
  updated: "bg-blue-50 text-blue-700 border-blue-200",
  deleted: "bg-red-50 text-red-700 border-red-200",
  viewed: "bg-gray-50 text-gray-700 border-gray-200",
  payment_received: "bg-emerald-50 text-emerald-700 border-emerald-200",
  balance_added: "bg-purple-50 text-purple-700 border-purple-200",
  balance_updated: "bg-purple-50 text-purple-700 border-purple-200",
  flagged: "bg-yellow-50 text-yellow-700 border-yellow-200",
  resolved: "bg-teal-50 text-teal-700 border-teal-200",
  default: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function ActivityPage() {
  const router = useRouter();
  const { hasPermission } = useRole();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [userFilter, setUserFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
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
    { id: string; full_name: string | null; email: string | null }[]
  >([]);
  // Define all possible entity types
  const ENTITY_TYPES = [
    { value: "customer", label: "Customer" },
    { value: "order", label: "Order" },
    { value: "album", label: "Album" },
    { value: "user", label: "User" },
    { value: "newsletter", label: "Newsletter" },
    { value: "settings", label: "Settings" },
    { value: "contact", label: "Contact" },
  ];
  const [actionTypes, setActionTypes] = useState<string[]>([]);

  // Get current user and check permissions
  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admin/dashboard");
        return;
      }

      // Check if user has permission
      const { data: profile } = (await supabase
        .from("admin_profiles")
        .select(
          `
          id,
          role:roles (
            name,
            role_permissions (
              permission:permissions (
                name
              )
            )
          )
        `
        )
        .eq("id", user.id)
        .single()) as { data: Profile | null };

      const hasActivityLogPermission =
        profile?.role?.role_permissions?.some(
          (rp: RolePermission) => rp.permission.name === "view_activity_logs"
        ) || profile?.role?.name === "super_admin";

      if (!hasActivityLogPermission) {
        router.push("/admin/dashboard");
        return;
      }

      // Fetch admin profiles with their activity counts
      const { data: admins } = (await supabase
        .from("admin_profiles")
        .select("id, full_name")) as { data: AdminProfile[] | null };
      if (admins) {
        const adminOptions = admins.map((admin) => ({
          id: admin.id,
          full_name: admin.full_name,
          email: null,
        }));
        setUserOptions(adminOptions);
      }

      // Fetch unique action types
      const { data: logs } = await supabase
        .from("activity_logs_view")
        .select("action");

      if (logs) {
        const uniqueActionTypes = [...new Set(logs.map((log) => log.action))];
        setActionTypes(uniqueActionTypes);
      }
    };

    init();
  }, [router]);

  // Fetch logs
  useEffect(() => {
    if (!hasPermission("view_activity_logs")) return;

    const fetchLogs = async () => {
      try {
        let query = supabase
          .from("activity_logs_view")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range((page - 1) * LOGS_PER_PAGE, page * LOGS_PER_PAGE - 1);

        if (userFilter && userFilter !== "all") {
          query = query.eq("user_id", userFilter);
        }
        if (entityFilter && entityFilter !== "all") {
          query = query.eq("entity_type", entityFilter);
        }
        if (actionFilter && actionFilter !== "all") {
          query = query.eq("action", actionFilter);
        }
        if (dateRange.from) {
          query = query.gte("created_at", dateRange.from.toISOString());
        }
        if (dateRange.to) {
          query = query.lte("created_at", dateRange.to.toISOString());
        }
        if (searchTerm) {
          query = query.or(
            `details.ilike.%${searchTerm}%,action.ilike.%${searchTerm}%,entity_name.ilike.%${searchTerm}%`
          );
        }

        const { data, error, count } = await query;
        if (error) throw error;

        setLogs(data || []);
        setTotalLogs(count || 0);
      } catch (error) {
        console.error("Error fetching logs:", error);
        toast.error("Failed to fetch activity logs");
      }
    };

    setIsLoadingLogs(true);
    fetchLogs().finally(() => setIsLoadingLogs(false));
  }, [
    hasPermission,
    userFilter,
    entityFilter,
    actionFilter,
    page,
    dateRange,
    searchTerm,
  ]);

  const handleExport = async () => {
    try {
      const { data, error } = await supabase
        .from("activity_logs_view")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const csvContent = [
        [
          "Timestamp",
          "Action",
          "User",
          "Entity Type",
          "Entity Name",
          "Details",
          "Amount",
          "Payment Method",
        ],
        ...data.map((log) => [
          new Date(log.created_at).toLocaleString(),
          log.action,
          log.user_name || log.user_email || log.user_id,
          log.entity_type || "-",
          log.entity_name || "-",
          typeof log.details === "string"
            ? log.details
            : JSON.stringify(log.details),
          log.details?.amount || "-",
          log.details?.payment_method || "-",
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity_logs_${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting logs:", error);
      toast.error("Failed to export activity logs");
    }
  };

  const getActionColor = (action: string) => {
    const type = action.split("_").pop() || "";
    return ACTION_COLORS[type] || ACTION_COLORS.default;
  };

  const getEntityIcon = (entityType: string | null) => {
    if (!entityType) return ENTITY_ICONS.default;
    return ENTITY_ICONS[entityType] || ENTITY_ICONS.default;
  };

  const getActionIcon = (action: string) => {
    const type = action.split("_").pop() || "";
    return ACTION_ICONS[type] || ACTION_ICONS.default;
  };

  const formatAmount = (amount: number | undefined) => {
    if (!amount) return null;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Activity Logs</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isLoadingLogs}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {userOptions.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {ENTITY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by action" />
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
              <DateRangePicker
                value={dateRange}
                onChange={(range) => {
                  if (range) {
                    setDateRange({
                      from: range.from || dateRange.from,
                      to: range.to || dateRange.to,
                    });
                  }
                }}
              />
            </div>

            <Separator />

            {/* Logs List */}
            {isLoadingLogs ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity logs found
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => {
                  const EntityIcon = getEntityIcon(log.entity_type);
                  const ActionIcon = getActionIcon(log.action);
                  const details =
                    typeof log.details === "string"
                      ? { message: log.details }
                      : (log.details as Record<string, unknown>);
                  const amount = details?.amount as number | undefined;
                  const paymentMethod = details?.payment_method as
                    | string
                    | undefined;

                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                    >
                      <div className="mt-1">
                        <EntityIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    variant="outline"
                                    className={getActionColor(log.action)}
                                  >
                                    <ActionIcon className="h-3 w-3 mr-1" />
                                    {log.action
                                      .split("_")
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1)
                                      )
                                      .join(" ")}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {format(
                                    new Date(log.created_at),
                                    "dd MMM yyyy hh:mm a"
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            {log.entity_type && (
                              <Badge variant="outline" className="capitalize">
                                {log.entity_type}
                              </Badge>
                            )}
                            {amount && (
                              <Badge variant="outline" className="bg-green-50">
                                {formatAmount(amount)}
                              </Badge>
                            )}
                            {paymentMethod && (
                              <Badge variant="outline" className="bg-blue-50">
                                {paymentMethod}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {log.user_name || log.user_email || log.user_id}
                          </span>
                        </div>
                        {log.entity_name && (
                          <div className="text-sm text-muted-foreground">
                            {log.entity_type?.charAt(0).toUpperCase()}
                            {log.entity_type?.slice(1)}: {log.entity_name}
                          </div>
                        )}
                        {details && (
                          <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {String(
                              details.message ||
                                details.notes ||
                                JSON.stringify(
                                  Object.fromEntries(
                                    Object.entries(details).filter(
                                      ([key]) =>
                                        !["amount", "payment_method"].includes(
                                          key
                                        )
                                    )
                                  ),
                                  null,
                                  2
                                )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min((page - 1) * LOGS_PER_PAGE + 1, totalLogs)} to{" "}
                {Math.min(page * LOGS_PER_PAGE, totalLogs)} of {totalLogs} logs
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page * LOGS_PER_PAGE >= totalLogs}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
