import type { Metadata } from "next";
import { getAlbumById } from "@/lib/services/albums";

export async function generateMetadata({
  params,
}: {
  params: { albumId: string };
}): Promise<Metadata> {
  const album = await getAlbumById(params.albumId);

  return {
    title: `${album.title} - G Album`,
    description: album.description || "A beautiful collection of memories",
    openGraph: {
      title: album.title,
      description: album.description || "A beautiful collection of memories",
      images: [
        {
          url: `/api/og-image?title=${encodeURIComponent(album.title)}&subtitle=${encodeURIComponent(album.description || "A beautiful collection of memories")}`,
          width: 1200,
          height: 630,
          alt: album.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: album.title,
      description: album.description || "A beautiful collection of memories",
      images: [
        `/api/og-image?title=${encodeURIComponent(album.title)}&subtitle=${encodeURIComponent(album.description || "A beautiful collection of memories")}`,
      ],
    },
  };
}
