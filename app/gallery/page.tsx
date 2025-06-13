"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, Grid3X3, List } from "lucide-react";
import PageHero from "@/components/page-hero";
import { getAllGalleryImages } from "@/lib/services/gallery";
import type { GalleryImage } from "@/lib/services/gallery";
import Masonry from "react-masonry-css";

// Add blur data URL for image placeholder
const blurDataURL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+Oj5CQkJCQkJCQkJCQkJCQkJCQkJCQkL/2wBDAR4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

// Optimized animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.25, ease: "easeOut" },
};

// Optimize animations based on device performance
const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// Simplified animation variants for reduced motion
const simplifiedFadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

// Use appropriate animation variants based on user preference
const animationVariant = prefersReducedMotion ? simplifiedFadeIn : fadeInUp;

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.02,
      delayChildren: 0.1,
    },
  },
};

// Add intersection observer hook for better performance
const useInView = () => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    observer.observe(ref);

    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref]);

  return [setRef, isInView] as const;
};

// Get unique album names for filtering
const deriveAlbumNames = (images: GalleryImage[]) => {
  const uniqueAlbums = new Set<string>();
  images.forEach((image) => {
    uniqueAlbums.add(image.album_name);
  });
  return Array.from(uniqueAlbums).sort();
};

const breakpointColumns = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 1,
};

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"masonry" | "list">("masonry");
  const [visibleItems, setVisibleItems] = useState(12);
  const itemsPerPage = 12;
  const [gridRef, isGridInView] = useInView();
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load gallery images
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        const images = await getAllGalleryImages();
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

  // Derive album names from loaded images
  const allAlbums = useMemo(
    () => deriveAlbumNames(galleryImages),
    [galleryImages]
  );

  // Optimize filtered images calculation with memoized search terms
  const searchTerms = useMemo(
    () => searchQuery.toLowerCase().split(" "),
    [searchQuery]
  );

  const filteredImages = useMemo(() => {
    return galleryImages.filter((image) => {
      const imageText = `${image.alt} ${image.album_name}`.toLowerCase();

      // Check if all search terms are present
      if (
        searchQuery &&
        !searchTerms.every((term) => imageText.includes(term))
      ) {
        return false;
      }

      if (selectedAlbums.length && !selectedAlbums.includes(image.album_name)) {
        return false;
      }

      return true;
    });
  }, [searchTerms, selectedAlbums, galleryImages, searchQuery]);

  // Optimize scroll handler with useCallback
  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 &&
      visibleItems < filteredImages.length
    ) {
      setVisibleItems((prev) =>
        Math.min(prev + itemsPerPage, filteredImages.length)
      );
    }
  }, [filteredImages.length, visibleItems]);

  // Optimize scroll listener
  useEffect(() => {
    const debouncedScroll = debounce(handleScroll, 100);
    window.addEventListener("scroll", debouncedScroll);
    return () => window.removeEventListener("scroll", debouncedScroll);
  }, [handleScroll]);

  // Reset visible items when filters change
  useEffect(() => {
    setVisibleItems(itemsPerPage);
  }, [searchQuery]);

  // Debounce function
  function debounce<T extends (...args: unknown[]) => void>(
    fn: T,
    ms: number
  ): (...args: Parameters<T>) => void {
    let timer: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

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
      <PageHero
        title="Our Gallery"
        subtitle="Explore our collection of hand crafted photo albums"
        className="py-20"
      />

      {/* Controls Section */}
      <section className="bg-white border-b border-red-100 sticky top-[56px] z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Search and View Controls */}
          <motion.div
            className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Search albums..."
                className="pl-10 border-red-200 focus-visible:ring-red-500 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View Mode Toggle */}
            <motion.div
              className="flex items-center gap-2 bg-white rounded-lg p-1 border border-red-200"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            >
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
            </motion.div>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="bg-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-red-600" />
                <span className="font-medium text-slate-700">
                  Filter by Album:
                </span>
              </div>

              {(searchQuery || selectedAlbums.length > 0) && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </motion.div>
              )}
            </div>

            <motion.div
              className="flex flex-wrap gap-2"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {allAlbums.map((album) => (
                <motion.div
                  key={album}
                  variants={animationVariant}
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                >
                  <Button
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
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
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
                    <motion.div
                      key={image.id}
                      variants={animationVariant}
                      initial="initial"
                      animate={isGridInView ? "animate" : "initial"}
                      exit="exit"
                      className="mb-4 group"
                    >
                      <div className="relative overflow-hidden">
                        <Image
                          src={image.image_url}
                          alt={image.alt}
                          width={800}
                          height={1200}
                          unoptimized={true}
                          className="w-full h-auto object-cover rounded-none transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={index < 4}
                          placeholder="blur"
                          blurDataURL={blurDataURL}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-image.jpg";
                          }}
                        />
                        {/* Album title overlay */}
                        <div className="absolute inset-0 flex items-end justify-start p-4 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <h3 className="text-white text-lg font-medium tracking-wide">
                            {image.album_name}
                          </h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </Masonry>
              ) : (
                <motion.div
                  ref={gridRef}
                  className="grid grid-cols-1 gap-4"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  <AnimatePresence mode="wait">
                    {filteredImages
                      .slice(0, visibleItems)
                      .map((image, index) => (
                        <motion.div
                          key={image.id}
                          variants={animationVariant}
                          initial="initial"
                          animate={isGridInView ? "animate" : "initial"}
                          exit="exit"
                          className="relative aspect-[16/9] sm:aspect-[21/9] overflow-hidden"
                        >
                          <Image
                            src={image.image_url}
                            alt={image.alt}
                            fill
                            unoptimized={true}
                            className="object-cover"
                            sizes="100vw"
                            loading={index < 12 ? "eager" : "lazy"}
                            priority={index < 4}
                            placeholder="blur"
                            blurDataURL={blurDataURL}
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
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Load More Button */}
              {!isLoading && visibleItems < filteredImages.length && (
                <motion.div
                  className="flex justify-center mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() =>
                      setVisibleItems((prev) =>
                        Math.min(prev + itemsPerPage, filteredImages.length)
                      )
                    }
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Load More
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
