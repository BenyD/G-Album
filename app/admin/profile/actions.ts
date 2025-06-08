"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(
  userId: string,
  data: {
    full_name?: string;
    avatar_url?: string;
  }
) {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("admin_profiles")
      .update(data)
      .eq("id", userId);

    if (error) throw error;

    revalidatePath("/admin/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

export async function uploadProfilePicture(userId: string, file: File) {
  const supabase = createClient();

  try {
    // Upload the file to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    // Update the user's profile with the new avatar URL
    const { error: updateError } = await supabase
      .from("admin_profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", userId);

    if (updateError) throw updateError;

    revalidatePath("/admin/profile");
    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
}
