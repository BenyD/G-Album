"use client"

import { useRole } from "@/components/admin/role-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Info, Mail, Save, Upload, Shield, Clock, Users, FileText, Settings, Edit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

export default function ProfilePage() {
  const { role } = useRole()
  const [isEditingName, setIsEditingName] = useState(false)
  const [userName, setUserName] = useState("Admin User")

  // Mock user data
  const userData = {
    name: userName,
    email: "admin@galbum.com",
    role: role,
    joinedDate: "January 15, 2023",
    lastActive: "2 hours ago",
  }

  // Mock activity history
  const activityHistory = [
    {
      id: 1,
      action: "Logged in",
      timestamp: "2024-01-25 09:30 AM",
      ip: "192.168.1.100",
      device: "Chrome on Windows",
    },
    {
      id: 2,
      action: "Created new album",
      timestamp: "2024-01-25 10:15 AM",
      ip: "192.168.1.100",
      device: "Chrome on Windows",
    },
    {
      id: 3,
      action: "Updated customer record",
      timestamp: "2024-01-25 11:45 AM",
      ip: "192.168.1.100",
      device: "Chrome on Windows",
    },
    {
      id: 4,
      action: "Logged out",
      timestamp: "2024-01-24 06:00 PM",
      ip: "192.168.1.100",
      device: "Chrome on Windows",
    },
    {
      id: 5,
      action: "Processed order #1234",
      timestamp: "2024-01-24 03:30 PM",
      ip: "192.168.1.100",
      device: "Chrome on Windows",
    },
  ]

  // Role permissions mapping
  const rolePermissions = {
    superadmin: [
      { category: "User Management", permissions: ["Create users", "Edit users", "Delete users", "Assign roles"] },
      {
        category: "Content Management",
        permissions: ["Create albums", "Edit albums", "Delete albums", "Manage gallery"],
      },
      {
        category: "Business Operations",
        permissions: ["View customers", "Edit customers", "Process orders", "View analytics"],
      },
      { category: "System Settings", permissions: ["System configuration", "Backup management", "Security settings"] },
    ],
    admin: [
      {
        category: "Content Management",
        permissions: ["Create albums", "Edit albums", "Delete albums", "Manage gallery"],
      },
      {
        category: "Business Operations",
        permissions: ["View customers", "Edit customers", "Process orders", "View analytics"],
      },
      { category: "User Management", permissions: ["View users", "Edit user profiles"] },
    ],
    accounts: [
      {
        category: "Business Operations",
        permissions: ["View customers", "Edit customers", "Process orders", "Generate invoices"],
      },
      { category: "Financial", permissions: ["View revenue", "Process payments", "Generate reports"] },
    ],
    employee: [
      { category: "Content Management", permissions: ["Create albums", "Edit albums", "View gallery"] },
      { category: "Customer Service", permissions: ["View customers", "Respond to inquiries"] },
    ],
  }

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

  const handleNameSave = () => {
    setIsEditingName(false)
    // Here you would typically save to backend
  }

  const handleProfilePictureUpload = () => {
    // Handle profile picture upload
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Handle file upload logic here
        console.log("Uploading profile picture:", file.name)
      }
    }
    input.click()
  }

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Your Profile</AlertTitle>
        <AlertDescription className="text-blue-700">
          You are viewing your profile as <strong>{role}</strong>. You can update your profile picture and name.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal information and role</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="/placeholder.svg?height=96&width=96&query=user avatar" alt={userData.name} />
                <AvatarFallback className="text-2xl">{userData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={handleProfilePictureUpload}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-full mb-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input value={userName} onChange={(e) => setUserName(e.target.value)} className="text-center" />
                  <Button size="sm" onClick={handleNameSave}>
                    <Save className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h3 className="text-xl font-semibold">{userData.name}</h3>
                  <Button size="sm" variant="ghost" onClick={() => setIsEditingName(true)} className="h-6 w-6 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">{userData.email}</span>
            </div>
            <Badge className={getRoleBadgeColor(userData.role)}>
              {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
            </Badge>
            <div className="mt-4 text-sm text-slate-500">
              <p>Joined: {userData.joinedDate}</p>
              <p>Last active: {userData.lastActive}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>View your activity history and role permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="activity" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Activity History
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role Permissions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-slate-700">Recent Activity</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activityHistory.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50"
                      >
                        <div className="shrink-0 mt-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activity.timestamp}
                            </span>
                            <span>IP: {activity.ip}</span>
                            <span>{activity.device}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-slate-600" />
                    <h4 className="font-medium text-slate-700">
                      Permissions for {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)} Role
                    </h4>
                  </div>

                  <div className="space-y-4">
                    {rolePermissions[role as keyof typeof rolePermissions]?.map((category, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <h5 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                          {category.category === "User Management" && <Users className="h-4 w-4" />}
                          {category.category === "Content Management" && <FileText className="h-4 w-4" />}
                          {category.category === "Business Operations" && <Settings className="h-4 w-4" />}
                          {category.category === "System Settings" && <Shield className="h-4 w-4" />}
                          {category.category === "Financial" && <Settings className="h-4 w-4" />}
                          {category.category === "Customer Service" && <Users className="h-4 w-4" />}
                          {category.category}
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {category.permissions.map((permission, permIndex) => (
                            <div key={permIndex} className="flex items-center gap-2 text-sm text-slate-600">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                              {permission}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
