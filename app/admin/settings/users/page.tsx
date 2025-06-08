import { Suspense } from "react";
import { getUsers, getRoles } from "./actions";
import { UserManagementClient } from "./client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default async function UserManagementPage() {
  // Fetch initial data on the server
  const [initialUsers, initialRoles] = await Promise.all([
    getUsers(),
    getRoles(),
  ]);

  return (
    <div className="space-y-4">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">User Management</AlertTitle>
        <AlertDescription className="text-blue-700">
          You can manage user roles and permissions here. New users from
          Supabase need to be assigned a role.
        </AlertDescription>
      </Alert>

      <Suspense fallback={<div>Loading...</div>}>
        <UserManagementClient
          initialUsers={initialUsers}
          initialRoles={initialRoles}
        />
      </Suspense>
    </div>
  );
}
