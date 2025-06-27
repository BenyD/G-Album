"use client";

import type React from "react";

import { useRole } from "@/components/admin/role-context";
import { useAuth } from "@/components/admin/auth-context";

interface RoleBasedContentProps {
  children: React.ReactNode;
  permissions: string[];
  fallback?: React.ReactNode;
}

export function RoleBasedContent({
  children,
  permissions,
  fallback,
}: RoleBasedContentProps) {
  const { hasPermission } = useRole();
  const { profile } = useAuth();

  // Check if user is super admin
  const isSuperAdmin = profile?.role?.name === "super_admin";

  // Super admin has access to all content, otherwise check permissions
  const hasAccess =
    isSuperAdmin || permissions.some((permission) => hasPermission(permission));

  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}
