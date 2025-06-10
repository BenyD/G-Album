"use client";

import { useState } from "react";
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
  Lock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  User,
  UserPlus,
  Check,
  Ban,
  Pencil,
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
import { RoleBasedContent } from "@/components/admin/role-based-content";
import {
  assignRole,
  updateUserStatus,
  updateUserProfile,
  type UserWithProfile,
} from "./actions";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserManagementClientProps {
  initialUsers: UserWithProfile[];
  initialRoles: any[];
}

export function UserManagementClient({
  initialUsers,
  initialRoles,
}: UserManagementClientProps) {
  const { role, hasPermission } = useRole();
  const [users, setUsers] = useState<UserWithProfile[]>(initialUsers);
  const [roles] = useState<any[]>(initialRoles);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const supabase = createClient();
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);

  // Filter and sort users
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.full_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesRole =
        roleFilter === "all" || user.profile?.role?.name === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      // Sort by status: pending first, then by creation date
      const statusOrder = { pending: 0, approved: 1, suspended: 2 };
      const aStatus = a.profile?.status || "pending";
      const bStatus = b.profile?.status || "pending";
      if (aStatus !== bStatus) {
        return statusOrder[aStatus] - statusOrder[bStatus];
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

  // Get pending users
  const pendingUsers = filteredUsers.filter((user) => !user.profile?.role_id);

  // Get active users
  const activeUsers = filteredUsers.filter((user) => user.profile?.role_id);

  // Handle user update
  const handleUserUpdate = async (
    userId: string,
    data: {
      full_name?: string;
      role_id?: string;
      status?: "approved" | "suspended";
    }
  ) => {
    try {
      const updates = [];

      if (data.role_id) {
        updates.push(assignRole(userId, data.role_id));
      }
      if (data.status) {
        updates.push(updateUserStatus(userId, data.status));
      }
      if (data.full_name) {
        updates.push(updateUserProfile(userId, { full_name: data.full_name }));
      }

      await Promise.all(updates);
      setEditingUser(null);
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  // Handle role assignment
  const handleRoleAssign = async (userId: string, roleId: string) => {
    try {
      await assignRole(userId, roleId);
      toast.success("Role assigned successfully");
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("Failed to assign role");
    }
  };

  // Handle status update
  const handleStatusUpdate = async (
    userId: string,
    status: "approved" | "suspended"
  ) => {
    try {
      await updateUserStatus(userId, status);
      toast.success(
        `User ${status === "approved" ? "approved" : "suspended"} successfully`
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update user status");
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Handle quick approval
  const handleQuickApproval = async (userId: string, roleId: string) => {
    try {
      await assignRole(userId, roleId);

      // Find the selected role
      const selectedRole = roles.find((r) => r.id === roleId);
      if (!selectedRole) {
        throw new Error("Selected role not found");
      }

      toast.success("User approved successfully");

      // Update the users list with the correct role information
      const updatedUsers = users.map((user) =>
        user.id === userId
          ? {
              ...user,
              profile: {
                ...user.profile,
                role_id: roleId,
                role: {
                  id: roleId,
                  name: selectedRole.name,
                  description: selectedRole.description,
                },
                status: "approved",
              },
            }
          : user
      );
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Failed to approve user");
    }
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (!editingUser) return;

    try {
      // Update profile if name changed
      if (
        editingUser.profile?.full_name !==
        users.find((u) => u.id === editingUser.id)?.profile?.full_name
      ) {
        await updateUserProfile(editingUser.id, {
          full_name: editingUser.profile?.full_name || "",
        });
      }

      // Update role if changed
      if (
        editingUser.profile?.role_id !==
        users.find((u) => u.id === editingUser.id)?.profile?.role_id
      ) {
        await assignRole(editingUser.id, editingUser.profile?.role_id || "");
      }

      // Update status if changed
      if (
        editingUser.profile?.status !==
        users.find((u) => u.id === editingUser.id)?.profile?.status
      ) {
        await updateUserStatus(
          editingUser.id,
          editingUser.profile?.status as "approved" | "suspended"
        );
      }

      // Update local state
      const updatedUsers = users.map((user) =>
        user.id === editingUser.id ? editingUser : user
      );
      setUsers(updatedUsers);

      setEditingUser(null);
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName) {
      case "super_admin":
        return "bg-red-100 text-red-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "editor":
        return "bg-green-100 text-green-800";
      case "viewer":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  // Format role name for display
  const formatRoleName = (roleName: string) => {
    if (!roleName) return "";
    return roleName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const canManageRoles = hasPermission("manage_users");

  if (!canManageRoles) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            This feature is restricted to users with role management
            permissions.
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
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground mt-1">
            Users are added via Supabase Authentication. Assign roles to
            activate accounts.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
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
      </div>

      {/* Pending Users Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-orange-500" />
            Pending Users
          </CardTitle>
          <CardDescription>
            Users from Supabase awaiting role assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingUsers.length > 0 ? (
              pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Added {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={(roleId) =>
                        handleQuickApproval(user.id, roleId)
                      }
                    >
                      <SelectTrigger className="w-[130px] h-8">
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
              ))
            ) : (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No pending users</p>
                <p className="text-sm text-slate-400">
                  New users added in Supabase will appear here
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Users Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Active User Accounts
          </CardTitle>
          <CardDescription>
            Users with assigned roles and active accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {activeUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">{user.email}</td>
                    <td className="p-4 align-middle">
                      {user.profile?.full_name || "-"}
                    </td>
                    <td className="p-4 align-middle">
                      {user.profile?.role?.name
                        ? formatRoleName(user.profile.role.name)
                        : "-"}
                    </td>
                    <td className="p-4 align-middle">
                      <Badge
                        className={
                          user.profile?.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {formatStatus(user.profile?.status || "pending")}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setEditingUser(user)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusUpdate(
                                  user.id,
                                  user.profile?.status === "approved"
                                    ? "suspended"
                                    : "approved"
                                )
                              }
                              className={
                                user.profile?.status === "approved"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              {user.profile?.status === "approved" ? (
                                <>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Suspend User
                                </>
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Approve User
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user's profile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={editingUser?.profile?.full_name || ""}
                onChange={(e) =>
                  setEditingUser((prev) =>
                    prev
                      ? {
                          ...prev,
                          profile: {
                            ...prev.profile!,
                            full_name: e.target.value,
                          },
                        }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={editingUser?.profile?.role_id}
                onValueChange={(roleId) =>
                  setEditingUser((prev) =>
                    prev
                      ? {
                          ...prev,
                          profile: {
                            ...prev.profile!,
                            role_id: roleId,
                          },
                        }
                      : null
                  )
                }
              >
                <SelectTrigger>
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
              <label className="text-sm font-medium">Status</label>
              <Select
                value={editingUser?.profile?.status}
                onValueChange={(status: "approved" | "suspended") =>
                  setEditingUser((prev) =>
                    prev
                      ? {
                          ...prev,
                          profile: {
                            ...prev.profile!,
                            status,
                          },
                        }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
