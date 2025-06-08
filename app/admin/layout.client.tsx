"use client";

import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <div className="min-h-screen">
      <Toaster richColors position="top-right" />
      {children}
    </div>
  );
}
 