"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAlbumById } from "@/lib/services/albums";
import type { Album } from "@/lib/types/albums";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function AlbumPage() {
  const { albumId } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadAlbum = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAlbumById(albumId as string);
      setAlbum(data);
      setSelectedImage(data.cover_image_url);
    } catch (error) {
      console.error("Error loading album:", error);
    } finally {
      setIsLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="aspect-video bg-gray-200 rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Album not found
            </h1>
            <p className="mt-2 text-gray-600">
              The album you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Button asChild className="mt-4">
              <Link href="/albums">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Albums
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial="initial" animate="animate" className="space-y-8">
          {/* Header */}
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-between"
          >
            <div>
              <Button variant="ghost" asChild className="mb-4">
                <Link href="/albums">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Albums
                </Link>
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">
                {album.title}
              </h1>
              {album.description && (
                <p className="mt-2 text-gray-600">{album.description}</p>
              )}
            </div>
            {album.featured && (
              <Badge variant="default" className="bg-red-600">
                <Star className="w-4 h-4 mr-2" />
                Featured Album
              </Badge>
            )}
          </motion.div>

          {/* Main Image */}
          <motion.div
            variants={fadeInUp}
            className="aspect-video relative rounded-lg overflow-hidden shadow-lg"
          >
            <Image
              src={selectedImage || album.cover_image_url || ""}
              alt={album.title}
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          {/* Thumbnail Grid */}
          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {album.images?.map((image) => (
              <div
                key={image.id}
                className={`aspect-square relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                  selectedImage === image.image_url
                    ? "ring-2 ring-red-600"
                    : "hover:opacity-80"
                }`}
                onClick={() => setSelectedImage(image.image_url)}
              >
                <Image
                  src={image.image_url}
                  alt={`${album.title} image`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
