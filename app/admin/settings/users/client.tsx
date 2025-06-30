"use client";

import { useState, useEffect } from "react";
import { useRole } from "@/components/admin/role-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  Ban,
  Users,
  UserCheck,
  UserX,
  Pencil,
  Check,
  Save,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { type UserWithProfile, getUsers, getRoles } from "./actions";
import { toast } from "sonner";
import { createClient, logActivity } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { format } from "date-fns";
import { Label } from "@/components/ui/label";

interface Role {
  id: string;
  name: string;
  description: string;
}

export function UserManagementClient() {
  const { hasPermission } = useRole();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [refreshing, setRefreshing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [editedUser, setEditedUser] = useState<UserWithProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [approvingUser, setApprovingUser] = useState<UserWithProfile | null>(
    null
  );
  const [newUserName, setNewUserName] = useState("");
  const supabase = createClient();

  // Check if user can view the page
  const canViewUsers = hasPermission("view_users");
  // Check if user can manage users (super_admin only)
  const canManageUsers = hasPermission("manage_users");

  // Add a new function to handle user refresh
  const refreshUsers = async () => {
    setRefreshing(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        getUsers(),
        getRoles(),
      ]);
      setUsers(usersData || []);
      setRoles(rolesData || []);
      toast.success("Users refreshed successfully");
    } catch (error) {
      console.error("Error refreshing users:", error);
      toast.error("Failed to refresh users. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    refreshUsers();
  }, []);

  // Handle status update
  const handleStatusUpdate = async (
    userId: string,
    status: "pending" | "approved" | "suspended"
  ) => {
    try {
      const { error } = await supabase
        .from("admin_profiles")
        .update({
          status,
          ...(status === "approved"
            ? { approved_at: new Date().toISOString() }
            : {}),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error updating status:", error);
        throw error;
      }

      // Get current admin user
      const {
        data: { user: admin },
        error: adminError,
      } = await supabase.auth.getUser();
      if (adminError || !admin) throw new Error("Could not get current user");

      // Log the activity
      await logActivity("user_status_updated", {
        user_id: userId,
        status,
        updated_by: admin.id,
      });

      // Refresh the users list
      await refreshUsers();
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Get role badge color
  const getRoleBadgeColor = (roleName: string) => {
    const colors: Record<string, string> = {
      super_admin: "bg-red-100 text-red-800 border-red-200",
      admin: "bg-orange-100 text-orange-800 border-orange-200",
      editor: "bg-blue-100 text-blue-800 border-blue-200",
      visitor: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[roleName] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Format role name for display
  const formatRoleName = (roleName: string) => {
    if (!roleName) return "";
    return roleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Filter users based on search term, role, and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchTerm
      ? (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (user.profile?.full_name?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        )
      : true;

    const matchesRole =
      roleFilter === "all" ||
      user.profile?.role?.name?.toLowerCase() === roleFilter;

    const matchesStatus =
      statusFilter === "all" ||
      user.profile?.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "oldest":
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case "name":
        return (a.profile?.full_name || "").localeCompare(
          b.profile?.full_name || ""
        );
      default:
        return 0;
    }
  });

  // Get pending users
  const pendingUsers = users.filter(
    (user) => user.profile?.status === "pending"
  );

  // Update handleApproveUser to include name
  const handleApproveUser = async (userId: string, roleId: string) => {
    try {
      // Get current admin user
      const {
        data: { user: admin },
        error: adminError,
      } = await supabase.auth.getUser();
      if (adminError || !admin) throw new Error("Could not get current user");

      // Update user status and role
      const { error: updateError } = await supabase
        .from("admin_profiles")
        .update({
          status: "approved",
          role_id: roleId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Log the activity with proper details
      await logActivity("user_approved", {
        user_id: userId,
        role_id: roleId,
        approved_by: admin.id,
        approved_at: new Date().toISOString(),
      });

      // Refresh the users list
      await refreshUsers();
      setApprovingUser(null);
      toast.success("User approved successfully");
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user. Please try again.");
    }
  };

  // Add new function to handle saving changes
  const handleSaveChanges = async () => {
    if (!editedUser || !editingUser) return;

    setIsSaving(true);
    try {
      // Update profile details
      const { error: profileError } = await supabase
        .from("admin_profiles")
        .update({
          full_name: editedUser.profile?.full_name,
          role_id: editedUser.profile?.role_id,
          status: editedUser.profile?.status,
          ...(editedUser.profile?.status === "approved" &&
          !editingUser.profile?.approved_at
            ? { approved_at: new Date().toISOString() }
            : {}),
        })
        .eq("id", editedUser.profile?.id);

      if (profileError) throw profileError;

      // Get current admin user for activity logging
      const {
        data: { user: admin },
        error: adminError,
      } = await supabase.auth.getUser();
      if (adminError || !admin) throw new Error("Could not get current user");

      // Log the activity
      await logActivity("user_updated", {
        user_id: editedUser.id,
        role_id: editedUser.profile?.role_id,
        status: editedUser.profile?.status,
        updated_by: admin.id,
      });

      // Refresh the users list
      await refreshUsers();

      // Close the dialog
      setEditingUser(null);
      setEditedUser(null);

      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // If user can't view the page, show restricted access message
  if (!canViewUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            This feature is restricted to users with appropriate permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">
                Contact an administrator to request access to this feature.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter((user) => user.profile?.status === "approved")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Users with approved access
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Users</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Users awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Suspended Users
            </CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter((user) => user.profile?.status === "suspended")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Users with suspended access
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Users Section */}
      {pendingUsers.length > 0 && (
        <Card className="border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-orange-500" />
              Pending Users
            </CardTitle>
            <CardDescription>
              New users awaiting approval and role assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-orange-50/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Joined{" "}
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  {canManageUsers ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setApprovingUser(user)}
                        className="border-orange-200 hover:bg-orange-50"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve User
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="secondary">Pending Approval</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card className="border-red-100">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-10 border-red-100 focus:border-red-200 focus:ring-red-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] border-red-100">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {formatRoleName(role.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-red-100">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={refreshUsers}
                disabled={refreshing}
                className="border-red-100 hover:bg-red-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
          <CardDescription>
            {canManageUsers
              ? "Manage user roles, permissions, and access levels"
              : "View user roles and access levels"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                {canManageUsers && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers
                .filter((user) => user.profile?.status !== "pending")
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="font-medium">
                            {user.profile?.full_name || "Unnamed User"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getRoleBadgeColor(
                          user.profile?.role?.name || ""
                        )}
                      >
                        {formatRoleName(user.profile?.role?.name || "")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.profile?.status === "approved"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {formatStatus(user.profile?.status || "")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.profile?.last_active
                        ? format(
                            new Date(user.profile.last_active),
                            "MMM d, yyyy"
                          )
                        : "Never"}
                    </TableCell>
                    {canManageUsers && (
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setEditingUser(user)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            {user.profile?.status === "suspended" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(user.id, "approved")
                                }
                                className="text-green-600 focus:text-green-600 focus:bg-green-50"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Approve User
                              </DropdownMenuItem>
                            )}
                            {user.profile?.status === "approved" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStatusUpdate(user.id, "suspended")
                                }
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approve User Dialog */}
      <Dialog
        open={!!approvingUser}
        onOpenChange={(open) => {
          if (!open) {
            setApprovingUser(null);
            setNewUserName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve User</DialogTitle>
            <DialogDescription>
              Set user details and assign a role
            </DialogDescription>
          </DialogHeader>
          {approvingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-red-900">
                  Email
                </Label>
                <Input
                  id="email"
                  value={approvingUser.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-red-900">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Enter user's full name"
                  className="border-red-100 focus:border-red-200 focus:ring-red-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-red-900">
                  Role
                </Label>
                <Select
                  value={approvingUser.profile?.role_id || ""}
                  onValueChange={(value) => {
                    setApprovingUser({
                      ...approvingUser,
                      profile: {
                        id: approvingUser.profile?.id || approvingUser.id,
                        full_name: approvingUser.profile?.full_name || null,
                        role_id: value,
                        status: approvingUser.profile?.status || "pending",
                        role: roles.find((r) => r.id === value) || null,
                      },
                    });
                  }}
                >
                  <SelectTrigger className="border-red-100">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {formatRoleName(role.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setApprovingUser(null);
                setNewUserName("");
              }}
              className="border-red-100 hover:bg-red-50"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                approvingUser &&
                handleApproveUser(
                  approvingUser.id,
                  approvingUser.profile?.role_id || ""
                )
              }
              disabled={!newUserName.trim() || !approvingUser?.profile?.role_id}
              className="bg-red-600 hover:bg-red-700"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {canManageUsers && (
        <Dialog
          open={!!editingUser}
          onOpenChange={(open) => {
            if (!open) {
              setEditingUser(null);
              setEditedUser(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details, role, and status
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-red-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={editingUser.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-red-900">
                    Full Name
                  </Label>
                  <Input
                    id="full_name"
                    value={
                      editedUser?.profile?.full_name ||
                      editingUser.profile?.full_name ||
                      ""
                    }
                    onChange={(e) =>
                      setEditedUser({
                        ...editingUser,
                        profile: {
                          id: editingUser.profile?.id || "",
                          full_name: e.target.value,
                          role_id: editingUser.profile?.role_id || null,
                          status: editingUser.profile?.status || "pending",
                          role: editingUser.profile?.role || null,
                        },
                      })
                    }
                    className="border-red-100 focus:border-red-200 focus:ring-red-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-red-900">
                    Role
                  </Label>
                  <Select
                    value={
                      editedUser?.profile?.role_id ||
                      editingUser.profile?.role_id ||
                      ""
                    }
                    onValueChange={(value) =>
                      setEditedUser({
                        ...editingUser,
                        profile: {
                          id: editingUser.profile?.id || "",
                          full_name: editingUser.profile?.full_name || null,
                          role_id: value,
                          status: editingUser.profile?.status || "pending",
                          role: roles.find((r) => r.id === value) || null,
                        },
                      })
                    }
                  >
                    <SelectTrigger className="border-red-100">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {formatRoleName(role.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-red-900">
                    Status
                  </Label>
                  <Select
                    value={
                      editedUser?.profile?.status ||
                      editingUser.profile?.status ||
                      ""
                    }
                    onValueChange={(value) =>
                      setEditedUser({
                        ...editingUser,
                        profile: {
                          id: editingUser.profile?.id || "",
                          full_name: editingUser.profile?.full_name || null,
                          role_id: editingUser.profile?.role_id || null,
                          status: value as "approved" | "suspended" | "pending",
                          role: editingUser.profile?.role || null,
                          ...(value === "approved" &&
                          !editingUser.profile?.approved_at
                            ? { approved_at: new Date().toISOString() }
                            : {}),
                        },
                      })
                    }
                  >
                    <SelectTrigger className="border-red-100">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingUser(null);
                  setEditedUser(null);
                }}
                className="border-red-100 hover:bg-red-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving || !editedUser}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
