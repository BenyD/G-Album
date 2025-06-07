"use client";

import type React from "react";
import { createContext, useContext } from "react";
import { useAuth } from "./auth-context";

interface RoleContextType {
  role: string;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: React.ReactNode;
}

export function RoleProvider({ children }: RoleProviderProps) {
  const { role, permissions, isLoading } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!role || !permissions) return false;
    return permissions.some((p) => p.name === permission);
  };

  // If we're loading or don't have a role, provide a default role
  const currentRole = !isLoading && role?.name ? role.name : "guest";

  return (
    <RoleContext.Provider
      value={{
        role: currentRole,
        isLoading,
        hasPermission,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
