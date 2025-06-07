import { Database } from "@/types/supabase";

export type AdminProfile =
  Database["public"]["Tables"]["admin_profiles"]["Row"];
export type Role = Database["public"]["Tables"]["roles"]["Row"];
export type Permission = Database["public"]["Tables"]["permissions"]["Row"];
