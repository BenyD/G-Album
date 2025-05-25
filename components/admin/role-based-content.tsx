"use client"

import type React from "react"

import { useRole } from "@/components/admin/role-context"

interface RoleBasedContentProps {
  children: React.ReactNode
  permissions: string[]
  fallback?: React.ReactNode
}

export function RoleBasedContent({ children, permissions, fallback }: RoleBasedContentProps) {
  const { hasPermission } = useRole()

  // Check if the user has any of the required permissions
  const hasAnyPermission = permissions.some((permission) => hasPermission(permission))

  if (!hasAnyPermission) {
    return fallback || null
  }

  return <>{children}</>
}
