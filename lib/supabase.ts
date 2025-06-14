import { Database } from "@/lib/database.types";

export type AdminProfile =
  Database["public"]["Tables"]["admin_profiles"]["Row"] & {
    role?: {
      id: string;
      name: string;
      description: string | null;
      role_permissions: {
        permission: {
          id: string;
          name: string;
          description: string | null;
        };
      }[];
    };
  };
export type Role = Database["public"]["Tables"]["roles"]["Row"];
export type Permission = Database["public"]["Tables"]["permissions"]["Row"];
