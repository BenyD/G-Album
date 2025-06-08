"use client";

import type React from "react";
import { createContext, useContext, useMemo } from "react";
import { useAuth } from "./auth-context";

interface RoleContextType {
  role: string;
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
  const { role, permissions, isLoading } = useAuth();

  const hasPermission = useMemo(
    () =>
      (permission: string): boolean => {
        if (!role || !permissions) return false;
        return permissions.some((p) => p.name === permission);
      },
    [role, permissions]
  );

  // If we're loading or don't have a role, provide a default role
  const currentRole = !isLoading && role?.name ? role.name : "guest";

  const contextValue = useMemo(
    () => ({
      role: currentRole,
      isLoading,
      hasPermission,
    }),
    [currentRole, isLoading, hasPermission]
  );

  return (
    <RoleContext.Provider value={contextValue}>{children}</RoleContext.Provider>
  );
}
