import { createContext, useContext, useEffect, useState } from "react";
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
  const router = useRouter();

  // Create a Supabase client for the browser
  const supabase = createClient();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get current session
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUser(user);
          await loadUserProfile(user.id);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
        setRole(null);
        setPermissions([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile, role, and permissions
  const loadUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      // First, get the basic profile
      const { data: profile, error: profileError } = await supabase
        .from("admin_profiles")
        .select("*, role_id")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error loading profile:", profileError);
        return;
      }

      if (profile) {
        // Then get the role details separately
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("id, name, description")
          .eq("id", profile.role_id)
          .single();

        if (roleError) {
          console.error("Error loading role:", roleError);
          return;
        }

        const fullProfile = { ...profile, role: roleData };
        console.log("Loaded profile:", fullProfile);
        setProfile(fullProfile);
        setRole(roleData);

        if (profile.role_id) {
          // Get permissions for the role
          const { data: permissions, error: permissionsError } = await supabase
            .from("role_permissions")
            .select("permission:permissions (id, name, description)")
            .eq("role_id", profile.role_id);

          if (permissionsError) {
            console.error("Error loading permissions:", permissionsError);
            return;
          }

          const formattedPermissions =
            permissions?.map((p) => p.permission) ?? [];
          console.log("Loaded permissions:", formattedPermissions);
          setPermissions(formattedPermissions);
        }
      }
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberMe = false
  ) => {
    try {
      setIsLoading(true);
      console.log("Attempting to sign in with email:", email);

      const {
        data: { user },
        error: signInError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (user) {
        console.log("User signed in:", user);

        // Get basic profile first
        const { data: profile, error: profileError } = await supabase
          .from("admin_profiles")
          .select("*, role_id")
          .eq("id", user.id)
          .single();

        console.log("Profile check result:", { profile, error: profileError });

        if (profileError) {
          console.error("Profile error:", profileError);
          await supabase.auth.signOut();
          throw new Error("Failed to load admin profile");
        }

        if (!profile) {
          await supabase.auth.signOut();
          throw new Error("No admin profile found");
        }

        if (profile.status === "pending") {
          await supabase.auth.signOut();
          throw new Error("Your account is pending approval");
        }

        if (profile.status === "suspended") {
          await supabase.auth.signOut();
          throw new Error("Your account has been suspended");
        }

        // Get role details separately
        const { data: roleData, error: roleError } = await supabase
          .from("roles")
          .select("id, name, description")
          .eq("id", profile.role_id)
          .single();

        if (roleError) {
          console.error("Error loading role:", roleError);
          await supabase.auth.signOut();
          throw new Error("Failed to load role information");
        }

        const fullProfile = { ...profile, role: roleData };

        // Set session persistence based on remember me
        if (rememberMe) {
          await supabase.auth.updateSession({
            refresh_token: user.refresh_token!,
            access_token: user.access_token!,
          });
        }

        setProfile(fullProfile);
        setRole(roleData);

        // Load permissions
        if (profile.role_id) {
          const { data: permissions, error: permissionsError } = await supabase
            .from("role_permissions")
            .select("permission:permissions (id, name, description)")
            .eq("role_id", profile.role_id);

          if (!permissionsError && permissions) {
            const formattedPermissions = permissions.map((p) => p.permission);
            setPermissions(formattedPermissions);
          }
        }

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
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const hasPermission = (permissionName: string) => {
    return permissions.some((p) => p.name === permissionName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        permissions,
        isLoading,
        signIn,
        signOut,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
