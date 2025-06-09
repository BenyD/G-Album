import { createClient } from "@/utils/supabase/client";
import { createClient as createServiceClient } from "@/utils/supabase/service-role";
import type {
  Album,
  AlbumImage,
  CreateAlbumData,
  UploadedImage,
} from "@/lib/types/albums";

export const STORAGE_BUCKET = "albums";

export async function uploadImage(
  file: File,
  path: string,
  retryCount = 3
): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${path}/${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      // Add a small delay between retries
      if (attempt > 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }

      console.log(
        `Attempting to upload ${fileName} (attempt ${attempt}/${retryCount})`
      );

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error(`Upload attempt ${attempt} failed:`, error);
        if (attempt === retryCount) throw error;
        continue;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);

      console.log(`Successfully uploaded ${fileName}`);
      return publicUrl;
    } catch (error) {
      console.error(`Error in attempt ${attempt}:`, error);
      if (attempt === retryCount) throw error;
    }
  }

  throw new Error(`Failed to upload ${file.name} after ${retryCount} attempts`);
}

export async function createAlbum(data: CreateAlbumData): Promise<Album> {
  const supabase = createClient();

  try {
    // First, check if the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Authentication required to create an album");
    }

    // Create the album
    const { data: album, error: albumError } = await supabase
      .from("albums")
      .insert({
        title: data.title,
        description: data.description,
        featured: data.featured,
        cover_image_url: data.cover_image_url,
        created_by: user.id,
      })
      .select()
      .single();

    if (albumError) {
      console.error("Error creating album:", albumError);
      throw albumError;
    }

    if (!album) {
      throw new Error("Failed to create album - no data returned");
    }

    // If we have images, create them
    if (data.images.length > 0) {
      const { error: imagesError } = await supabase.from("album_images").insert(
        data.images.map((image) => ({
          album_id: album.id,
          image_url: image.image_url,
          order_index: image.order_index,
        }))
      );

      if (imagesError) {
        // If image creation fails, delete the album to maintain consistency
        await supabase.from("albums").delete().eq("id", album.id);
        console.error("Error creating album images:", imagesError);
        throw imagesError;
      }
    }

    return album;
  } catch (error) {
    console.error("Error in createAlbum:", error);
    throw error;
  }
}

export async function getAlbums(): Promise<Album[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("albums")
    .select("*, images:album_images(id, image_url, order_index)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getFeaturedAlbums(): Promise<Album[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("albums")
    .select(
      `
      *,
      images:album_images (
        *
      )
    `
    )
    .eq("featured", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAlbumById(id: string): Promise<Album> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("albums")
    .select("*, images:album_images(id, image_url, order_index)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateAlbum(
  id: string,
  data: Partial<CreateAlbumData>
): Promise<Album> {
  const supabase = createClient();

  const { data: album, error } = await supabase
    .from("albums")
    .update({
      title: data.title,
      description: data.description,
      featured: data.featured,
      cover_image_url: data.cover_image_url,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  if (data.images && data.images.length > 0) {
    // Delete existing images
    const { error: deleteError } = await supabase
      .from("album_images")
      .delete()
      .eq("album_id", id);

    if (deleteError) throw deleteError;

    // Insert new images
    const { error: imagesError } = await supabase.from("album_images").insert(
      data.images.map((image) => ({
        album_id: id,
        image_url: image.image_url,
        order_index: image.order_index,
      }))
    );

    if (imagesError) throw imagesError;
  }

  return album;
}

export async function deleteAlbum(id: string): Promise<void> {
  const supabase = createClient();

  try {
    // First get all images for this album
    const { data: images, error: fetchError } = await supabase
      .from("album_images")
      .select("image_url")
      .eq("album_id", id);

    if (fetchError) {
      console.error("Error fetching album images:", fetchError);
      throw fetchError;
    }

    // Delete images from storage if we have any
    if (images && images.length > 0) {
      console.log("Found images to delete:", images.length);

      const filePaths = images
        .map((img) => {
          try {
            // Extract the path after the bucket name in the URL
            // Example: https://xxx.supabase.co/storage/v1/object/public/albums/my-album/123.jpg
            // We want: my-album/123.jpg
            const url = new URL(img.image_url);
            const pathParts = url.pathname.split("/");
            const bucketIndex = pathParts.indexOf("albums");
            if (bucketIndex === -1) {
              throw new Error(`Invalid image URL format: ${img.image_url}`);
            }
            return pathParts.slice(bucketIndex + 1).join("/");
          } catch (error) {
            console.error("Error parsing image URL:", error);
            return null;
          }
        })
        .filter((path): path is string => path !== null);

      if (filePaths.length > 0) {
        console.log("Attempting to delete files:", filePaths);
        const { error: storageError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(filePaths);

        if (storageError) {
          console.error("Error deleting files from storage:", storageError);
          throw storageError;
        }
        console.log("Successfully deleted files from storage");
      }
    }

    // Delete album record (this will cascade delete album_images due to FK constraint)
    const { error: deleteError } = await supabase
      .from("albums")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting album record:", deleteError);
      throw deleteError;
    }

    console.log("Successfully deleted album and all associated data");
  } catch (error) {
    console.error("Error in deleteAlbum:", error);
    throw error;
  }
}

export async function deleteImage(url: string): Promise<void> {
  // Extract the path from the URL
  const path = url.split("/").slice(-2).join("/");

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

  if (error) throw error;
}
