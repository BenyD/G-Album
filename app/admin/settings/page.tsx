"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Clock } from "lucide-react";
import { useRole } from "@/components/admin/role-context";

const supabase = createClient();

interface GeneralSettings {
  id: string;
  order_number_prefix: string;
  last_order_number: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface ActivityLog {
  id: string;
  action: string;
  details: Record<string, unknown> | string | null;
  created_at: string;
  user_id: string;
  admin_profiles?: { full_name: string | null };
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSettings, setEditedSettings] = useState<
    Partial<GeneralSettings>
  >({});
  const [userId, setUserId] = useState<string | null>(null);
  const { role } = useRole();
  const [globalLogs, setGlobalLogs] = useState<ActivityLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logUserFilter, setLogUserFilter] = useState<string>("");
  const [logActionFilter, setLogActionFilter] = useState<string>("");
  const [logPage, setLogPage] = useState(1);
  const LOGS_PER_PAGE = 50;
  const [userOptions, setUserOptions] = useState<
    { id: string; full_name: string | null }[]
  >([]);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Fetch settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["general-settings"],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("general_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No settings found, create initial settings
          const { data: newSettings, error: createError } = await supabase
            .from("general_settings")
            .insert({
              order_number_prefix: "GA-",
              last_order_number: 2854,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_by: userId,
              updated_by: userId,
            })
            .select()
            .single();

          if (createError) {
            console.error("Error creating initial settings:", createError);
            throw createError;
          }
          return newSettings as GeneralSettings;
        }
        console.error("Error fetching settings:", error);
        throw error;
      }

      return data as GeneralSettings;
    },
    enabled: !!userId, // Only run query when we have a user ID
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<GeneralSettings>) => {
      if (!settings?.id) throw new Error("No settings to update");
      if (!userId) throw new Error("User not authenticated");

      console.log("Updating settings in DB:", {
        id: settings.id,
        settings: updatedSettings,
      });

      const { data, error } = await supabase
        .from("general_settings")
        .update({
          order_number_prefix: updatedSettings.order_number_prefix,
          last_order_number: updatedSettings.last_order_number,
          updated_at: new Date().toISOString(),
          updated_by: userId,
        })
        .eq("id", settings.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating settings:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No data returned after update");
      }

      console.log("Settings updated successfully:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Mutation success, updating UI with:", data);
      queryClient.invalidateQueries({ queryKey: ["general-settings"] });
      setSettings(data);
      setIsEditing(false);
      setEditedSettings({});
      toast.success("Settings updated successfully");
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast.error("Failed to update settings: " + error.message);
    },
  });

  // Update local state when settings data changes
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
      if (!isEditing) {
        setEditedSettings({});
      }
    }
  }, [settingsData, isEditing, setSettings, setEditedSettings]);

  const handleEdit = () => {
    if (!settings) return;
    setIsEditing(true);
    setEditedSettings({
      order_number_prefix: settings.order_number_prefix,
      last_order_number: settings.last_order_number,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedSettings({});
  };

  const handleSave = () => {
    if (!settings?.id) {
      toast.error("No settings found to update");
      return;
    }

    if (!editedSettings.order_number_prefix?.trim()) {
      toast.error("Order number prefix cannot be empty");
      return;
    }

    if (
      editedSettings.last_order_number === undefined ||
      editedSettings.last_order_number < 0
    ) {
      toast.error("Last order number must be a positive number");
      return;
    }

    console.log("Saving settings:", {
      id: settings.id,
      prefix: editedSettings.order_number_prefix,
      lastNumber: editedSettings.last_order_number,
    });

    updateSettingsMutation.mutate({
      order_number_prefix: editedSettings.order_number_prefix,
      last_order_number: editedSettings.last_order_number,
    });
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedSettings((prev) => ({
      ...prev,
      order_number_prefix: e.target.value,
    }));
  };

  const handleLastNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10) || 0;
    setEditedSettings((prev) => ({
      ...prev,
      last_order_number: value,
    }));
  };

  useEffect(() => {
    if (role === "super_admin") {
      supabase
        .from("admin_profiles")
        .select("id, full_name")
        .order("full_name", { ascending: true })
        .then(({ data }) => {
          if (data) setUserOptions(data);
        });
    }
  }, [role]);

  useEffect(() => {
    if (role === "super_admin") {
      setIsLoadingLogs(true);
      let query = supabase
        .from("activity_logs")
        .select("*, admin_profiles: user_id (full_name)")
        .order("created_at", { ascending: false })
        .range(0, logPage * LOGS_PER_PAGE - 1);
      if (logUserFilter) query = query.eq("user_id", logUserFilter);
      if (logActionFilter)
        query = query.ilike("action", `%${logActionFilter}%`);
      query.then(({ data, error }) => {
        if (!error && data) setGlobalLogs(data);
        setIsLoadingLogs(false);
      });
    }
  }, [role, logUserFilter, logActionFilter, logPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-2xl font-bold text-red-900">Settings</h1>
        <p className="text-muted-foreground">Manage application settings</p>
        <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
      </div>

      {/* Order Number Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Order Number Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prefix" className="text-red-900">
                Order Number Prefix
              </Label>
              <Input
                id="prefix"
                value={
                  isEditing
                    ? editedSettings.order_number_prefix
                    : settings?.order_number_prefix || ""
                }
                onChange={handlePrefixChange}
                disabled={!isEditing}
                className="border-red-100 focus:border-red-200 focus:ring-red-100"
              />
              <p className="text-sm text-muted-foreground">
                This prefix will be added to all order numbers (e.g., GA-)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastNumber" className="text-red-900">
                Last Order Number
              </Label>
              <Input
                id="lastNumber"
                type="number"
                min="0"
                step="1"
                value={
                  isEditing
                    ? editedSettings.last_order_number
                    : settings?.last_order_number || 0
                }
                onChange={handleLastNumberChange}
                disabled={!isEditing}
                className="border-red-100 focus:border-red-200 focus:ring-red-100"
              />
              <p className="text-sm text-muted-foreground">
                Next order will be:{" "}
                {isEditing
                  ? editedSettings.order_number_prefix
                  : settings?.order_number_prefix}
                {(isEditing
                  ? editedSettings.last_order_number ?? 0
                  : settings?.last_order_number || 0) + 1}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {!isEditing ? (
              <Button
                onClick={handleEdit}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Edit Settings
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-red-100 hover:bg-red-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {updateSettingsMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {role === "super_admin" && (
        <Card className="mt-8 border-red-200">
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
                        User: {log.admin_profiles?.full_name || log.user_id}
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
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setLogPage((p) => p + 1)}
                    disabled={isLoadingLogs}
                  >
                    Load More
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
