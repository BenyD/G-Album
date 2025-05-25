"use client"

import { useRole } from "@/components/admin/role-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, Lock, MoreHorizontal, Search, Shield, User, UserPlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { RoleBasedContent } from "@/components/admin/role-based-content"

export default function UserManagementPage() {
  const { role, hasPermission } = useRole()

  // Sample users
  const users = [
    { id: 1, name: "Admin User", email: "admin@galbum.com", role: "superadmin", lastActive: "2 hours ago" },
    { id: 2, name: "John Smith", email: "john@galbum.com", role: "admin", lastActive: "1 day ago" },
    { id: 3, name: "Sarah Johnson", email: "sarah@galbum.com", role: "employee", lastActive: "3 days ago" },
    { id: 4, name: "Michael Brown", email: "michael@galbum.com", role: "accounts", lastActive: "5 days ago" },
    { id: 5, name: "Emily Wilson", email: "emily@galbum.com", role: "employee", lastActive: "1 week ago" },
  ]

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-red-100 text-red-800"
      case "admin":
        return "bg-blue-100 text-blue-800"
      case "accounts":
        return "bg-green-100 text-green-800"
      case "employee":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const canManageRoles = hasPermission("manage_roles")

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">User Management</AlertTitle>
        <AlertDescription className="text-blue-700">
          You are viewing as <strong>{role}</strong>.
          {canManageRoles
            ? " You can manage user roles and permissions."
            : " You don't have permission to manage users."}
        </AlertDescription>
      </Alert>

      {!canManageRoles && (
        <Alert variant="default" className="mb-4 bg-red-50 border-red-200 text-red-800">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            You don't have permission to manage users. This feature is only available to Superadmin users.
          </AlertDescription>
        </Alert>
      )}

      <RoleBasedContent
        permissions={["manage_roles"]}
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>This feature is restricted to users with role management permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <div className="text-center">
                  <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Contact an administrator to request access to this feature.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground mt-1">
              Users are added directly in Supabase. Assign roles to activate accounts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search users..." className="pl-8" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="superadmin">Superadmin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="accounts">Accounts</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
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
            <CardDescription>Users from Supabase awaiting role assignment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Sample pending users */}
              {[
                { id: 6, email: "newuser1@galbum.com", addedDate: "2 hours ago" },
                { id: 7, email: "newuser2@galbum.com", addedDate: "1 day ago" },
                { id: 8, email: "newuser3@galbum.com", addedDate: "3 days ago" },
              ].map((pendingUser) => (
                <div
                  key={pendingUser.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 border-orange-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{pendingUser.email}</p>
                      <p className="text-sm text-muted-foreground">Added {pendingUser.addedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select>
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue placeholder="Assign role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="accounts">Accounts</SelectItem>
                        <SelectItem value="employee">Employee</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                      Accept
                    </Button>
                  </div>
                </div>
              ))}
              {/* Empty state for no pending users */}
              {false && (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No pending users</p>
                  <p className="text-sm text-slate-400">New users added in Supabase will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Active User Accounts
            </CardTitle>
            <CardDescription>Users with assigned roles and active accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Active</th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle font-medium">{user.name}</td>
                      <td className="p-4 align-middle">{user.email}</td>
                      <td className="p-4 align-middle">
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">{user.lastActive}</td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Select
                            defaultValue={user.role}
                            disabled={user.role === "superadmin" && role !== "superadmin"}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue placeholder="Change role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="superadmin">Superadmin</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="accounts">Accounts</SelectItem>
                              <SelectItem value="employee">Employee</SelectItem>
                            </SelectContent>
                          </Select>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem disabled={user.role === "superadmin"}>
                                <Lock className="mr-2 h-4 w-4" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" disabled={user.role === "superadmin"}>
                                <Shield className="mr-2 h-4 w-4" />
                                Disable Account
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
      </RoleBasedContent>
    </div>
  )
}
