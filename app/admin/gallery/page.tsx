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
import { Search, Info, Filter } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import type { GalleryImage } from "@/lib/services/gallery";
import { getAllGalleryImages } from "@/lib/services/gallery";


export default function GalleryPage() {
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
      <Alert variant="destructive">
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gallery Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and organize your gallery images
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
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

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <Alert>
          <Info className="w-4 h-4" />
          <AlertTitle>No images found</AlertTitle>
          <AlertDescription>
            No images found matching your search criteria.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <Card
              key={image.id}
              className="group relative overflow-hidden transition-all hover:ring-2 hover:ring-primary cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-square">
                  <Image
                    src={image.image_url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white p-4 text-center">
                    <p className="font-semibold">{image.album_name}</p>
                    <p className="text-sm text-gray-300">{image.upload_date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>
              From album: {selectedImage?.album_name}
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="relative aspect-[16/9]">
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.alt}
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
          )}
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Uploaded on {selectedImage?.upload_date}
              </p>
              <Badge variant="outline">{selectedImage?.album_name}</Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
