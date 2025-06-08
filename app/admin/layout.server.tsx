import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@/utils/supabase/service-role";
import { cookies } from "next/headers";

export async function loadUserProfile(userId: string) {
  const serviceClient = createServiceClient();

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
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error loading profile with service client:", profileError);
      return null;
    }

    return profileData;
  } catch (error) {
    console.error("Error in loadUserProfile:", error);
    return null;
  }
}
