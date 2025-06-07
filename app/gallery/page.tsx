"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, Grid3X3, List, Calendar, Tag } from "lucide-react";
import PageHero from "@/components/page-hero";

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

// Add loading state detection
const useHasLoaded = () => {
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  return hasLoaded;
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

// Sample tags for filtering
const allTags = [
  "Wedding",
  "Birthday",
  "Anniversary",
  "Family",
  "Baby",
  "Travel",
  "Corporate",
  "Graduation",
];

// Sample gallery images with tags and metadata
const allGalleryImages = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  src: `/placeholder.svg?height=600&width=600&query=photo album page ${i + 1}`,
  alt: `Gallery image ${i + 1}`,
  tags: allTags.filter(() => Math.random() > 0.5),
  date: new Date(
    2023,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  ).toLocaleDateString(),
  title: `Album Collection ${i + 1}`,
  description: `Beautiful memories captured in this stunning photo album featuring ${allTags[
    Math.floor(Math.random() * allTags.length)
  ].toLowerCase()} moments.`,
}));

export default function GalleryPage() {
  const hasLoaded = useHasLoaded();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"masonry" | "list">("masonry");
  const [visibleItems, setVisibleItems] = useState(12);
  const itemsPerPage = 12;
  const [gridRef, isGridInView] = useInView();

  // Optimize filtered images calculation
  const filteredImages = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return allGalleryImages.filter((image) => {
      if (
        searchQuery &&
        !image.alt.toLowerCase().includes(searchLower) &&
        !image.title.toLowerCase().includes(searchLower) &&
        !image.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }

      if (
        selectedTags.length &&
        !selectedTags.some((tag) => image.tags.includes(tag))
      ) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedTags]);

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
  }, [searchQuery, selectedTags]);

  // Debounce function
  function debounce(fn: Function, ms: number) {
    let timer: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHero
        title="Our Gallery"
        subtitle="Explore our collection of beautifully crafted photo albums showcasing precious memories"
        className="py-20 md:py-32"
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
                placeholder="Search albums, descriptions..."
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
                  Filter by Category:
                </span>
              </div>

              {(searchQuery || selectedTags.length > 0) && (
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
              {allTags.map((tag) => (
                <motion.div
                  key={tag}
                  variants={animationVariant}
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                >
                  <Button
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTag(tag)}
                    className={`${
                      selectedTags.includes(tag)
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "border-red-200 text-red-700 hover:bg-red-50"
                    }`}
                  >
                    {tag}
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
          <motion.div
            ref={gridRef}
            className={`grid gap-4 ${
              viewMode === "masonry"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="wait">
              {filteredImages.slice(0, visibleItems).map((image, index) => (
                <motion.div
                  key={image.id}
                  variants={animationVariant}
                  initial="initial"
                  animate={isGridInView ? "animate" : "initial"}
                  exit="exit"
                  className={`relative ${
                    viewMode === "masonry"
                      ? "aspect-[3/4]"
                      : "aspect-[16/9] sm:aspect-[21/9]"
                  } rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes={
                      viewMode === "masonry"
                        ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        : "100vw"
                    }
                    loading={index < 12 ? "eager" : "lazy"}
                    priority={index < 4}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-lg font-semibold">{image.title}</h3>
                      <p className="text-sm opacity-90">{image.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {image.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Load More Button */}
          {visibleItems < filteredImages.length && (
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
        </div>
      </section>
    </div>
  );
}
