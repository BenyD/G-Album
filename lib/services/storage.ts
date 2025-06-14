import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STORAGE_LIMIT = 1024 * 1024 * 1024; // 1GB in bytes

export interface StorageStats {
  totalSize: number;
  fileCount: number;
  breakdown: {
    [key: string]: {
      size: number;
      count: number;
    };
  };
}

export async function getStorageStats(): Promise<StorageStats> {
  const { data: albumFiles, error: albumError } = await supabase.storage
    .from("albums")
    .list();

  const { data: profileFiles, error: profileError } = await supabase.storage
    .from("profiles")
    .list();

  if (albumError || profileError) {
    console.error("Error fetching storage stats:", {
      albumError,
      profileError,
    });
    throw albumError || profileError;
  }

  const stats: StorageStats = {
    totalSize: 0,
    fileCount: 0,
    breakdown: {
      "Album Images": { size: 0, count: 0 },
      "Profile Pictures": { size: 0, count: 0 },
    },
  };

  // Process album files
  for (const file of albumFiles || []) {
    const size = file.metadata?.size || 0;
    stats.totalSize += size;
    stats.fileCount += 1;
    stats.breakdown["Album Images"].size += size;
    stats.breakdown["Album Images"].count += 1;
  }

  // Process profile files
  for (const file of profileFiles || []) {
    const size = file.metadata?.size || 0;
    stats.totalSize += size;
    stats.fileCount += 1;
    stats.breakdown["Profile Pictures"].size += size;
    stats.breakdown["Profile Pictures"].count += 1;
  }

  return stats;
}

export async function updateStorageBreakdown() {
  const stats = await getStorageStats();

  // Update storage breakdown in the database
  for (const [category, data] of Object.entries(stats.breakdown)) {
    const percentage = (data.size / STORAGE_LIMIT) * 100;
    const sizeInGB = data.size / (1024 * 1024 * 1024); // Convert bytes to GB

    await supabase.from("storage_breakdown").upsert(
      {
        category,
        size: sizeInGB,
        percentage,
      },
      {
        onConflict: "category",
      }
    );
  }

  // Delete any old categories that are no longer used
  await supabase
    .from("storage_breakdown")
    .delete()
    .not("category", "in", Object.keys(stats.breakdown));
}

export async function updateUsageHistory() {
  const stats = await getStorageStats();
  const currentMonth = new Date().toLocaleString("default", { month: "short" });
  const totalSizeInGB = stats.totalSize / (1024 * 1024 * 1024); // Convert bytes to GB

  // Get current user count
  const { count: userCount } = await supabase
    .from("admin_profiles")
    .select("*", { count: "exact", head: true });

  // Estimate bandwidth usage (this would need to be tracked separately in a real implementation)
  const bandwidthUsage = totalSizeInGB * 1.5; // Rough estimate based on storage usage

  await supabase.from("usage_history").upsert(
    {
      month: currentMonth,
      storage: totalSizeInGB,
      bandwidth: bandwidthUsage,
      users: userCount || 0,
    },
    {
      onConflict: "month",
    }
  );
}
