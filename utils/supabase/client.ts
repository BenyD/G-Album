import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function logActivity(
  action: string,
  details?: Record<string, unknown> | string | null
) {
  const supabase = createClient();

  // Ensure details is never an empty object
  const processedDetails =
    details && Object.keys(details).length === 0 ? null : details;

  const { error } = await supabase.rpc("log_activity", {
    action,
    details: processedDetails,
  });
  if (error) {
    console.error("Failed to log global activity:", error);
  }
}
