"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, Star, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAlbumById } from "@/lib/services/albums";
import type { Album } from "@/lib/types/albums";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import Masonry from "react-masonry-css";
import PageHero from "@/components/page-hero";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const breakpointColumns = {
  default: 4,
  1536: 3,
  1280: 3,
  1024: 2,
  768: 2,
  640: 1,
};

const AlbumPage = () => {
  const { albumId } = useParams();
  const [album, setAlbum] = useState<Album | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>("");

  const handleImageClick = useCallback((imageUrl: string) => {
    setCurrentImage(imageUrl);
    setIsImageModalOpen(true);
  }, []);

  useEffect(() => {
    const fetchAlbum = async () => {
      if (typeof albumId === "string") {
        const data = await getAlbumById(albumId);
        setAlbum(data);
      }
    };
    fetchAlbum();
  }, [albumId]);

  if (!album) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-red-50/30 to-white pt-16">
        <PageHero
          title={album.title}
          subtitle={album.description || "A beautiful collection of memories"}
          className="py-20"
        />
        <div className="container mx-auto px-4 py-8">
          <motion.div initial="initial" animate="animate" className="space-y-8">
            {/* Header */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center justify-between"
            >
              <Button variant="ghost" asChild className="hover:text-red-600">
                <Link href="/albums">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Albums
                </Link>
              </Button>

              <div className="flex items-center gap-3">
                {album.featured && (
                  <Badge className="bg-red-600/90 backdrop-blur-sm text-white shadow-lg">
                    <Star className="w-3.5 h-3.5 mr-1" />
                    Featured Album
                  </Badge>
                )}
                <Badge variant="secondary" className="text-base py-1.5 px-3">
                  {album.images?.length || 0} photos
                </Badge>
              </div>
            </motion.div>

            {/* Masonry Grid */}
            <motion.div variants={fadeInUp}>
              <Masonry
                breakpointCols={breakpointColumns}
                className="flex -ml-4 w-auto"
                columnClassName="pl-4 bg-clip-padding"
              >
                {album.images?.map((image, index) => (
                  <div
                    key={image.id}
                    className="mb-4 relative group cursor-zoom-in"
                    onClick={() => handleImageClick(image.image_url)}
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                      <Image
                        src={image.image_url}
                        alt={`Album image ${index + 1}`}
                        width={800}
                        height={1200}
                        className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </Masonry>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-screen-lg w-full p-0 overflow-hidden">
          <DialogHeader className="absolute top-2 right-2 z-50">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-black/20 hover:bg-black/40 text-white"
              onClick={() => setIsImageModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={currentImage}
              alt="Full size preview"
              fill
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlbumPage;
