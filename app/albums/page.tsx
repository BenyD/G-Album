"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import PageHero from "@/components/page-hero";
import { useState, useEffect } from "react";
import { getAlbums } from "@/lib/services/albums";
import type { Album } from "@/lib/types/albums";

// Optimized animation variants with reduced motion support
const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.25, ease: "easeOut" },
};

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

// Optimize animations based on device performance
const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

export default function AlbumsPage() {
  const hasLoaded = useHasLoaded();
  const [searchQuery, setSearchQuery] = useState("");
  const [gridRef, isGridInView] = useInView();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      setIsLoading(true);
      const data = await getAlbums();
      setAlbums(data);
    } catch (error) {
      console.error("Error loading albums:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter albums based on search query
  const filteredAlbums = albums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen pt-16">
      <PageHero
        title="Our Albums"
        subtitle="Explore our diverse collection of premium photo albums"
        className="py-20"
      />

      {/* Search Section */}
      <section className="py-8 bg-white sticky top-16 z-10 border-b border-red-100">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Search albums..."
                className="pl-10 border-red-200 focus-visible:ring-red-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Albums Grid */}
      <section className="py-12 bg-linear-to-b from-white to-red-50">
        <div className="container mx-auto px-4">
          <motion.div
            ref={gridRef}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate={isGridInView && hasLoaded ? "animate" : "initial"}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Loading skeletons
                [...Array(8)].map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    variants={fadeInUp}
                    className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse"
                  >
                    <div className="aspect-4/3 bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </motion.div>
                ))
              ) : filteredAlbums.length === 0 ? (
                <motion.div
                  variants={fadeInUp}
                  className="col-span-full text-center py-12"
                >
                  <h3 className="text-xl font-semibold text-gray-700">
                    No albums found
                  </h3>
                  <p className="text-gray-500 mt-2">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Check back soon for new albums"}
                  </p>
                </motion.div>
              ) : (
                filteredAlbums.map((album) => (
                  <motion.div
                    key={album.id}
                    variants={fadeInUp}
                    whileHover={prefersReducedMotion ? {} : { y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={`/albums/${album.id}`} className="group block">
                      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col relative isolate">
                        <div className="relative">
                          <div className="relative aspect-4/3 overflow-hidden">
                            <Image
                              src={album.cover_image_url || "/placeholder.svg"}
                              alt={album.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          {album.featured && (
                            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
                              Featured
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-red-600 transition-colors duration-200">
                            {album.title}
                          </h3>
                          {album.description && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {album.description}
                            </p>
                          )}
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {album.images?.length || 0} photos
                            </span>
                            <ArrowRight className="w-4 h-4 text-red-600 transform group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
