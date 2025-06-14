"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, Star, ArrowRight, Filter } from "lucide-react";
import PageHero from "@/components/page-hero";
import { useState, useEffect, useRef } from "react";
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
import { useRouter } from "next/navigation";

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

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

export default function AlbumsPage() {
  const router = useRouter();
  const hasLoaded = useHasLoaded();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState(12);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadAlbums = async () => {
    try {
      setIsLoading(true);
      const data = await getAlbums();
      setAlbums(data);
      const initialItems = window.innerWidth < 768 ? 8 : 12;
      setVisibleItems(Math.min(initialItems, data.length));
    } catch (error) {
      console.error("Error loading albums:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, []);

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

  const visibleAlbums = filteredAlbums.slice(0, visibleItems);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          visibleItems < filteredAlbums.length
        ) {
          setVisibleItems((prev) => Math.min(prev + 8, filteredAlbums.length));
        }
      },
      {
        root: null,
        rootMargin: "100px",
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
  }, [isLoading, visibleItems, filteredAlbums.length]);

  return (
    <div className="flex flex-col min-h-screen pt-16">
      <PageHero
        title="Photo Albums"
        subtitle="Explore our curated collection of premium photo albums"
        className="py-12 sm:py-20"
      />

      {/* Search and Filter Section */}
      <section className="py-3 sm:py-4 sticky top-[56px] z-10 border-b border-gray-100/50 backdrop-blur-lg bg-white/80 -mt-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search albums..."
                className="pl-9 sm:pl-10 h-9 sm:h-10 bg-white/50 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Quick Navigation Dropdown */}
              <Select
                onValueChange={(value) => {
                  router.push(`/albums/${value}`);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-9 sm:h-10 bg-white/50 text-sm">
                  <SelectValue placeholder="Quick Navigation" />
                </SelectTrigger>
                <SelectContent>
                  {albums.map((album) => (
                    <SelectItem
                      key={album.id}
                      value={album.id}
                      className="group text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="truncate">{album.title}</span>
                        {album.featured && (
                          <Star className="w-3.5 h-3.5 text-red-600 group-hover:text-white transition-colors" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-full sm:w-[140px] h-9 sm:h-10 bg-white/50 text-sm">
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-sm">
                    All Albums
                  </SelectItem>
                  <SelectItem value="featured" className="text-sm">
                    Featured Only
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[140px] h-9 sm:h-10 bg-white/50 text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="text-sm">
                    Newest First
                  </SelectItem>
                  <SelectItem value="oldest" className="text-sm">
                    Oldest First
                  </SelectItem>
                  <SelectItem value="most_photos" className="text-sm">
                    Most Photos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Albums Grid */}
      <section className="flex-1 py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            variants={staggerContainer}
            initial="initial"
            animate={hasLoaded ? "animate" : "initial"}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <motion.div
                    key={`skeleton-${i}`}
                    variants={fadeInUp}
                    className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
                    <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
                      <div className="h-5 sm:h-6 bg-gray-100 rounded-full w-3/4 animate-pulse" />
                      <div className="h-3 sm:h-4 bg-gray-100 rounded-full w-1/2 animate-pulse" />
                      <div className="h-3 sm:h-4 bg-gray-100 rounded-full w-2/3 animate-pulse" />
                    </div>
                  </motion.div>
                ))
              ) : visibleAlbums.length === 0 ? (
                <motion.div
                  variants={fadeInUp}
                  className="col-span-full text-center py-12 sm:py-16"
                >
                  <div className="max-w-md mx-auto">
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
                      No albums found
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {searchQuery
                        ? "Try adjusting your search terms or filters"
                        : "Check back soon for new albums"}
                    </p>
                    {(searchQuery || filterBy !== "all") && (
                      <Button
                        variant="outline"
                        className="mt-4 sm:mt-6 h-9 sm:h-10 text-sm"
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
                visibleAlbums.map((album) => (
                  <motion.div
                    key={album.id}
                    variants={fadeInUp}
                    whileHover={prefersReducedMotion ? {} : { y: -5 }}
                    className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <Link href={`/albums/${album.id}`} className="block">
                      <div className="relative aspect-[4/3]">
                        <Image
                          src={album.cover_image_url || "/placeholder.jpg"}
                          alt={album.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {album.featured && (
                          <div className="absolute top-2 right-2">
                            <Badge
                              variant="secondary"
                              className="bg-white/90 text-red-600"
                            >
                              <Star className="w-3.5 h-3.5 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 line-clamp-1">
                          {album.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                          {album.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {album.images?.length || 0} photos
                          </span>
                          <ArrowRight className="w-4 h-4 text-red-600" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>
          {!isLoading && visibleItems < filteredAlbums.length && (
            <div ref={loadMoreRef} className="h-10" />
          )}
        </div>
      </section>
    </div>
  );
}
