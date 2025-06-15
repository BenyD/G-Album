import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STORAGE_LIMIT = 1024 * 1024 * 1024; // 1GB in bytes

interface StorageStats {
  totalSize: number;
  fileCount: number;
  breakdown: {
    [key: string]: {
      size: number;
      count: number;
    };
  };
}

// Constants for storage limits
const STORAGE_TOTAL = 1073741824; // 1GB in bytes
const DEFAULT_STORAGE_USED = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cache for storage stats with a promise to prevent multiple simultaneous fetches
let storageStatsCache: {
  stats: StorageStats;
  timestamp: number;
  promise: Promise<StorageStats> | null;
} = {
  stats: {
    totalSize: 0,
    fileCount: 0,
    breakdown: {
      "Album Images": { size: 0, count: 0 },
      "Profile Pictures": { size: 0, count: 0 },
    },
  },
  timestamp: 0,
  promise: null,
};

async function listFilesRecursively(
  bucket: string,
  path: string = ""
): Promise<{ name: string; size: number }[]> {
  const supabase = createClient();
  const files: { name: string; size: number }[] = [];
  let offset = 0;
  const limit = 100;

  try {
    // First check if we have a valid session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("No valid session found:", sessionError);
      return [];
    }

    while (true) {
      const { data, error } = await supabase.storage.from(bucket).list(path, {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

      if (error) {
        console.error(`Error listing files in ${bucket}/${path}:`, error);
        break;
      }

      if (!data || data.length === 0) {
        break;
      }

      for (const item of data) {
        if (item.metadata?.size) {
          // It's a file
          files.push({
            name: path ? `${path}/${item.name}` : item.name,
            size: item.metadata.size,
          });
        } else if (item.name) {
          // It's a folder, recursively list its contents
          try {
            const subFiles = await listFilesRecursively(
              bucket,
              path ? `${path}/${item.name}` : item.name
            );
            files.push(...subFiles);
          } catch (subError) {
            console.error(`Error listing subdirectory ${item.name}:`, subError);
            continue;
          }
        }
      }

      if (data.length < limit) {
        break;
      }

      offset += limit;
    }

    return files;
  } catch (error) {
    console.error(
      `Error in listFilesRecursively for ${bucket}/${path}:`,
      error
    );
    return [];
  }
}

async function fetchStorageStats(): Promise<StorageStats> {
  const supabase = createClient();
  const stats: StorageStats = {
    totalSize: 0,
    fileCount: 0,
    breakdown: {
      "Album Images": { size: 0, count: 0 },
      "Profile Pictures": { size: 0, count: 0 },
    },
  };

  try {
    // Check authentication first
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error("No valid session found:", sessionError);
      return stats;
    }

    // Get all files recursively from albums bucket
    console.log("Fetching album files...");
    const albumFiles = await listFilesRecursively("albums");
    console.log(`Found ${albumFiles.length} album files`);

    for (const file of albumFiles) {
      stats.totalSize += file.size;
      stats.fileCount += 1;
      stats.breakdown["Album Images"].size += file.size;
      stats.breakdown["Album Images"].count += 1;
    }

    // Get all files recursively from avatars bucket
    console.log("Fetching avatar files...");
    const avatarFiles = await listFilesRecursively("avatars");
    console.log(`Found ${avatarFiles.length} avatar files`);

    for (const file of avatarFiles) {
      stats.totalSize += file.size;
      stats.fileCount += 1;
      stats.breakdown["Profile Pictures"].size += file.size;
      stats.breakdown["Profile Pictures"].count += 1;
    }

    return stats;
  } catch (error) {
    console.error("Error fetching storage stats:", error);
    return stats;
  }
}

export async function getStorageStats(
  forceRefresh = false
): Promise<StorageStats> {
  const now = Date.now();

  // If we have a valid cache and not forcing refresh, return cached data
  if (
    !forceRefresh &&
    storageStatsCache.timestamp &&
    now - storageStatsCache.timestamp < CACHE_DURATION
  ) {
    return storageStatsCache.stats;
  }

  // If there's an ongoing fetch, return its promise
  if (storageStatsCache.promise) {
    return storageStatsCache.promise;
  }

  // Start a new fetch
  storageStatsCache.promise = fetchStorageStats()
    .then((stats) => {
      storageStatsCache = {
        stats,
        timestamp: now,
        promise: null,
      };
      return stats;
    })
    .catch((error) => {
      storageStatsCache.promise = null;
      throw error;
    });

  return storageStatsCache.promise;
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
