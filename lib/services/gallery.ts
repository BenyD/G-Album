import { createClient } from "@/utils/supabase/client";

interface Album {
  id: string;
  title: string;
  description: string | null;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  album_id: string;
  album_name: string;
  alt: string;
  upload_date: string;
  order_index: number;
  is_visible: boolean;
  isSelected?: boolean;
}

type SupabaseResponse = {
  id: string;
  image_url: string;
  album_id: string;
  order_index: number;
  created_at: string;
  albums: Album;
};

// Cache for gallery images
let galleryCache: GalleryImage[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getAllGalleryImages(): Promise<GalleryImage[]> {
  // Check cache first
  const now = Date.now();
  if (galleryCache && now - lastFetchTime < CACHE_DURATION) {
    return galleryCache;
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("album_images")
    .select(
      `
      id,
      image_url,
      album_id,
      order_index,
      created_at,
      albums (
        id,
        title,
        description
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching gallery images:", error);
    throw error;
  }

  if (!data) {
    return [];
  }

  const processedData = (data as unknown as SupabaseResponse[]).map((item) => ({
    id: item.id,
    image_url: item.image_url,
    album_id: item.album_id,
    album_name: item.albums?.title || "Unknown Album",
    alt: `Image from ${item.albums?.title || "Unknown Album"}${
      item.albums?.description ? ": " + item.albums.description : ""
    }`,
    upload_date: new Date(item.created_at).toLocaleDateString(),
    order_index: item.order_index,
    is_visible: true,
  }));

  // Update cache
  galleryCache = processedData;
  lastFetchTime = now;

  return processedData;
}

export async function getVisibleGalleryImages(): Promise<GalleryImage[]> {
  return getAllGalleryImages();
}
