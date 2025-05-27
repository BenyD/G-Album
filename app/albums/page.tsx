"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import PageHero from "@/components/page-hero";

// Optimized animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

// Sample albums data
const albums = [
  {
    id: "wedding-collection",
    title: "Wedding Collection",
    description: "Elegant albums to preserve your special day",
    coverImage:
      "/placeholder.svg?height=600&width=500&query=wedding album cover",
  },
  {
    id: "family-portraits",
    title: "Family Portraits",
    description: "Timeless family memories in premium albums",
    coverImage:
      "/placeholder.svg?height=600&width=500&query=family portrait album cover",
  },
  {
    id: "anniversary-special",
    title: "Anniversary Special",
    description: "Celebrate your love story with our special albums",
    coverImage:
      "/placeholder.svg?height=600&width=500&query=anniversary album cover",
  },
  {
    id: "baby-photoshoots",
    title: "Baby Photoshoots",
    description: "Capture those precious early moments",
    coverImage: "/placeholder.svg?height=600&width=500&query=baby album cover",
  },
  {
    id: "birthday-celebrations",
    title: "Birthday Celebrations",
    description: "Make birthday memories last forever",
    coverImage:
      "/placeholder.svg?height=600&width=500&query=birthday album cover",
  },
  {
    id: "travel-memories",
    title: "Travel Memories",
    description: "Beautiful albums for your travel adventures",
    coverImage:
      "/placeholder.svg?height=600&width=500&query=travel album cover",
  },
  {
    id: "graduation-albums",
    title: "Graduation Albums",
    description: "Commemorate academic achievements",
    coverImage:
      "/placeholder.svg?height=600&width=500&query=graduation album cover",
  },
  {
    id: "corporate-events",
    title: "Corporate Events",
    description: "Professional albums for business events",
    coverImage:
      "/placeholder.svg?height=600&width=500&query=corporate event album cover",
  },
];

export default function AlbumsPage() {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      <PageHero
        title="Our Albums"
        subtitle="Explore our diverse collection of premium photo albums"
        className="py-20"
      />

      {/* Search Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="search"
                placeholder="Search albums..."
                className="pl-10 border-red-200 focus-visible:ring-red-500"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Albums Grid */}
      <section className="py-12 bg-linear-to-b from-white to-red-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {albums.map((album) => (
              <motion.div
                key={album.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={`/albums/${album.id}`} className="group block">
                  <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col relative isolate">
                    <div className="relative">
                      <div className="relative aspect-4/3 overflow-hidden">
                        <Image
                          src={album.coverImage || "/placeholder.svg"}
                          alt={album.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Enhanced gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-red-950/80 via-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      </div>
                      {/* Card glow effect */}
                      <div className="absolute -inset-x-4 -inset-y-4 z-[-1] bg-red-500/20 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col relative z-10">
                      <h3 className="text-xl font-bold text-red-900 mb-2 group-hover:text-red-700 transition-colors">
                        {album.title}
                      </h3>
                      <p className="text-slate-600 mb-4 flex-1">
                        {album.description}
                      </p>
                      <div className="mt-auto">
                        <Button className="w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 group/btn">
                          View Album
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
