import { createClient as createServiceClient } from "@/utils/supabase/service-role";
import { Database } from "@/lib/database.types";

type AdminProfile = Database["public"]["Tables"]["admin_profiles"]["Row"] & {
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

export async function loadUserProfile(userId: string) {
  const serviceClient = await createServiceClient();

  try {
    const { data: profileData, error: profileError } = await serviceClient
      .from("admin_profiles")
      .select(
        `
        *,
        role:roles (
          id,
          name,
          description,
          role_permissions (
            permission:permissions (
              id,
              name,
              description
            )
          )
        )
      `
      )
      .eq("id", userId as AdminProfile["id"])
      .single();

    if (profileError) {
      console.error("Error loading profile with service client:", profileError);
      return null;
    }

    return profileData as AdminProfile;
  } catch (error) {
    console.error("Error in loadUserProfile:", error);
    return null;
  }
}
