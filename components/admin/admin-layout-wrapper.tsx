"use client"

import type React from "react"
import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import AdminSidebar from "@/components/admin/sidebar"
import AdminHeader from "@/components/admin/header"
import AdminFooter from "@/components/admin/footer"
import { RoleProvider } from "@/components/admin/role-context"

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  // In a real app, this would come from your auth context
  const [currentRole, setCurrentRole] = useState<"superadmin" | "admin" | "accounts" | "employee">("superadmin")

  // Function to change roles (for demo purposes)
  const changeRole = (role: "superadmin" | "admin" | "accounts" | "employee") => {
    setCurrentRole(role)
  }

  return (
    <RoleProvider role={currentRole} changeRole={changeRole}>
      <SidebarProvider>
        <div className="min-h-screen w-full bg-slate-50 flex">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 w-full">
            {/* Header */}
            <AdminHeader />

            {/* Main Content */}
            <main className="flex-1 w-full overflow-auto">
              <div className="w-full h-full p-3 sm:p-4 md:p-6 lg:p-8">{children}</div>
            </main>

            {/* Footer */}
            <AdminFooter />
          </div>
        </div>
      </SidebarProvider>
    </RoleProvider>
  )
}
