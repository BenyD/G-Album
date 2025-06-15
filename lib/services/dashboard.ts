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
  totalCustomers: number;
  totalAdmins: number;
  storageUsage: {
    used: number;
    total: number;
  };
  albumStats: {
    totalAlbums: number;
    totalImages: number;
    averageImagesPerAlbum: number;
  };
  recentOrders: {
    id: string;
    order_number: string;
    customer_name: string;
    status: string;
    total_amount: number;
    created_at: string;
  }[];
  recentCustomers: {
    id: string;
    studio_name: string;
    email: string;
    phone: string;
    total_orders: number;
    total_spent: number;
    created_at: string;
  }[];
  recentSubmissions: {
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
  try {
    // Get total albums
    const { count: totalAlbums } = await supabase
      .from("albums")
      .select("*", { count: "exact", head: true });

    // Get total gallery images
    const { count: totalGalleryImages } = await supabase
      .from("gallery_images")
      .select("*", { count: "exact", head: true });

    // Get total active newsletter subscribers
    const { count: totalNewsletterSubscribers } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Get total new form submissions
    const { count: totalFormSubmissions } = await supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "New");

    // Get total active orders (non-delivered)
    const { count: totalOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .neq("status", "delivered");

    // Get total active customers
    const { count: totalCustomers } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Get total approved admins
    const { count: totalAdmins } = await supabase
      .from("admin_profiles")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    // Get recent orders with customer details
    const { data: recentOrders } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        status,
        total_amount,
        created_at,
        customers (
          studio_name
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(5);

    // Get recent active customers
    const { data: recentCustomers } = await supabase
      .from("customers")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(5);

    // Get recent form submissions
    const { data: recentSubmissions } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    // Get album statistics
    const { data: albumImages } = await supabase
      .from("albums")
      .select("id, images:album_images(count)");

    const totalAlbumImages =
      albumImages?.reduce(
        (sum, album) => sum + (album.images?.[0]?.count || 0),
        0
      ) || 0;
    const averageImagesPerAlbum = totalAlbums
      ? Math.round((totalAlbumImages / totalAlbums) * 10) / 10
      : 0;

    // Default storage values
    const STORAGE_TOTAL = 1073741824; // 1GB in bytes
    const DEFAULT_STORAGE_USED = 0;

    return {
      totalAlbums: totalAlbums || 0,
      totalGalleryImages: totalGalleryImages || 0,
      totalNewsletterSubscribers: totalNewsletterSubscribers || 0,
      totalFormSubmissions: totalFormSubmissions || 0,
      totalOrders: totalOrders || 0,
      totalCustomers: totalCustomers || 0,
      totalAdmins: totalAdmins || 0,
      storageUsage: {
        used: DEFAULT_STORAGE_USED,
        total: STORAGE_TOTAL,
      },
      albumStats: {
        totalAlbums: totalAlbums || 0,
        totalImages: totalAlbumImages + (totalGalleryImages || 0),
        averageImagesPerAlbum,
      },
      recentOrders:
        recentOrders?.map((order) => ({
          id: order.id,
          order_number: order.order_number,
          customer_name: order.customers?.studio_name || "Unknown",
          status: order.status,
          total_amount: order.total_amount,
          created_at: order.created_at,
        })) || [],
      recentCustomers:
        recentCustomers?.map((customer) => ({
          id: customer.id,
          studio_name: customer.studio_name,
          email: customer.email,
          phone: customer.phone,
          total_orders: customer.total_orders,
          total_spent: customer.total_spent,
          created_at: customer.created_at,
        })) || [],
      recentSubmissions:
        recentSubmissions?.map((submission) => ({
          id: submission.id,
          name: submission.name,
          email: submission.email || "",
          phone: submission.phone,
          message: submission.message,
          status: submission.status,
          created_at: submission.created_at,
        })) || [],
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
