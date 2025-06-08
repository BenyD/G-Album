"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import type { AdminProfile, Role, Permission } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/client";

interface AuthContextType {
  user: User | null;
  profile: AdminProfile | null;
  role: Role | null;
  permissions: Permission[];
  isLoading: boolean;
  isInitialized: boolean;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Create a Supabase client for the browser
  const supabase = createClient();

  // Load user profile, role, and permissions
  const loadUserProfile = async (userId: string) => {
    try {
      // Use a single query to get profile with role and permissions
      const { data: profileData, error: profileError } = await supabase
        .from("admin_profiles")
        .select(
          `
          *,
          role:roles (
            id,
            name,
            description,
            role_permissions (
              permission:permissions (
                id,
                name,
                description
              )
            )
          )
        `
        )
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error loading profile:", profileError);
        return;
      }

      if (profileData) {
        const roleData = profileData.role;
        const formattedPermissions =
          roleData?.role_permissions?.map((rp) => rp.permission) ?? [];

        setProfile({ ...profileData, role: roleData });
        setRole(roleData);
        setPermissions(formattedPermissions);
      }
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (mounted) {
          setUser(user);
          if (user) {
            await loadUserProfile(user.id);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setIsLoading(true);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
        setIsLoading(false);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setRole(null);
        setPermissions([]);
        router.push("/admin/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (
    email: string,
    password: string,
    rememberMe = false
  ) => {
    try {
      setIsLoading(true);
      const {
        data: { user },
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("admin_profiles")
          .select(
            `
            *,
            role:roles (
              id,
              name,
              description,
              role_permissions (
                permission:permissions (
                  id,
                  name,
                  description
                )
              )
            )
          `
          )
          .eq("id", user.id)
          .single();

        if (profileError || !profile) {
          await supabase.auth.signOut();
          throw new Error(profileError?.message || "No admin profile found");
        }

        if (profile.status === "pending") {
          await supabase.auth.signOut();
          throw new Error("Your account is pending approval");
        }

        if (profile.status === "suspended") {
          await supabase.auth.signOut();
          throw new Error("Your account has been suspended");
        }

        // Set session persistence based on remember me
        if (rememberMe) {
          await supabase.auth.updateSession({
            refresh_token: user.refresh_token!,
            access_token: user.access_token!,
          });
        }

        const roleData = profile.role;
        const formattedPermissions =
          roleData?.role_permissions?.map((rp) => rp.permission) ?? [];

        setProfile({ ...profile, role: roleData });
        setRole(roleData);
        setPermissions(formattedPermissions);

        router.push("/admin/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setRole(null);
      setPermissions([]);
      router.push("/admin/login");
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = useMemo(
    () => (permissionName: string) => {
      return permissions.some((p) => p.name === permissionName);
    },
    [permissions]
  );

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      role,
      permissions,
      isLoading,
      isInitialized,
      signIn,
      signOut,
      hasPermission,
    }),
    [user, profile, role, permissions, isLoading, isInitialized, hasPermission]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
