"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Sample albums data
const albums = [
  {
    id: "wedding-collection",
    title: "Wedding Collection",
    description: "Elegant albums to preserve your special day",
    coverImage: "/placeholder.svg?height=600&width=500&query=wedding album cover",
    category: "Wedding",
  },
  {
    id: "family-portraits",
    title: "Family Portraits",
    description: "Timeless family memories in premium albums",
    coverImage: "/placeholder.svg?height=600&width=500&query=family portrait album cover",
    category: "Family",
  },
  {
    id: "anniversary-special",
    title: "Anniversary Special",
    description: "Celebrate your love story with our special albums",
    coverImage: "/placeholder.svg?height=600&width=500&query=anniversary album cover",
    category: "Anniversary",
  },
  {
    id: "baby-photoshoots",
    title: "Baby Photoshoots",
    description: "Capture those precious early moments",
    coverImage: "/placeholder.svg?height=600&width=500&query=baby album cover",
    category: "Baby",
  },
  {
    id: "birthday-celebrations",
    title: "Birthday Celebrations",
    description: "Make birthday memories last forever",
    coverImage: "/placeholder.svg?height=600&width=500&query=birthday album cover",
    category: "Birthday",
  },
  {
    id: "travel-memories",
    title: "Travel Memories",
    description: "Beautiful albums for your travel adventures",
    coverImage: "/placeholder.svg?height=600&width=500&query=travel album cover",
    category: "Travel",
  },
  {
    id: "graduation-albums",
    title: "Graduation Albums",
    description: "Commemorate academic achievements",
    coverImage: "/placeholder.svg?height=600&width=500&query=graduation album cover",
    category: "Graduation",
  },
  {
    id: "corporate-events",
    title: "Corporate Events",
    description: "Professional albums for business events",
    coverImage: "/placeholder.svg?height=600&width=500&query=corporate event album cover",
    category: "Corporate",
  },
]

export default function AlbumsPage() {
  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 to-red-900 text-white py-20 overflow-hidden">
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Albums</h1>
            <p className="text-xl text-red-100">Explore our collection of premium, handcrafted photo albums</p>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
      <section className="py-12 bg-gradient-to-b from-white to-red-50">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {albums.map((album, index) => (
              <motion.div key={album.id} variants={fadeInUp} whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                <Link href={`/albums/${album.id}`} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="relative">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={album.coverImage || "/placeholder.svg"}
                          alt={album.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      {/* Category badge */}
                      <motion.div
                        className="absolute top-4 right-4"
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <span className="px-3 py-1 bg-red-600/90 text-white text-sm rounded-full backdrop-blur-sm">
                          {album.category}
                        </span>
                      </motion.div>
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-red-900 mb-2 group-hover:text-red-700 transition-colors">
                        {album.title}
                      </h3>
                      <p className="text-slate-600 mb-4 flex-1">{album.description}</p>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button className="w-full mt-auto bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                          View Album
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
