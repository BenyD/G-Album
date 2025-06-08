"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createServiceClient } from "@/utils/supabase/service-role";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type UserWithProfile = {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    id: string;
    full_name: string | null;
    role_id: string | null;
    status: "pending" | "approved" | "suspended";
    role?: {
      id: string;
      name: string;
      description: string;
    } | null;
  } | null;
};

export async function getUsers() {
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  try {
    // Get all users from auth.users using service role client
    const { data: users, error: usersError } =
      await serviceClient.auth.admin.listUsers();
    if (usersError) throw usersError;

    // Get all admin profiles with their roles using service client
    const { data: profiles, error: profilesError } = await serviceClient
      .from("admin_profiles")
      .select("*, role:roles(id, name, description)");

    if (profilesError) throw profilesError;

    // Combine users with their profiles
    const usersWithProfiles: UserWithProfile[] = users.users.map((user) => {
      const profile = profiles?.find((p) => p.id === user.id);
      return {
        id: user.id,
        email: user.email!,
        created_at: user.created_at,
        profile: profile || null,
      };
    });

    return usersWithProfiles;
  } catch (error) {
    console.error("Error in getUsers:", error);
    throw error;
  }
}

export async function getRoles() {
  const supabase = await createClient();

  try {
    const { data: roles, error } = await supabase
      .from("roles")
      .select("*")
      .order("name");

    if (error) throw error;
    return roles;
  } catch (error) {
    console.error("Error in getRoles:", error);
    throw error;
  }
}

export async function assignRole(userId: string, roleId: string) {
  const serviceClient = createServiceClient();

  try {
    // Check if profile exists
    const { data: existingProfile } = await serviceClient
      .from("admin_profiles")
      .select()
      .eq("id", userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { error } = await serviceClient
        .from("admin_profiles")
        .update({
          role_id: roleId,
          status: "approved",
          approved_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
    } else {
      // Create new profile
      const { error } = await serviceClient.from("admin_profiles").insert({
        id: userId,
        role_id: roleId,
        status: "approved",
        approved_at: new Date().toISOString(),
      });

      if (error) throw error;
    }

    revalidatePath("/admin/settings/users");
    return { success: true };
  } catch (error) {
    console.error("Error in assignRole:", error);
    throw error;
  }
}

export async function updateUserStatus(
  userId: string,
  status: "approved" | "suspended"
) {
  const serviceClient = createServiceClient();

  try {
    const { error } = await serviceClient
      .from("admin_profiles")
      .update({
        status,
        ...(status === "approved"
          ? { approved_at: new Date().toISOString() }
          : {}),
      })
      .eq("id", userId);

    if (error) throw error;

    // If suspending, also disable the user in Auth
    if (status === "suspended") {
      await serviceClient.auth.admin.updateUserById(userId, {
        ban_duration: "none",
      });
    } else {
      // If approving, ensure the user is not banned
      await serviceClient.auth.admin.updateUserById(userId, {
        ban_duration: null,
      });
    }

    revalidatePath("/admin/settings/users");
    return { success: true };
  } catch (error) {
    console.error("Error in updateUserStatus:", error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  data: { full_name?: string }
) {
  const serviceClient = createServiceClient();

  try {
    const { error } = await serviceClient
      .from("admin_profiles")
      .update(data)
      .eq("id", userId);

    if (error) throw error;

    revalidatePath("/admin/settings/users");
    return { success: true };
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
}
