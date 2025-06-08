"use client";

import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { useAuth } from "@/components/admin/auth-context";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isInitialized } = useAuth();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (!user && !isLoginPage) {
        console.log("No user found, redirecting to login...");
        router.push("/admin/login");
      } else if (user && isLoginPage) {
        console.log("User already logged in, redirecting to dashboard...");
        router.push("/admin/dashboard");
      }
    }
  }, [user, isLoading, isInitialized, isLoginPage, router]);

  // Show loading state while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-right" />
      <main className={!isLoginPage ? "p-4 sm:p-6 md:p-8" : ""}>
        {children}
      </main>
    </div>
  );
}
