"use client";

import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHeader from "@/components/admin/header";
import AdminFooter from "@/components/admin/footer";
import { useAuth } from "@/components/admin/auth-context";
import { usePathname } from "next/navigation";
import AdminLoading from "@/app/admin/loading";
import { useEffect } from "react";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({
  children,
}: AdminLayoutWrapperProps) {
  const { user, profile, isLoading, isInitialized } = useAuth();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // Debug logging
  useEffect(() => {
    console.log("Admin layout state:", {
      isInitialized,
      isLoading,
      hasUser: !!user,
      hasProfile: !!profile,
      pathname,
      isLoginPage,
    });
  }, [isInitialized, isLoading, user, profile, pathname, isLoginPage]);

  // Show loading state while auth is initializing
  if (!isInitialized) {
    return <AdminLoading />;
  }

  // For login page, render immediately after initialization
  if (isLoginPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  // For authenticated pages, show loading during auth loading
  if (isLoading) {
    return <AdminLoading />;
  }

  // If no user or profile, redirect will happen in auth context
  if (!user || !profile) {
    return <AdminLoading />;
  }

  // Render authenticated layout
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen w-full">
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 md:p-8 w-full max-w-[1920px] mx-auto">
            {children}
          </main>
          <AdminFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
