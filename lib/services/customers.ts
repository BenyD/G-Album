import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Customer {
  id: string;
  studio_name: string;
  email: string;
  phone: string;
  address: string;
  reference_phone: string | null;
  reference_name: string | null;
  is_active: boolean;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export async function getRecentCustomers(
  limit: number = 5
): Promise<Customer[]> {
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent customers:", error);
    throw error;
  }

  return customers;
}

export async function getCustomerStats() {
  const { count: totalCustomers, error: countError } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error fetching customer stats:", countError);
    throw countError;
  }

  const { data: recentCustomers, error: recentError } = await supabase
    .from("customers")
    .select("created_at")
    .gte(
      "created_at",
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    )
    .order("created_at", { ascending: false });

  if (recentError) {
    console.error("Error fetching recent customers:", recentError);
    throw recentError;
  }

  return {
    total: totalCustomers || 0,
    newThisMonth: recentCustomers?.length || 0,
  };
}
