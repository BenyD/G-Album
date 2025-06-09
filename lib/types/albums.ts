export interface Album {
  id: string;
  title: string;
  description: string | null;
  featured: boolean;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  images?: AlbumImage[];
}

export interface AlbumImage {
  id: string;
  album_id: string;
  image_url: string;
  order_index: number;
  created_at: string;
}

export interface CreateAlbumData {
  title: string;
  description: string;
  featured: boolean;
  cover_image_url: string;
  images: {
    image_url: string;
    order_index: number;
  }[];
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  order_index: number;
}
