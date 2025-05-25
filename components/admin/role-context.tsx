"use client"

import type React from "react"
import { createContext, useContext } from "react"

type Role = "superadmin" | "admin" | "accounts" | "employee"

interface RoleContextType {
  role: Role
  changeRole: (role: Role) => void
  hasPermission: (permission: string) => boolean
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

// Define permissions for each role
const rolePermissions: Record<Role, string[]> = {
  superadmin: [
    "view_dashboard",
    "edit_albums",
    "upload_gallery",
    "view_submissions",
    "send_newsletters",
    "view_analytics",
    "manage_roles",
    "manage_users",
    "view_profile",
    "manage_customers",
    "manage_orders",
    "manage_settings",
  ],
  admin: [
    "view_dashboard",
    "edit_albums",
    "upload_gallery",
    "view_submissions",
    "send_newsletters",
    "view_analytics",
    "view_profile",
    "manage_customers",
    "manage_orders",
  ],
  accounts: ["view_dashboard", "view_submissions", "view_profile", "manage_customers", "manage_orders"],
  employee: ["view_dashboard", "edit_albums", "upload_gallery", "view_submissions", "view_profile"],
}

interface RoleProviderProps {
  children: React.ReactNode
  role: Role
  changeRole: (role: Role) => void
}

export function RoleProvider({ children, role, changeRole }: RoleProviderProps) {
  const hasPermission = (permission: string): boolean => {
    return rolePermissions[role]?.includes(permission) || false
  }

  return <RoleContext.Provider value={{ role, changeRole, hasPermission }}>{children}</RoleContext.Provider>
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}
