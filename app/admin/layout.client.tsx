"use client";

import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { useAuth } from "@/components/admin/auth-context";
import { RoleProvider } from "@/components/admin/role-context";
import { useEffect, useState, useCallback, useRef } from "react";
import AdminLoading from "@/components/admin/loading";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    profile,
    isLoading: authLoading,
    isInitialized,
    signOut,
  } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const isLoginPage = pathname === "/admin/login";
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleNavigation = useCallback(async () => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    // Only proceed if auth is initialized and we're not already navigating
    if (!isInitialized || isNavigating) {
      return;
    }

    // Only navigate if auth is not in loading state
    if (!authLoading) {
      try {
        if (!user && !isLoginPage) {
          setIsNavigating(true);
          console.log("No user found, redirecting to login...");
          await router.push("/admin/login");
        } else if (user && !profile && !isLoginPage) {
          setIsNavigating(true);
          console.log("No profile found, signing out...");
          // If we have a user but no profile, something is wrong - sign out
          await signOut();
        } else if (user && profile && isLoginPage) {
          setIsNavigating(true);
          console.log("User already logged in, redirecting to dashboard...");
          await router.push("/admin/dashboard");
        }
      } catch (error) {
        console.error("Navigation error:", error);
      } finally {
        // Reset navigation state after a delay to prevent rapid re-renders
        timeoutRef.current = setTimeout(() => {
          setIsNavigating(false);
        }, 1000);
      }
    }
  }, [
    user,
    profile,
    authLoading,
    isInitialized,
    isLoginPage,
    router,
    isNavigating,
    signOut,
  ]);

  useEffect(() => {
    let mounted = true;

    const initNavigation = async () => {
      if (mounted) {
        await handleNavigation();
      }
    };

    initNavigation();

    return () => {
      mounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleNavigation]);

  // Show loading state while auth is initializing
  if (!isInitialized) {
    console.log("Waiting for auth initialization...");
    return <AdminLoading />;
  }

  // For login page, render immediately after initialization
  if (isLoginPage) {
    console.log("Rendering login page...");
    return (
      <div className="min-h-screen w-full">
        <Toaster richColors position="top-right" />
        <main className="w-full">{children}</main>
      </div>
    );
  }

  // For authenticated pages, show loading during auth loading or navigation
  if (authLoading || isNavigating) {
    console.log("Loading authenticated content...", {
      authLoading,
      isNavigating,
      hasUser: !!user,
      hasProfile: !!profile,
      pathname,
    });
    return <AdminLoading />;
  }

  // Render authenticated pages with RoleProvider
  if (user && profile) {
    console.log("Rendering authenticated page...");
    return (
      <RoleProvider>
        <div className="min-h-screen w-full">
          <Toaster richColors position="top-right" />
          <main className="p-4 sm:p-6 md:p-8 w-full max-w-[1920px] mx-auto">
            {children}
          </main>
        </div>
      </RoleProvider>
    );
  }

  // If we have a user but no profile, something is wrong - show loading while we handle it
  if (user && !profile) {
    console.log("User found but no profile, handling...");
    return <AdminLoading />;
  }

  // Fallback loading state
  console.log("Fallback loading state...");
  return <AdminLoading />;
}
