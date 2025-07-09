"use client";

import type React from "react";
import { createContext, useContext, useMemo, useEffect, useState } from "react";
import { useAuth } from "./auth-context";

interface RoleContextType {
  role: string | null;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

interface RoleProviderProps {
  children: React.ReactNode;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const {
    role,
    permissions,
    isLoading: authLoading,
    isInitialized,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Handle loading state
  useEffect(() => {
    if (isInitialized) {
      console.log("Role context: Auth initialized, updating loading state...", {
        authLoading,
        hasRole: !!role,
        permissionsCount: permissions.length,
      });
      setIsLoading(authLoading);
    }
  }, [authLoading, isInitialized, role, permissions]);

  const hasPermission = useMemo(
    () =>
      (permission: string): boolean => {
        if (!role || !permissions || isLoading) {
          console.log(`Permission check failed for "${permission}":`, {
            hasRole: !!role,
            hasPermissions: !!permissions,
            isLoading,
            roleName: role?.name,
            permissionsCount: permissions?.length,
            permissions: permissions?.map(p => p.name)
          });
          return false;
        }

        // Super admin has all permissions
        if (role.name === "super_admin") {
          console.log(`Super admin granted permission: "${permission}"`);
          return true;
        }

        // All roles should have access to their own profile
        if (permission === "view_profile") {
          console.log(`Profile permission granted for role: "${role.name}"`);
          return true;
        }

        // Check if the user has the specific permission
        const hasSpecificPermission = permissions.some(
          (p) => p.name === permission
        );

        // For visitors, only allow specific permissions
        if (role.name === "visitor") {
          const visitorAllowed = ["view_dashboard", "view_analytics"].includes(permission) ||
            hasSpecificPermission;
          console.log(`Visitor permission check for "${permission}":`, visitorAllowed);
          return visitorAllowed;
        }

        console.log(`Permission check for "${permission}" with role "${role.name}":`, {
          hasSpecificPermission,
          availablePermissions: permissions.map(p => p.name)
        });

        return hasSpecificPermission;
      },
    [role, permissions, isLoading]
  );

  const contextValue = useMemo(
    () => ({
      role: role?.name ?? null,
      isLoading: isLoading || !isInitialized,
      hasPermission,
    }),
    [role?.name, isLoading, isInitialized, hasPermission]
  );

  return (
    <RoleContext.Provider value={contextValue}>{children}</RoleContext.Provider>
  );
}
