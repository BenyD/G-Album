"use client";

import { useRole } from "@/components/admin/role-context";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Search,
  Info,
  Filter,
  Eye,
  Calendar,
  Image as ImageIcon,
  ImageOff,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import type { GalleryImage } from "@/lib/services/gallery";
import { getAllGalleryImages } from "@/lib/services/gallery";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function GalleryPage() {
  const router = useRouter();
  const { hasPermission } = useRole();
  const { toast } = useToast();

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState<string>("all");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load gallery images
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        const images = await getAllGalleryImages();
        setGalleryImages(images);
      } catch (error) {
        console.error("Error loading gallery images:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load gallery images",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, [toast]);

  // Get unique album names for filtering
  const albumTags = Array.from(
    new Set(galleryImages.map((img) => img.album_name))
  );

  // Filter images based on search and album selection
  const filteredImages = galleryImages.filter((image) => {
    const matchesSearch =
      searchQuery === "" ||
      image.alt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.album_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAlbum =
      selectedAlbum === "all" || image.album_name === selectedAlbum;

    return matchesSearch && matchesAlbum;
  });

  if (!hasPermission("manage_albums")) {
    return (
      <Alert
        variant="destructive"
        className="max-w-lg mx-auto mt-8 animate-in fade-in slide-in-from-top-4"
      >
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don&apos;t have permission to access this page.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-6">
      {/* Header */}
      <div className="flex flex-col gap-2 relative">
        <h1 className="text-2xl font-bold text-red-900">Gallery</h1>
        <p className="text-muted-foreground">
          Browse and manage your gallery images across all albums
        </p>
        <div className="absolute -bottom-1 left-0 w-12 h-1 bg-red-600 rounded-full" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <ImageIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Images</p>
                <p className="text-2xl font-bold text-red-900">
                  {galleryImages.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Filter className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Albums</p>
                <p className="text-2xl font-bold text-red-900">
                  {albumTags.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-red-100">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by image name or album..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-red-100 focus:border-red-200 focus:ring-red-100"
              />
            </div>
            <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
              <SelectTrigger className="w-full sm:w-[200px] border-red-100">
                <Filter className="w-4 h-4 mr-2 text-red-600" />
                <SelectValue placeholder="Filter by album" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Albums</SelectItem>
                {albumTags.map((album) => (
                  <SelectItem key={album} value={album}>
                    {album}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <Card className="border-red-100">
          <CardContent className="py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <ImageOff className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              No Images Found
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {searchQuery || selectedAlbum !== "all"
                ? "No images match your current filters. Try adjusting your search criteria or clearing filters."
                : "There are no images in the gallery yet. Images will appear here once they're added to albums."}
            </p>
            {(searchQuery || selectedAlbum !== "all") && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-red-100 hover:bg-red-50"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedAlbum("all");
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredImages.map((image) => (
            <motion.div key={image.id} variants={item}>
              <Card
                className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg border-red-100"
                onClick={() => {
                  setSelectedImage(image);
                  setPreviewOpen(true);
                }}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={image.image_url}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="bg-white/10 text-white border-white/20"
                      >
                        {image.album_name}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate">{image.alt}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(image);
                      setPreviewOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Image Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {selectedImage?.alt}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-red-600">
              <Badge variant="outline" className="border-red-200">
                {selectedImage?.album_name}
              </Badge>
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-6">
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden">
                <Image
                  src={selectedImage.image_url}
                  alt={selectedImage.alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Upload Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {selectedImage.upload_date}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Album</p>
                  <p className="font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {selectedImage.album_name}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
