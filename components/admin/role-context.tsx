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
        if (!role || !permissions || isLoading) return false;
        return permissions.some((p) => p.name === permission);
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
