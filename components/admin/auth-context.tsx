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

  // Create Supabase client
  const supabase = createClient();

  // Load user profile, role, and permissions
  const loadUserProfile = useCallback(
    async (userId: string) => {
      try {
        console.log("Loading user profile for ID:", userId);

        // Try to load profile from server
        const response = await fetch(`/api/admin/profile?userId=${userId}`);
        if (!response.ok) {
          console.error(
            "Error loading profile from server:",
            await response.text()
          );
          return false;
        }

        const serverProfileData = await response.json();
        if (!serverProfileData) {
          console.log("No profile data found from server");
          return false;
        }

        const roleData = serverProfileData.role;
        const formattedPermissions =
          roleData?.role_permissions?.map(
            (rp: { permission: Permission }) => rp.permission
          ) ?? [];

        setProfile(serverProfileData);
        setRole(roleData);
        setPermissions(formattedPermissions);
        return true;
      } catch (error) {
        console.error("Error in loadUserProfile:", error);
        return false;
      }
    },
    [supabase]
  );

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      if (!mounted) return;

      try {
        console.log("Initializing auth state...");
        setIsLoading(true);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          console.log("Found existing session, loading user data...");
          setUser(session.user);
          const profileLoaded = await loadUserProfile(session.user.id);

          if (!profileLoaded) {
            console.log("Profile loading failed, signing out...");
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setRole(null);
            setPermissions([]);
            router.push("/admin/login");
          }
        } else {
          console.log("No existing session found");
          setUser(null);
          setProfile(null);
          setRole(null);
          setPermissions([]);
        }
      } catch (error) {
        console.error("Error in initializeAuth:", error);
        if (mounted) {
          setUser(null);
          setProfile(null);
          setRole(null);
          setPermissions([]);
        }
      } finally {
        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false);
          console.log("Auth initialization completed");
        }
      }
    };

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event);

      try {
        if (event === "INITIAL_SESSION") {
          // Handle initial session
          if (session?.user) {
            setUser(session.user);
            const profileLoaded = await loadUserProfile(session.user.id);

            if (!profileLoaded) {
              console.log(
                "Profile loading failed during initial session, signing out..."
              );
              await supabase.auth.signOut();
              setUser(null);
              setProfile(null);
              setRole(null);
              setPermissions([]);
              router.push("/admin/login");
            }
          } else {
            setUser(null);
            setProfile(null);
            setRole(null);
            setPermissions([]);
          }
          setIsInitialized(true);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            setUser(session.user);
            const profileLoaded = await loadUserProfile(session.user.id);

            if (!profileLoaded) {
              console.log(
                "Profile loading failed after sign in, signing out..."
              );
              await supabase.auth.signOut();
              setUser(null);
              setProfile(null);
              setRole(null);
              setPermissions([]);
              router.push("/admin/login");
            }
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setRole(null);
          setPermissions([]);
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
        setUser(null);
        setProfile(null);
        setRole(null);
        setPermissions([]);
        router.push("/admin/login");
      } finally {
        if (event !== "INITIAL_SESSION") {
          setIsLoading(false);
        }
      }
    });

    // Initialize auth state
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile, supabase.auth, router]);

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      role,
      permissions,
      isLoading,
      isInitialized,
      signIn: async (email: string, password: string, rememberMe = false) => {
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

          if (signInError) throw signInError;

          if (user) {
            console.log("User authenticated, loading profile...");
            const profileLoaded = await loadUserProfile(user.id);

            if (!profileLoaded) {
              console.log("Profile loading failed during sign in");
              await supabase.auth.signOut();
              throw new Error("Failed to load user profile");
            }

            // If not remembering, set up session cleanup on window close
            if (!rememberMe) {
              window.addEventListener("beforeunload", async () => {
                await supabase.auth.signOut();
                sessionStorage.clear();
                localStorage.clear();
              });
            }

            console.log("Authentication and profile setup completed");
            router.push("/admin/dashboard");
          }
        } catch (error) {
          console.error("Error during sign in:", error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      signOut: async () => {
        try {
          setIsLoading(true);
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          // Clear any stored session data
          sessionStorage.clear();
          localStorage.clear();

          router.push("/admin/login");
        } catch (error) {
          console.error("Error during sign out:", error);
          throw error;
        } finally {
          setIsLoading(false);
        }
      },
      hasPermission: (permission: string) => {
        return permissions.some((p) => p.name === permission);
      },
    }),
    [
      user,
      profile,
      role,
      permissions,
      isLoading,
      isInitialized,
      loadUserProfile,
      supabase.auth,
      router,
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
