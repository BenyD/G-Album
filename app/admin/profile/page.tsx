"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, logActivity } from "@/utils/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Shield,
  User,
  Clock,
  Upload,
  Mail,
  Calendar,
  Activity,
  Settings,
  Key,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role?: {
    name: string;
    role_permissions?: {
      permission: {
        name: string;
        description: string;
      };
    }[];
  };
  email: string;
  created_at: string;
  user?: {
    email: string;
  };
};

type ActivityLog = {
  id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
};

const roleBadgeColors = {
  super_admin: "bg-red-600",
  admin: "bg-orange-600",
  editor: "bg-blue-600",
  viewer: "bg-gray-600",
};

const roleIcons = {
  super_admin: Shield,
  admin: Shield,
  editor: User,
  viewer: User,
};

const formatRoleName = (role: string | undefined | null) => {
  if (!role) return "Unknown Role";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        if (!currentSession) {
          router.push("/login");
          return;
        }
        setSession(currentSession);

        const { data: profileData, error: profileError } = await supabase
          .from("admin_profiles")
          .select(
            `
            *,
            role:roles (
              name,
              role_permissions (
                permission:permissions (
                  name,
                  description
                )
              )
            )
          `
          )
          .eq("id", currentSession.user.id)
          .single();

        if (profileError) throw profileError;
        setProfile({
          ...profileData,
          email: currentSession.user.email,
        });

        const { data: logs, error: logsError } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", currentSession.user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (logsError) throw logsError;
        setActivityLogs(logs);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile data",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router, toast, supabase]);

  const handleUpdateProfile = async () => {
    if (!profile || !session) return;

    try {
      const { error } = await supabase
        .from("admin_profiles")
        .update({ full_name: profile.full_name })
        .eq("id", session.user.id);

      if (error) throw error;

      // Log the activity
      await logActivity("profile_updated", {
        user_id: session.user.id,
        field: "full_name",
        new_value: profile.full_name,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !session) return;

    const file = e.target.files[0];

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Image size should be less than 2MB",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload an image file",
      });
      return;
    }

    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;

    try {
      // Delete previous avatar if it exists
      if (profile?.avatar_url) {
        try {
          // Extract the path from the URL
          const url = new URL(profile.avatar_url);
          const pathParts = url.pathname.split("/");
          const bucketIndex = pathParts.indexOf("avatars");
          if (bucketIndex !== -1) {
            const filePath = pathParts.slice(bucketIndex + 1).join("/");
            const { error: deleteError } = await supabase.storage
              .from("avatars")
              .remove([filePath]);

            if (deleteError) {
              console.error("Error deleting previous avatar:", deleteError);
              // Continue with upload even if delete fails
            }
          }
        } catch (error) {
          console.error("Error parsing previous avatar URL:", error);
          // Continue with upload even if delete fails
        }
      }

      // Create a canvas to resize the image
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set maximum dimensions
      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 400;

      // Create a promise to handle image loading and resizing
      const resizeImage = () =>
        new Promise<Blob>((resolve, reject) => {
          img.onload = () => {
            // Calculate new dimensions while maintaining aspect ratio
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }

            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;

            // Draw and resize image
            ctx?.drawImage(img, 0, 0, width, height);

            // Convert to blob
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Failed to resize image"));
              },
              "image/jpeg",
              0.9
            );
          };

          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = URL.createObjectURL(file);
        });

      // Resize the image
      const resizedBlob = await resizeImage();

      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, resizedBlob, {
          cacheControl: "3600",
          upsert: true,
          contentType: "image/jpeg",
        });

      if (uploadError) {
        console.error("Upload error details:", uploadError);
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("admin_profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id);

      if (updateError) {
        console.error("Profile update error details:", updateError);
        throw updateError;
      }

      // Update local state
      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : null));

      // Log the activity
      await logActivity("profile_avatar_updated", {
        user_id: session.user.id,
        avatar_url: publicUrl,
      });

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload avatar",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!profile || !session) {
    return null;
  }

  const RoleIcon =
    roleIcons[(profile.role?.name || "viewer") as keyof typeof roleIcons] ||
    User;

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-2xl font-bold text-red-900">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
        <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatRoleName(profile.role?.name)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your current role in the system
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <Key className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile.role?.role_permissions?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total permissions granted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(profile.created_at).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your account creation date
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityLogs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Actions in the last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 border-2 border-red-100">
                  <AvatarImage src={profile.avatar_url || ""} />
                  <AvatarFallback className="bg-red-50 text-red-600 text-2xl">
                    {profile.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                >
                  <Upload className="w-6 h-6 text-white" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-white",
                    roleBadgeColors[
                      (profile.role?.name ||
                        "viewer") as keyof typeof roleBadgeColors
                    ]
                  )}
                >
                  <RoleIcon className="w-3.5 h-3.5 mr-1" />
                  {formatRoleName(profile.role?.name || "viewer")}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="name"
                    value={profile.full_name}
                    onChange={(e) =>
                      setProfile({ ...profile, full_name: e.target.value })
                    }
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  />
                  <Button
                    onClick={handleUpdateProfile}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Save
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
                  <Mail className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-900">{profile.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
                  <Calendar className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-900">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-red-600" />
              Account Details
            </CardTitle>
            <CardDescription>
              View your account permissions and recent activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="permissions" className="space-y-4">
              <TabsList className="bg-red-50">
                <TabsTrigger
                  value="permissions"
                  className="data-[state=active]:bg-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Permissions
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="data-[state=active]:bg-white"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Recent Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="permissions" className="space-y-4">
                <div className="grid gap-3">
                  {profile.role?.role_permissions?.map(({ permission }) => (
                    <div
                      key={permission.name}
                      className="flex items-center gap-2 p-3 rounded-lg bg-red-50/50"
                    >
                      <Shield className="w-4 h-4 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-900">
                          {permission.name
                            .split("_")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </p>
                        <p className="text-xs text-red-600">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log) => (
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
                              (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(" ")}
                        </p>
                        <p className="text-xs text-red-600">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific sections */}
      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            Permissions & Access
          </CardTitle>
          <CardDescription>
            Your current permissions and access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {profile.role?.role_permissions?.map((rp) => (
                <div
                  key={rp.permission.name}
                  className="flex items-center gap-2 p-3 bg-red-50 rounded-lg"
                >
                  <Key className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-900">
                      {rp.permission.name
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </p>
                    <p className="text-xs text-red-600">
                      {rp.permission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your recent actions in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activityLogs.length > 0 ? (
              <div className="space-y-2">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-red-50 rounded-lg"
                  >
                    <Clock className="w-4 h-4 text-red-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium text-red-900">
                        {log.action
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </p>
                      <p className="text-xs text-red-600">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                      {log.details && (
                        <p className="text-xs text-red-600 mt-1">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-600">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role-specific features */}
      {profile.role?.name === "super_admin" && (
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Super Admin Features
            </CardTitle>
            <CardDescription>
              Additional features available to super administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900">User Management</h4>
                  <p className="text-sm text-red-600">
                    Full access to manage all users and their roles
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900">System Settings</h4>
                  <p className="text-sm text-red-600">
                    Access to all system configuration options
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {profile.role?.name === "admin" && (
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Admin Features
            </CardTitle>
            <CardDescription>
              Additional features available to administrators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900">
                    Content Management
                  </h4>
                  <p className="text-sm text-red-600">
                    Full access to manage all content and media
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900">Analytics</h4>
                  <p className="text-sm text-red-600">
                    Access to all analytics and reporting features
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {profile.role?.name === "editor" && (
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Editor Features
            </CardTitle>
            <CardDescription>
              Additional features available to editors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900">Content Creation</h4>
                  <p className="text-sm text-red-600">
                    Create and edit content and media
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900">Basic Analytics</h4>
                  <p className="text-sm text-red-600">
                    Access to basic analytics and reports
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {profile.role?.name === "viewer" && (
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Viewer Features
            </CardTitle>
            <CardDescription>Features available to viewers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900">Content Viewing</h4>
                  <p className="text-sm text-red-600">
                    View all published content and media
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900">Basic Reports</h4>
                  <p className="text-sm text-red-600">
                    Access to basic reports and statistics
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
