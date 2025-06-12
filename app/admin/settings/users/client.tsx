"use client";

import { useState, useCallback, useEffect } from "react";
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
  Users,
  UserCheck,
  UserX,
  ArrowUpDown,
  Filter,
  Loader2,
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
  getUsers,
  getRoles,
} from "./actions";
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
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";

export function UserManagementClient() {
  const { role, hasPermission } = useRole();
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest");
  const [refreshing, setRefreshing] = useState(false);
  const supabase = createClient();
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, rolesData] = await Promise.all([
          getUsers(),
          getRoles(),
        ]);
        setUsers(usersData || []);
        setRoles(rolesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load users and roles. Please try again.");
      }
    };
    fetchData();
  }, []);

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
  const pendingUsers = sortedUsers.filter((user) => !user.profile?.role_id);

  // Get active users
  const activeUsers = sortedUsers.filter((user) => user.profile?.role_id);

  // Get suspended users
  const suspendedUsers = sortedUsers.filter(
    (user) => user.profile?.status === "suspended"
  );

  // Handle user update
  const handleUserUpdate = async (user: UserWithProfile) => {
    try {
      const { error } = await supabase
        .from("admin_profiles")
        .update({
          full_name: user.profile?.full_name,
          role_id: user.profile?.role_id,
          status: user.profile?.status,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Get current admin user
      const {
        data: { user: admin },
        error: adminError,
      } = await supabase.auth.getUser();
      if (adminError || !admin) throw new Error("Could not get current user");

      // Log the activity
      await logActivity("user_profile_updated", {
        user_id: user.id,
        email: user.email,
        updated_by: admin.id,
        full_name: user.profile?.full_name,
        role_id: user.profile?.role_id,
        status: user.profile?.status,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...user } : u))
      );
      setEditingUser(null);
      toast.success("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user. Please try again.");
    }
  };

  // Handle role assignment
  const handleRoleAssign = async (userId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from("admin_profiles")
        .update({ role_id: roleId })
        .eq("id", userId);

      if (error) throw error;

      // Get current admin user
      const {
        data: { user: admin },
        error: adminError,
      } = await supabase.auth.getUser();
      if (adminError || !admin) throw new Error("Could not get current user");

      // Log the activity
      await logActivity("user_role_assigned", {
        user_id: userId,
        role_id: roleId,
        assigned_by: admin.id,
      });

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? {
                ...user,
                profile: {
                  ...user.profile,
                  role_id: roleId,
                  role: roles.find((r) => r.id === roleId) || null,
                },
              }
            : user
        )
      );
      toast.success("Role assigned successfully");
    } catch (error) {
      console.error("Error assigning role:", error);
      toast.error("Failed to assign role. Please try again.");
    }
  };

  // Handle status update
  const handleStatusUpdate = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("admin_profiles")
        .update({ status })
        .eq("id", userId);

      if (error) throw error;

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

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, profile: { ...user.profile, status } }
            : user
        )
      );
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        getUsers(),
        getRoles(),
      ]);
      setUsers(usersData || []);
      setRoles(rolesData || []);
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data. Please try again.");
    } finally {
      setRefreshing(false);
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
    const colors: Record<string, string> = {
      super_admin: "bg-red-100 text-red-800 border-red-200",
      admin: "bg-red-100 text-red-800 border-red-200",
      editor: "bg-red-100 text-red-800 border-red-200",
      viewer: "bg-red-100 text-red-800 border-red-200",
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
            <div className="text-2xl font-bold">
              {
                users.filter((user) => user.profile?.status === "pending")
                  .length
              }
            </div>
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

              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as typeof sortBy)}
              >
                <SelectTrigger className="w-[180px] border-red-100">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-red-100 hover:bg-red-50 hover:text-red-600"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {sortedUsers.length === 0 ? (
        <Card className="border-red-100">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              No Users Found
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                ? "No users match your current filters. Try adjusting your search criteria or clearing filters."
                : "There are no users yet."}
            </p>
            {(searchTerm || roleFilter !== "all" || statusFilter !== "all") && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-red-100 hover:bg-red-50"
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-red-100">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-red-50/50">
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-red-50/50"
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                        <User className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.profile?.full_name || "No name set"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getRoleBadgeColor(
                        user.profile?.role?.name || ""
                      )}
                    >
                      {formatRoleName(user.profile?.role?.name || "Unknown")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        user.profile?.status === "suspended"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : user.profile?.status === "approved"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }
                    >
                      {formatStatus(user.profile?.status || "pending")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), "MMM d, yyyy")}
                  </TableCell>
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
                        {user.profile?.status === "suspended" ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusUpdate(user.id, "approved")
                            }
                            className="text-green-600 focus:text-green-600 focus:bg-green-50"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve User
                          </DropdownMenuItem>
                        ) : (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
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
                  value={editingUser.profile?.full_name || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      profile: {
                        ...editingUser.profile,
                        full_name: e.target.value,
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
                  value={editingUser.profile?.role_id || ""}
                  onValueChange={(value) =>
                    setEditingUser({
                      ...editingUser,
                      profile: {
                        ...editingUser.profile,
                        role_id: value,
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
                  value={editingUser.profile?.status || "pending"}
                  onValueChange={(value) =>
                    setEditingUser({
                      ...editingUser,
                      profile: {
                        ...editingUser.profile,
                        status: value as "approved" | "suspended",
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
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              className="bg-red-600 hover:bg-red-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
