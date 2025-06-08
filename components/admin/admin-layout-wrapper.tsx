"use client";

import type React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHeader from "@/components/admin/header";
import AdminFooter from "@/components/admin/footer";
import { useAuth } from "@/components/admin/auth-context";
import { usePathname } from "next/navigation";
import AdminLoading from "@/app/admin/loading";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}

export default function AdminLayoutWrapper({
  children,
}: AdminLayoutWrapperProps) {
  const { isLoading, isInitialized } = useAuth();
  const pathname = usePathname();

  // Show loading state while auth is initializing
  if (!isInitialized || (isLoading && pathname !== "/admin/login")) {
    return <AdminLoading />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-slate-50 flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Header */}
          <AdminHeader />

          {/* Main Content */}
          <main className="flex-1 w-full overflow-auto">
            <div className="w-full h-full p-3 sm:p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>

          {/* Footer */}
          <AdminFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
