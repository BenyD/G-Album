import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function logActivity(
  action: string,
  details?: Record<string, unknown> | string
) {
  const supabase = createClient();
  const { error } = await supabase.rpc("log_activity", {
    action,
    details: details ?? null,
  });
  if (error) {
    console.error("Failed to log global activity:", error);
  }
}
