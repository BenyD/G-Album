"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
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
  const loadUserProfile = useCallback(
    async (userId: string) => {
      try {
        console.log("Loading user profile for ID:", userId);
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

        console.log("Profile query result:", {
          success: !!profileData,
          hasError: !!profileError,
        });

        if (profileError) {
          console.error("Error loading profile:", profileError);
          return;
        }

        if (profileData) {
          const roleData = profileData.role;
          const formattedPermissions =
            roleData?.role_permissions?.map(
              (rp: { permission: Permission }) => rp.permission
            ) ?? [];

          console.log("Profile data processed:", {
            hasRole: !!roleData,
            permissionsCount: formattedPermissions.length,
          });

          setProfile({ ...profileData, role: roleData });
          setRole(roleData);
          setPermissions(formattedPermissions);
        }
      } catch (error) {
        console.error("Error in loadUserProfile:", error);
      }
    },
    [supabase]
  );

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check if we're returning after a window close with no remember-me
        const wasClosing = sessionStorage.getItem("closing");
        if (wasClosing) {
          await supabase.auth.signOut();
          sessionStorage.removeItem("closing");
          router.push("/admin/login");
          return;
        }

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
  }, [loadUserProfile, router, supabase.auth]);

  const signIn = useCallback(
    async (email: string, password: string, rememberMe = false) => {
      try {
        setIsLoading(true);
        console.log("Starting authentication process...");

        const {
          data: { user },
          error: signInError,
        } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        console.log("Auth response received:", {
          success: !!user,
          hasError: !!signInError,
        });

        if (signInError) {
          console.error("Authentication error:", signInError);
          throw signInError;
        }

        if (user) {
          console.log("User authenticated successfully, loading profile...");
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

          console.log("Profile query completed:", {
            hasProfile: !!profile,
            hasError: !!profileError,
          });

          if (profileError || !profile) {
            console.error("Profile error:", profileError);
            await supabase.auth.signOut();
            throw new Error(profileError?.message || "No admin profile found");
          }

          console.log("Profile loaded successfully:", {
            hasRole: !!profile.role,
            permissions: profile.role?.role_permissions?.length ?? 0,
          });

          const roleData = profile.role;
          const formattedPermissions =
            roleData?.role_permissions?.map(
              (rp: { permission: Permission }) => rp.permission
            ) ?? [];

          setProfile({ ...profile, role: roleData });
          setRole(roleData);
          setPermissions(formattedPermissions);

          // Handle session persistence
          if (!rememberMe) {
            // If not remembering, set up cleanup on window close
            window.addEventListener("beforeunload", () => {
              // Store a flag in sessionStorage that we're closing
              sessionStorage.setItem("closing", "true");
            });
          }

          console.log("Authentication and profile setup completed");
        }
      } catch (error) {
        console.error("Error in signIn process:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [supabase.auth, router]
  );

  const signOut = useCallback(async () => {
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
  }, [supabase, router]);

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
    [
      user,
      profile,
      role,
      permissions,
      isLoading,
      isInitialized,
      hasPermission,
      signIn,
      signOut,
    ]
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
