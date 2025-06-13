import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";
import { getStorageStats } from "./storage";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface DashboardStats {
  totalAlbums: number;
  totalGalleryImages: number;
  totalNewsletterSubscribers: number;
  totalFormSubmissions: number;
  totalOrders: number;
  storageUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  databaseUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  userStats: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  storageBreakdown: {
    category: string;
    size: number;
    percentage: number;
  }[];
  recentOrders: {
    id: string;
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }[];
  recentCustomers: {
    id: string;
    studio_name: string;
    contact_name: string;
    email: string;
    status: string;
    created_at: string;
  }[];
  recentFormSubmissions: {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    status: string;
    created_at: string;
  }[];
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
  const [
    { count: albumsCount },
    { count: galleryImagesCount },
    { count: newsletterCount },
    { count: formSubmissionsCount },
    { count: ordersCount },
    storageStats,
    { data: userStats },
    { data: dbStats },
    { data: recentOrders },
    { data: recentCustomers },
    { data: recentFormSubmissions },
  ] = await Promise.all([
    supabase.from("albums").select("*", { count: "exact", head: true }),
    supabase.from("gallery_images").select("*", { count: "exact", head: true }),
    supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    getStorageStats(),
    supabase.from("admin_profiles").select("*"),
    supabase.rpc("get_database_stats"),
    supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        total_amount,
        status,
        created_at,
        customers (
          studio_name
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // Calculate storage usage
  const storageUsed = storageStats.totalSize;
  const storageTotal = 1024 * 1024 * 1024; // 1GB in bytes
  const storagePercentage = (storageUsed / storageTotal) * 100;

  // Calculate storage breakdown
  const storageBreakdown = Object.entries(storageStats.breakdown).map(
    ([category, stats]) => ({
      category,
      size: stats.size / (1024 * 1024 * 1024), // Convert to GB
      percentage: (stats.size / storageTotal) * 100,
    })
  );

  // Calculate database usage
  const dbUsed = dbStats?.total_size || 0;
  const dbTotal = 500 * 1024 * 1024; // 500MB in bytes
  const dbPercentage = (dbUsed / dbTotal) * 100;

  // Calculate user stats
  const totalUsers = userStats?.length || 0;
  const activeUsers =
    userStats?.filter((user) => user.status === "approved").length || 0;
  const newUsersThisMonth =
    userStats?.filter((user) => {
      const createdAt = new Date(user.created_at);
      const now = new Date();
      return (
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getFullYear() === now.getFullYear()
      );
    }).length || 0;

  return {
    totalAlbums: albumsCount || 0,
    totalGalleryImages: galleryImagesCount || 0,
    totalNewsletterSubscribers: newsletterCount || 0,
    totalFormSubmissions: formSubmissionsCount || 0,
    totalOrders: ordersCount || 0,
    storageUsage: {
      used: storageUsed / (1024 * 1024 * 1024), // Convert to GB
      total: 1, // 1GB
      percentage: storagePercentage,
    },
    databaseUsage: {
      used: dbUsed / (1024 * 1024), // Convert to MB
      total: 500, // 500MB
      percentage: dbPercentage,
    },
    userStats: {
      total: totalUsers,
      active: activeUsers,
      newThisMonth: newUsersThisMonth,
    },
    storageBreakdown,
    recentOrders: (recentOrders || []).map((order) => ({
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customers?.studio_name || "Unknown",
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
    })),
    recentCustomers: (recentCustomers || []).map((customer) => ({
      id: customer.id,
      studio_name: customer.studio_name,
      contact_name: customer.reference_name || "N/A",
      email: customer.email,
      status: customer.is_active ? "active" : "inactive",
      created_at: customer.created_at,
    })),
    recentFormSubmissions: (recentFormSubmissions || []).map((submission) => ({
      id: submission.id,
      name: submission.name,
      email: submission.email,
      phone: submission.phone,
      message: submission.message,
      status: submission.status,
      created_at: submission.created_at,
    })),
  };
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
