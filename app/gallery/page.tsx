"use client"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, X, Grid3X3, List, Calendar, Tag } from "lucide-react"

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

// Optimize animations based on device performance
const prefersReducedMotion =
  typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false

// Simplified animation variants for reduced motion
const simplifiedFadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4 },
}

// Use appropriate animation variants based on user preference
const animationVariant = prefersReducedMotion ? simplifiedFadeIn : fadeInUp

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

// Sample tags for filtering
const allTags = ["Wedding", "Birthday", "Anniversary", "Family", "Baby", "Travel", "Corporate", "Graduation"]

// Sample gallery images with tags and metadata
const allGalleryImages = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  src: `/placeholder.svg?height=600&width=600&query=photo album page ${i + 1}`,
  alt: `Gallery image ${i + 1}`,
  tags: allTags.filter(() => Math.random() > 0.5),
  date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
  title: `Album Collection ${i + 1}`,
  description: `Beautiful memories captured in this stunning photo album featuring ${allTags[Math.floor(Math.random() * allTags.length)].toLowerCase()} moments.`,
}))

export default function GalleryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"masonry" | "list">("masonry")
  const [visibleItems, setVisibleItems] = useState(12)
  const itemsPerPage = 12

  // Memoize filtered images to prevent unnecessary recalculations
  const filteredImages = useMemo(() => {
    return allGalleryImages.filter((image) => {
      const matchesSearch =
        searchQuery === "" ||
        image.alt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        image.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => image.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [searchQuery, selectedTags])

  // Load more items when user scrolls to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000 &&
        visibleItems < filteredImages.length
      ) {
        setVisibleItems((prev) => Math.min(prev + 12, filteredImages.length))
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [filteredImages.length, visibleItems])

  // Reset visible items when filters change
  useEffect(() => {
    setVisibleItems(12)
  }, [searchQuery, selectedTags])

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
  }

  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 to-red-900 text-white py-20 md:py-32 overflow-hidden">
        {/* Background blur elements */}
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 rounded-full bg-red-400 opacity-30 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-red-300 opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Gallery</h1>
            <p className="text-xl text-red-100">
              Explore our collection of beautifully crafted photo albums showcasing precious memories
            </p>
          </motion.div>
        </div>
      </section>

      {/* Controls Section */}
      <section className="py-8 bg-gradient-to-b from-white to-red-50 border-b border-red-100">
        <div className="container mx-auto px-4">
          {/* Search and View Controls */}
          <motion.div
            className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Search */}
            <div className="relative flex-1 max-w-md">
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
              whileHover={{ scale: 1.02 }}
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
            className="bg-white rounded-xl p-6 shadow-sm border border-red-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-red-600" />
                <span className="font-medium text-slate-700">Filter by Category:</span>
              </div>

              {(searchQuery || selectedTags.length > 0) && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
              {allTags.map((tag, index) => (
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
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Button>
                </motion.div>
              ))}
            </motion.div>

            {/* Active Filters Display */}
            {(searchQuery || selectedTags.length > 0) && (
              <motion.div
                className="mt-4 pt-4 border-t border-red-100"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-slate-600">Active filters:</span>
                  {searchQuery && (
                    <motion.span
                      className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      Search: "{searchQuery}"
                      <button onClick={() => setSearchQuery("")} className="hover:text-red-900">
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  )}
                  {selectedTags.map((tag) => (
                    <motion.span
                      key={tag}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      {tag}
                      <button onClick={() => toggleTag(tag)} className="hover:text-red-900">
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results Count */}
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-slate-600">
              Showing <span className="font-semibold text-red-600">{filteredImages.length}</span> of{" "}
              <span className="font-semibold">{allGalleryImages.length}</span> albums
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-12 bg-gradient-to-b from-red-50 to-white min-h-screen">
        <div className="container mx-auto px-4">
          {filteredImages.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              >
                <Search className="h-12 w-12 text-red-400" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-slate-700 mb-2">No albums found</h3>
              <p className="text-slate-500 mb-6 text-center max-w-md">
                We couldn't find any albums matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Clear all filters
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <>
              {/* Masonry View */}
              {viewMode === "masonry" && (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  layout
                >
                  {filteredImages.slice(0, visibleItems).map((image, index) => (
                    <motion.div
                      key={image.id}
                      className={`group relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 ${
                        index % 7 === 0 || index % 7 === 3 ? "row-span-2" : ""
                      }`}
                      variants={animationVariant}
                      whileHover={{ y: -5, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      layoutId={`gallery-item-${image.id}`}
                    >
                      <div
                        className={`relative ${index % 7 === 0 || index % 7 === 3 ? "aspect-[3/4]" : "aspect-square"}`}
                      >
                        <Image
                          src={image.src || "/placeholder.svg"}
                          alt={image.alt}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PC9zdmc+"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-red-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Content overlay */}
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                          initial={{ y: 20, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <h3 className="text-white font-semibold mb-1">{image.title}</h3>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {image.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-white/20 px-2 py-0.5 rounded-full text-white backdrop-blur-sm"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center text-white/80 text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {image.date}
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <motion.div className="space-y-6" variants={staggerContainer} initial="initial" animate="animate">
                  {filteredImages.slice(0, visibleItems).map((image, index) => (
                    <motion.div
                      key={image.id}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                      variants={animationVariant}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.3 }}
                      layoutId={`gallery-item-${image.id}`}
                    >
                      <div className="relative w-full">
                        <div className="relative aspect-[21/9] w-full overflow-hidden">
                          <Image
                            src={image.src || "/placeholder.svg"}
                            alt={image.alt}
                            fill
                            className="object-cover transition-transform duration-500 hover:scale-105"
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                          />

                          {/* Hover overlay with info */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              whileHover={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <h3 className="text-2xl font-semibold text-white mb-2">{image.title}</h3>
                              <p className="text-white/90 mb-4 max-w-3xl">{image.description}</p>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {image.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm cursor-pointer hover:bg-white/30 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (!selectedTags.includes(tag)) {
                                        setSelectedTags([...selectedTags, tag])
                                      }
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center text-white/80 text-sm">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {image.date}
                                </div>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                  View Album
                                </Button>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          )}
          {/* Load More Button */}
          {visibleItems < filteredImages.length && (
            <motion.div
              className="flex justify-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Button
                onClick={() => setVisibleItems((prev) => Math.min(prev + itemsPerPage, filteredImages.length))}
                className="bg-red-600 hover:bg-red-700"
                size="lg"
              >
                Load More
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
