import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  status: "pending" | "in_progress" | "completed" | "delivered";
  total_amount: number;
  amount_paid: number;
  created_at: string;
}

export async function getRecentOrders(limit: number = 5): Promise<Order[]> {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      order_number,
      customer_id,
      customers (
        studio_name
      ),
      status,
      total_amount,
      amount_paid,
      created_at
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent orders:", error);
    throw error;
  }

  return orders.map((order) => ({
    ...order,
    customer_name: order.customers[0]?.studio_name || "Unknown Customer",
  }));
}

export async function getOrderStats() {
  const { count: totalOrders, error: countError } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Error fetching order stats:", countError);
    throw countError;
  }

  const { data: recentOrders, error: recentError } = await supabase
    .from("orders")
    .select("created_at")
    .gte(
      "created_at",
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    )
    .order("created_at", { ascending: false });

  if (recentError) {
    console.error("Error fetching recent orders:", recentError);
    throw recentError;
  }

  return {
    total: totalOrders || 0,
    newThisMonth: recentOrders?.length || 0,
  };
}
