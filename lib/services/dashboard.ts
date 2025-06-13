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
}

export interface UsageHistory {
  month: string;
  storage: number;
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
    storageStats,
    { data: userStats },
    { data: dbStats },
  ] = await Promise.all([
    supabase.from("albums").select("*", { count: "exact", head: true }),
    supabase.from("gallery_images").select("*", { count: "exact", head: true }),
    supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("form_submissions")
      .select("*", { count: "exact", head: true }),
    getStorageStats(),
    supabase.from("admin_profiles").select("*"),
    supabase.rpc("get_database_stats"),
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
  };
}

export async function getUsageHistory(): Promise<UsageHistory[]> {
  const { data: history } = await supabase
    .from("usage_history")
    .select("*")
    .order("month", { ascending: true })
    .limit(5);

  return history || [];
}

export async function getStorageBreakdown(): Promise<StorageBreakdown[]> {
  const { data: breakdown } = await supabase
    .from("storage_breakdown")
    .select("*")
    .order("size", { ascending: false });

  return breakdown || [];
}
