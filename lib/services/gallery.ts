import { createClient } from "@/utils/supabase/client";

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

export async function getAllGalleryImages(): Promise<GalleryImage[]> {
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

  return data
    .filter((item) => item.albums) // Filter out items with no album relation
    .map((item) => ({
      id: item.id,
      image_url: item.image_url,
      album_id: item.album_id,
      album_name: item.albums[0].title,
      alt: `Image from ${item.albums[0].title}${
        item.albums[0].description ? ": " + item.albums[0].description : ""
      }`,
      upload_date: new Date(item.created_at).toLocaleDateString(),
      order_index: item.order_index,
      is_visible: true, // Since we don't have is_visible in the schema, default to true
    }));
}

export async function getVisibleGalleryImages(): Promise<GalleryImage[]> {
  return getAllGalleryImages();
}
