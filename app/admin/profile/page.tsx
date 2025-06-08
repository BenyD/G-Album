"use client";

import { useAuth } from "@/components/admin/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Mail, Save, Upload, Shield, Clock, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { updateProfile, uploadProfilePicture } from "./actions";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, profile, role, permissions } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [userName, setUserName] = useState(profile?.full_name || "");
  const [isLoading, setIsLoading] = useState(false);

  // Format role name for display
  const formatRoleName = (roleName: string | undefined) => {
    if (!roleName) return "";
    return roleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Get role badge color
  const getRoleBadgeColor = (roleName: string | undefined) => {
    if (!roleName) return "bg-slate-100 text-slate-800";
    switch (roleName.toLowerCase()) {
      case "super_admin":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "accounts":
        return "bg-green-100 text-green-800";
      case "employee":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const handleNameSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await updateProfile(user.id, { full_name: userName });
      setIsEditingName(false);
      toast.success("Name updated successfully");
    } catch (error) {
      toast.error("Failed to update name");
      console.error("Error updating name:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user || !e.target.files?.length) return;

    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setIsLoading(true);
    try {
      await uploadProfilePicture(user.id, file);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      toast.error("Failed to upload profile picture");
      console.error("Error uploading profile picture:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!profile?.full_name) return "U";
    return profile.full_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Format permission name
  const formatPermissionName = (permissionName: string) => {
    return permissionName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Get formatted permissions list
  const getFormattedPermissions = () => {
    if (!profile?.role?.role_permissions) return [];

    return profile.role.role_permissions.map((rp) => ({
      id: rp.permission.id,
      name: formatPermissionName(rp.permission.name),
      description: rp.permission.description,
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
      </div>

      <div className="space-y-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your personal information and role
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={profile?.avatar_url || ""}
                  alt={profile?.full_name || "User"}
                />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="avatar-upload"
                  onChange={handleProfilePictureUpload}
                  disabled={isLoading}
                />
                <label htmlFor="avatar-upload">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 rounded-full p-0"
                    disabled={isLoading}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4" />
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="w-full max-w-sm mb-4">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-center"
                    disabled={isLoading}
                    placeholder="Enter your name"
                  />
                  <Button
                    size="sm"
                    onClick={handleNameSave}
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-xl font-semibold">
                    {profile?.full_name || "Set your name"}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingName(true)}
                    className="h-6 w-6 p-0"
                    disabled={isLoading}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <span className="text-slate-600">{user?.email}</span>
              </div>
              <Badge className={getRoleBadgeColor(profile?.role?.name)}>
                {formatRoleName(profile?.role?.name)}
              </Badge>
              <div className="text-sm text-slate-500 flex gap-4">
                <p>
                  Joined:{" "}
                  {new Date(user?.created_at || "").toLocaleDateString()}
                </p>
                <p>
                  Updated:{" "}
                  {profile?.updated_at
                    ? new Date(profile.updated_at).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              View your permissions and activity history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="permissions" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="permissions"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Permissions
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Activity History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="permissions" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-slate-600" />
                    <h4 className="font-medium text-slate-700">
                      Your Permissions
                    </h4>
                  </div>

                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {profile?.role?.role_permissions?.map((rp: any) => (
                        <div
                          key={rp.permission.id}
                          className="flex items-center gap-2 text-sm text-slate-600"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                          <span
                            className="truncate"
                            title={rp.permission.description}
                          >
                            {rp.permission.name
                              ? formatPermissionName(rp.permission.name)
                              : "Unknown Permission"}
                          </span>
                        </div>
                      ))}
                      {(!profile?.role?.role_permissions ||
                        profile.role.role_permissions.length === 0) && (
                        <div className="col-span-2 text-sm text-slate-500 text-center py-2">
                          No permissions assigned
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-slate-600" />
                    <h4 className="font-medium text-slate-700">
                      Recent Activity
                    </h4>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {/* Profile Update Activity */}
                    {profile?.updated_at && (
                      <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                        <div className="shrink-0 mt-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            Profile Updated
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(profile.updated_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Account Creation Activity */}
                    <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="shrink-0 mt-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          Account Created
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(user?.created_at || "").toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
