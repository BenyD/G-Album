"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, Star, ArrowRight, Filter } from "lucide-react";
import PageHero from "@/components/page-hero";
import { useState, useEffect } from "react";
import { getAlbums } from "@/lib/services/albums";
import type { Album } from "@/lib/types/albums";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.25, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const useHasLoaded = () => {
  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => setHasLoaded(true), []);
  return hasLoaded;
};

const useInView = () => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1, rootMargin: "100px" }
    );
    observer.observe(ref);
    return () => ref && observer.unobserve(ref);
  }, [ref]);

  return [setRef, isInView] as const;
};

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

export default function AlbumsPage() {
  const hasLoaded = useHasLoaded();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
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

  const filteredAlbums = albums
    .filter((album) => {
      const matchesSearch =
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (filterBy === "featured") return matchesSearch && album.featured;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sortBy === "oldest")
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      if (sortBy === "most_photos")
        return (b.images?.length || 0) - (a.images?.length || 0);
      return 0;
    });

  return (
    <div className="flex flex-col min-h-screen pt-16">
      <PageHero
        title="Photo Albums"
        subtitle="Explore our curated collection of premium photo albums"
        className="py-20"
      />

      {/* Search and Filter Section */}
      <section className="py-4 sticky top-[56px] z-10 border-b border-red-100/50 backdrop-blur-lg bg-white/80 -mt-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search albums..."
                className="pl-10 bg-white/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[140px] bg-white/50">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Albums</SelectItem>
                  <SelectItem value="featured">Featured Only</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-white/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="most_photos">Most Photos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Albums Grid */}
      <section className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <motion.div
            ref={gridRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8"
            variants={staggerContainer}
            initial="initial"
            animate={isGridInView && hasLoaded ? "animate" : "initial"}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    variants={fadeInUp}
                    className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
                    <div className="p-6 space-y-3">
                      <div className="h-6 bg-gray-100 rounded-full w-3/4 animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded-full w-1/2 animate-pulse" />
                      <div className="h-4 bg-gray-100 rounded-full w-2/3 animate-pulse" />
                    </div>
                  </motion.div>
                ))
              ) : filteredAlbums.length === 0 ? (
                <motion.div
                  variants={fadeInUp}
                  className="col-span-full text-center py-16"
                >
                  <div className="max-w-md mx-auto">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      No albums found
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "Try adjusting your search terms or filters"
                        : "Check back soon for new albums"}
                    </p>
                    {(searchQuery || filterBy !== "all") && (
                      <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => {
                          setSearchQuery("");
                          setFilterBy("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>
                </motion.div>
              ) : (
                filteredAlbums.map((album) => (
                  <motion.div
                    key={album.id}
                    variants={fadeInUp}
                    whileHover={prefersReducedMotion ? {} : { y: -5 }}
                    className="group"
                  >
                    <Link
                      href={`/albums/${album.id}`}
                      className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 rounded-2xl"
                    >
                      <div className="bg-white rounded-2xl h-full transform-gpu transition-all duration-500 group relative isolate">
                        {/* Card glow effect */}
                        <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden group-hover:block transition duration-500">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-red-500/10 rounded-[20px] blur-xl" />
                        </div>

                        {/* Main content */}
                        <div className="relative bg-white rounded-2xl border border-gray-100 transition duration-500 group-hover:border-transparent group-hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.2)] group-hover:shadow-red-500/10">
                          {/* Image section */}
                          <div className="relative">
                            <div className="aspect-[4/3] relative overflow-hidden rounded-t-2xl">
                              <Image
                                src={
                                  album.cover_image_url || "/placeholder.svg"
                                }
                                alt={album.title}
                                fill
                                className="object-cover transition-all duration-700 scale-[1.01] group-hover:scale-110"
                                sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                              />
                              {/* Gradient overlays */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
                            </div>

                            {/* Badges */}
                            <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between">
                              {album.featured && (
                                <Badge className="bg-red-600/90 backdrop-blur-sm text-white shadow-lg border border-white/20">
                                  <Star className="w-3.5 h-3.5 mr-1" />
                                  Featured
                                </Badge>
                              )}
                              <Badge
                                variant="secondary"
                                className="bg-black/50 text-white backdrop-blur-sm border border-white/20 ml-auto"
                              >
                                {album.images?.length || 0} photos
                              </Badge>
                            </div>
                          </div>

                          {/* Content section */}
                          <div className="p-6">
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-300 line-clamp-1">
                                  {album.title}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  Added{" "}
                                  {new Date(
                                    album.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              {album.description && (
                                <p className="text-muted-foreground line-clamp-2 text-sm">
                                  {album.description}
                                </p>
                              )}
                            </div>

                            <div className="mt-6">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between text-red-600 hover:text-red-700 hover:bg-red-50 group/btn font-medium"
                              >
                                View Album
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                              </Button>
                            </div>
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
