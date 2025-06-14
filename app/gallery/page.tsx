"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, Grid3X3, List, ChevronDown } from "lucide-react";
import PageHero from "@/components/page-hero";
import { getAllGalleryImages } from "@/lib/services/gallery";
import type { GalleryImage } from "@/lib/services/gallery";
import Masonry from "react-masonry-css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { debounce } from "lodash";
import { motion, useScroll, useSpring } from "framer-motion";

// Breakpoints for masonry grid
const breakpointColumns = {
  default: 3,
  1536: 3,
  1280: 3,
  1024: 2,
  768: 2,
  640: 1,
};

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"masonry" | "list">("masonry");
  const [visibleItems, setVisibleItems] = useState(8);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Get unique album names for filtering
  const allAlbums = useMemo(() => {
    const uniqueAlbums = new Set<string>();
    galleryImages.forEach((image) => {
      if (image.album_name) {
        uniqueAlbums.add(image.album_name);
      }
    });
    return Array.from(uniqueAlbums).sort();
  }, [galleryImages]);

  // Filter images based on search and album selection
  const filteredImages = useMemo(() => {
    const searchTerms = searchQuery.toLowerCase().split(" ").filter(Boolean);

    return galleryImages.filter((image) => {
      if (!searchTerms.length && !selectedAlbums.length) return true;

      const imageText = `${image.alt} ${image.album_name}`.toLowerCase();

      if (
        searchTerms.length &&
        !searchTerms.every((term) => imageText.includes(term))
      ) {
        return false;
      }

      if (selectedAlbums.length && !selectedAlbums.includes(image.album_name)) {
        return false;
      }

      return true;
    });
  }, [galleryImages, searchQuery, selectedAlbums]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          visibleItems < filteredImages.length
        ) {
          // Load more items in smaller chunks
          setVisibleItems((prev) => Math.min(prev + 6, filteredImages.length));
        }
      },
      {
        root: null,
        rootMargin: "200px", // Increased from 100px to 200px for earlier loading
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [isLoading, visibleItems, filteredImages.length]);

  // Debounce search input
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  // Load gallery images
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        const images = await getAllGalleryImages();
        console.log("Loaded images:", images); // Debug log
        setGalleryImages(images);
      } catch (err) {
        console.error("Error loading gallery images:", err);
        setError("Failed to load gallery images. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

  // Toggle album selection
  const toggleAlbum = (album: string) => {
    setSelectedAlbums((prev) =>
      prev.includes(album) ? prev.filter((a) => a !== album) : [...prev, album]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedAlbums([]);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold text-red-600">Oops!</h2>
          <p className="text-slate-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Custom Scroll Progress Bar */}
      <motion.div
        className="fixed top-[56px] left-0 right-0 h-0.5 bg-red-100 z-50"
        style={{ scaleX, transformOrigin: "0%" }}
      >
        <div className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700" />
      </motion.div>

      <PageHero
        title="Our Gallery"
        subtitle="Explore our collection of hand crafted photo albums"
        className="py-20"
      />

      {/* Controls Section */}
      <section className="bg-white border-b border-red-100 sticky top-[56px] z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Search and View Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Search albums..."
                className="pl-10 border-red-200 focus-visible:ring-red-500 bg-white"
                defaultValue={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-red-200">
              <Button
                variant={viewMode === "masonry" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("masonry")}
                className={`${
                  viewMode === "masonry"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "text-slate-600 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Masonry
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`${
                  viewMode === "list"
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "text-slate-600 hover:text-red-600 hover:bg-red-50"
                }`}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Collapsible
            open={isFiltersOpen}
            onOpenChange={setIsFiltersOpen}
            className="bg-transparent"
          >
            <div className="flex items-center justify-between mb-4">
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {selectedAlbums.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-red-100 text-red-700"
                    >
                      {selectedAlbums.length}
                    </Badge>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 ml-2 transition-transform ${
                      isFiltersOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>

              {(searchQuery || selectedAlbums.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            <CollapsibleContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-700">
                    Filter by Album:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allAlbums.map((album) => (
                    <Button
                      key={album}
                      variant={
                        selectedAlbums.includes(album) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => toggleAlbum(album)}
                      className={`${
                        selectedAlbums.includes(album)
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "border-red-200 text-red-700 hover:bg-red-50"
                      }`}
                    >
                      {album}
                    </Button>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 bg-gradient-to-b from-white to-red-50/30">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <>
              {viewMode === "masonry" ? (
                <Masonry
                  breakpointCols={breakpointColumns}
                  className="flex -ml-4 w-auto"
                  columnClassName="pl-4 bg-clip-padding"
                >
                  {filteredImages.slice(0, visibleItems).map((image, index) => (
                    <div key={image.id} className="mb-4 group">
                      <div
                        className="relative overflow-hidden rounded-lg cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      >
                        <Image
                          src={image.image_url}
                          alt={image.alt}
                          width={800}
                          height={1200}
                          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={index < 2}
                          loading={index < 2 ? "eager" : "lazy"}
                          quality={75}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-image.jpg";
                          }}
                        />
                        <div className="absolute inset-0 flex items-end justify-start p-4 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h3 className="text-white text-lg font-medium tracking-wide">
                            {image.album_name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </Masonry>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredImages.slice(0, visibleItems).map((image, index) => (
                    <div
                      key={image.id}
                      className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden rounded-lg cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image.image_url}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        loading={index < 12 ? "eager" : "lazy"}
                        priority={index < 4}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-image.jpg";
                        }}
                      />
                      <div className="absolute inset-0 flex items-end justify-start p-6 bg-gradient-to-t from-black/50 via-black/20 to-transparent">
                        <h3 className="text-white text-xl font-medium tracking-wide">
                          {image.album_name}
                        </h3>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Loading indicator for infinite scroll */}
              {!isLoading && visibleItems < filteredImages.length && (
                <div
                  ref={loadMoreRef}
                  className="flex justify-center items-center py-8"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-900">
              {selectedImage?.album_name}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm flex items-center gap-2 text-red-600">
                <Badge variant="outline" className="border-red-200">
                  {selectedImage?.upload_date}
                </Badge>
              </div>
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.alt}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
                priority
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
