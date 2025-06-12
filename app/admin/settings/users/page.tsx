"use client";

import { Suspense } from "react";
import { UserManagementClient } from "./client";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

const supabase = createClient();

export default function UserManagementPage() {
  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-2xl font-bold text-red-900">User Management</h1>
        <p className="text-muted-foreground">
          Manage user roles, permissions, and access levels
        </p>
        <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        }
      >
        <UserManagementClient />
      </Suspense>
    </div>
  );
}
