import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";
import type { OrderStatus } from "@/lib/types/order";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface OrderSummary {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  total_amount: number;
  amount_paid: number;
  balance_amount: number;
  created_at: string;
}

interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  totalPending: number;
  totalAdmins: number;
  revenueGrowth: {
    percentage: number;
    previousRevenue: number;
  };
  storageUsage: {
    used: number;
    total: number;
  };
  albumStats: {
    totalAlbums: number;
    totalImages: number;
  };
  recentActivity: {
    orders: OrderSummary[];
    submissions: Array<{
      id: string;
      name: string;
      email: string;
      phone: string;
      message: string;
      status: string;
      created_at: string;
    }>;
    albumImages: Array<{
      id: string;
      images: Array<{ count: number }>;
    }>;
  };
}

export interface UsageHistory {
  month: Date;
  storage_size: number;
  database_size: number;
  users: number;
}

export interface StorageBreakdown {
  category: string;
  size: number;
  percentage: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get current month's revenue
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const { data: currentMonthOrders, error: currentMonthError } =
      await supabase
        .from("order_summary")
        .select("total_amount, amount_paid, created_at")
        .gte("created_at", firstDayOfMonth.toISOString())
        .lte("created_at", lastDayOfMonth.toISOString());

    if (currentMonthError) throw currentMonthError;

    // Get previous month's revenue
    const firstDayOfPrevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const lastDayOfPrevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );

    const { data: prevMonthOrders, error: prevMonthError } = await supabase
      .from("order_summary")
      .select("total_amount, amount_paid")
      .gte("created_at", firstDayOfPrevMonth.toISOString())
      .lte("created_at", lastDayOfPrevMonth.toISOString());

    if (prevMonthError) throw prevMonthError;

    const currentMonthRevenue =
      currentMonthOrders?.reduce(
        (sum, order) => sum + (order.amount_paid || 0),
        0
      ) || 0;

    const prevMonthRevenue =
      prevMonthOrders?.reduce(
        (sum, order) => sum + (order.amount_paid || 0),
        0
      ) || 0;

    const revenueGrowth = {
      percentage:
        prevMonthRevenue === 0
          ? 100
          : ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100,
      previousRevenue: prevMonthRevenue,
    };

    // Get total orders and revenue
    const { data: orderStats, error: orderError } = await supabase
      .from("order_summary")
      .select("total_amount, amount_paid, status");

    if (orderError) throw orderError;

    const totalRevenue = orderStats?.reduce(
      (sum, order) => sum + (order.amount_paid || 0),
      0
    );
    const totalPending = orderStats?.reduce(
      (sum, order) =>
        sum + ((order.total_amount || 0) - (order.amount_paid || 0)),
      0
    );

    // Get total customers
    const { count: totalCustomers, error: customerError } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    if (customerError) throw customerError;

    // Get total orders
    const { count: totalOrders, error: totalOrderError } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true });

    if (totalOrderError) throw totalOrderError;

    // Get total admins
    const { count: totalAdmins, error: adminError } = await supabase
      .from("admin_profiles")
      .select("*", { count: "exact", head: true });

    if (adminError) throw adminError;

    // Get storage usage
    let storageData;
    const { data: initialStorageData, error: storageError } =
      await supabase.rpc("get_storage_usage");
    if (storageError) {
      console.error("Storage usage error:", storageError);
      // Use a safe default instead of throwing
      storageData = { used: 0, total: 1 * 1024 * 1024 * 1024 }; // 1GB default for free tier
    } else {
      storageData = initialStorageData;
    }

    // Get recent data with error handling
    const [
      { data: recentOrders, error: ordersError },
      { data: recentSubmissions, error: submissionsError },
      { data: albumImages, error: albumError },
    ] = await Promise.all([
      // Get recent orders from order_summary view
      supabase
        .from("order_summary")
        .select(
          `
          id,
          order_number,
          customer_name,
          customer_email,
          status,
          total_amount,
          amount_paid,
          balance_amount,
          created_at
        `
        )
        .order("created_at", { ascending: false })
        .limit(5),

      // Get recent contact submissions
      supabase
        .from("contact_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),

      // Get album images
      supabase
        .from("albums")
        .select("id, images:album_images(count)")
        .order("created_at", { ascending: false }),
    ]);

    // Check for errors
    if (ordersError) {
      console.error("Error fetching recent orders:", ordersError);
      throw ordersError;
    }
    if (submissionsError) {
      console.error("Error fetching recent submissions:", submissionsError);
      throw submissionsError;
    }
    if (albumError) {
      console.error("Error fetching album images:", albumError);
      throw albumError;
    }

    return {
      totalOrders: totalOrders || 0,
      totalCustomers: totalCustomers || 0,
      totalRevenue: totalRevenue || 0,
      totalPending: totalPending || 0,
      totalAdmins: totalAdmins || 0,
      revenueGrowth,
      storageUsage: {
        used: storageData.used ?? 0,
        total: storageData.total ?? 1 * 1024 * 1024 * 1024, // 1GB default for free tier
      },
      albumStats: {
        totalAlbums: albumImages?.length || 0,
        totalImages:
          albumImages?.reduce(
            (sum, album) => sum + (album.images?.[0]?.count || 0),
            0
          ) || 0,
      },
      recentActivity: {
        orders: (recentOrders || []) as OrderSummary[],
        submissions: recentSubmissions || [],
        albumImages: albumImages || [],
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

export async function getUsageHistory(): Promise<UsageHistory[]> {
  const { data: history } = await supabase
    .from("usage_history")
    .select("*")
    .order("month", { ascending: false })
    .limit(12); // Get last 12 months

  return (history || []).map((record) => ({
    ...record,
    month: new Date(record.month),
  }));
}

export async function getStorageBreakdown(): Promise<StorageBreakdown[]> {
  const { data: breakdown } = await supabase
    .from("storage_breakdown")
    .select("*")
    .order("size", { ascending: false });

  return (breakdown || []).map((record) => ({
    ...record,
    size: record.size / (1024 * 1024 * 1024), // Convert to GB
    percentage: Number(record.percentage),
  }));
}

// Add real-time subscription helper
export function subscribeToUpdates(
  callback: (update: Partial<DashboardStats>) => void
) {
  const subscriptions = [
    supabase
      .channel("orders_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => getDashboardStats().then(callback)
      )
      .subscribe(),

    supabase
      .channel("submissions_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_submissions" },
        () => getDashboardStats().then(callback)
      )
      .subscribe(),
  ];

  return () => {
    subscriptions.forEach((subscription) => subscription.unsubscribe());
  };
}
