"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRole } from "@/components/admin/role-context";
import { useRouter } from "next/navigation";

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

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { hasPermission } = useRole();
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSettings, setEditedSettings] = useState<
    Partial<GeneralSettings>
  >({});
  const [userId, setUserId] = useState<string | null>(null);
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
    if (!isLoading && !hasPermission("manage_general_settings")) {
      router.push("/admin/dashboard");
    }
  }, [hasPermission, router, isLoading]);

  // Fetch settings
  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
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
    enabled: !!userId && hasPermission("manage_general_settings"), // Only run query when we have a user ID and user has permission
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

  if (isLoading || isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  // If user doesn't have permission, don't render anything
  if (!hasPermission("manage_general_settings")) {
    return null;
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
                  ? (editedSettings.last_order_number ?? 0)
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
    </div>
  );
}
