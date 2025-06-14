import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";
import { CookieOptions } from "@supabase/ssr";

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    cookies: {
      async get(name: string) {
        const cookie = cookieStore.get(name);
        return cookie?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        cookieStore.set(name, value, options);
      },
      async remove(name: string, options: CookieOptions) {
        cookieStore.set(name, "", { ...options, maxAge: 0 });
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
