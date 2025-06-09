"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Camera,
  Clock,
  MessageSquare,
  Star,
  Calendar,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getFeaturedAlbums } from "@/lib/services/albums";
import type { Album } from "@/lib/types/albums";

// Types for testimonials
interface Testimonial {
  name: string;
  role: string;
  stars: number;
  quote: string;
  date: string;
}

// Optimized animation variants with reduced motion support
const fadeInUp = {
  initial: { opacity: 0, y: 5 }, // Reduced distance even further
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2, ease: [0.33, 1, 0.68, 1] }, // Custom easing
};

const staggerChildren = {
  animate: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.03,
    },
  },
};

const fadeInScale = {
  initial: { opacity: 0, scale: 0.995 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, ease: [0.33, 1, 0.68, 1] },
};

const backgroundVariants = {
  initial: { opacity: 0, scale: 1 },
  animate1: {
    opacity: [0.3, 0.4, 0.3],
    scale: [1, 1.2, 1],
    y: [0, -20, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
  animate2: {
    opacity: [0.2, 0.3, 0.2],
    scale: [1, 1.3, 1],
    x: [0, 30, 0],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 1,
    },
  },
  animate3: {
    opacity: [0.2, 0.3, 0.2],
    scale: [1, 1.4, 1],
    x: [0, -40, 0],
    transition: {
      duration: 12,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 2,
    },
  },
};

// Custom hook for managing loading and reduced motion preferences
const useAnimationSetup = () => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  return {
    hasLoaded,
    shouldAnimate: !prefersReducedMotion,
  };
};

export default function Home() {
  const { hasLoaded, shouldAnimate } = useAnimationSetup();
  const [featuredAlbums, setFeaturedAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeaturedAlbums();
  }, []);

  const loadFeaturedAlbums = async () => {
    try {
      setIsLoading(true);
      const data = await getFeaturedAlbums();
      setFeaturedAlbums(data);
    } catch (error) {
      console.error("Error loading featured albums:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Testimonials data
  const testimonials: Testimonial[] = [
    {
      name: "Daniel Dsouza",
      role: "Customer",
      stars: 5,
      quote: "Affordable price and friendly staffs",
      date: "5 months ago",
    },
    {
      name: "Amulraj Arthi",
      role: "Customer",
      stars: 5,
      quote: "It's very good. Photo printing shop",
      date: "2 years ago",
    },
    {
      name: "Mr. Vijayarajan",
      role: "Local Guide",
      stars: 5,
      quote: "Wonderful service",
      date: "3 years ago",
    },
    {
      name: "Sai Pranav",
      role: "Local Guide",
      stars: 5,
      quote: "Excellent 👍👍👍",
      date: "3 years ago",
    },
    {
      name: "stills vijaymani",
      role: "Local Guide",
      stars: 5,
      quote:
        "Good service. It is a great pleasure to have some pets like humans in our company.",
      date: "3 years ago",
    },
    {
      name: "Welcome World",
      role: "Customer",
      stars: 5,
      quote: "G Album is a No 1 Wedding Album!",
      date: "3 years ago",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Optimized & Accessible */}
      <section className="relative min-h-screen bg-linear-to-br from-red-600 to-red-900 text-white overflow-hidden flex items-center">
        {/* Background elements with reduced motion consideration */}
        <div className="absolute inset-0">
          {/* Animated gradient orbs */}
          {hasLoaded && shouldAnimate && (
            <>
              <motion.div
                variants={backgroundVariants}
                initial="initial"
                animate="animate1"
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-red-400/40 to-red-300/20 mix-blend-overlay blur-3xl"
              />
              <motion.div
                variants={backgroundVariants}
                initial="initial"
                animate="animate2"
                className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-red-300/30 to-red-200/20 mix-blend-overlay blur-3xl"
              />
              <motion.div
                variants={backgroundVariants}
                initial="initial"
                animate="animate3"
                className="absolute -bottom-8 left-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-red-500/30 to-red-400/20 mix-blend-overlay blur-3xl"
              />
            </>
          )}
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 bg-[url('/pattern.svg')] opacity-[0.03] bg-repeat"
            style={{ backgroundSize: "30px" }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 via-red-800/30 to-red-700/40 backdrop-blur-[1px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10 py-16 sm:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column - Content with optimized animations */}
              <motion.div
                className="lg:col-span-6 xl:col-span-5 text-center lg:text-left pt-8 sm:pt-12 lg:pt-0"
                variants={staggerChildren}
                initial="initial"
                animate="animate"
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-xs font-medium mb-8 sm:mb-10 lg:mb-6"
                  variants={fadeInScale}
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-300"></span>
                  </span>
                  <span className="leading-relaxed">
                    Premium Photo Albums Since 2018
                  </span>
                </motion.div>

                <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-10">
                  <motion.h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight"
                    variants={fadeInUp}
                  >
                    <span className="block mb-1 sm:mb-2">G Album</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-red-100 block">
                      Dream To Reality
                    </span>
                  </motion.h1>

                  <motion.p
                    className="text-base sm:text-lg text-red-100 leading-relaxed max-w-xl mx-auto lg:mx-0"
                    variants={fadeInUp}
                  >
                    Transform your precious moments into exquisite, handcrafted
                    photo albums that tell your unique story with unparalleled
                    artistry.
                  </motion.p>
                </div>

                <motion.div
                  className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-8 sm:mb-10"
                  variants={fadeInUp}
                >
                  <Button
                    size="lg"
                    className="bg-white text-red-600 hover:bg-red-50 transition-all duration-200 hover:shadow-lg hover:shadow-white/20 group relative overflow-hidden h-11 sm:h-12 px-5 sm:px-6"
                    asChild
                  >
                    <Link href="/contact">
                      <span className="relative z-10 flex items-center justify-center font-medium text-base">
                        Start Your Journey
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white transition-all duration-200 group h-11 sm:h-12 px-5 sm:px-6"
                    asChild
                  >
                    <Link href="/albums">
                      <span className="relative z-10 flex items-center justify-center font-medium text-base">
                        View Albums
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </Button>
                </motion.div>

                {/* Trust indicators with optimized animations */}
                <motion.div
                  className="flex items-center gap-6 max-w-xl mx-auto lg:mx-0 justify-center lg:justify-start"
                  variants={fadeInScale}
                >
                  <div className="text-center lg:text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl sm:text-2xl font-bold text-white">
                        4.7
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < 4
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-yellow-400/40 fill-yellow-400/40"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-red-200 mt-1 block">
                      100+ Reviews on Google
                    </span>
                  </div>

                  <div className="w-px h-12 bg-white/10" />

                  <div className="text-center lg:text-left">
                    <span className="block text-xl sm:text-2xl font-bold text-white">
                      1,000+
                    </span>
                    <span className="text-xs sm:text-sm text-red-200 mt-1 block">
                      Customers Worldwide
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right Column - Image */}
              <motion.div
                className="lg:col-span-6 xl:col-span-7"
                variants={fadeInScale}
                initial="initial"
                animate="animate"
              >
                <div className="relative mx-auto max-w-2xl lg:max-w-none">
                  {/* Decorative elements */}
                  <motion.div
                    className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-full opacity-20 blur-2xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-tr from-red-300 to-red-200 rounded-full opacity-20 blur-2xl"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  />

                  {/* Main image container */}
                  <motion.div
                    className="relative rounded-2xl bg-gradient-to-br from-red-100/10 to-white/10 p-1 backdrop-blur-sm"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {/* Image */}
                    <div className="relative rounded-xl overflow-hidden">
                      <Image
                        src="/images/hero-image.jpg"
                        alt="G Album Premium Photo Album Display"
                        width={800}
                        height={600}
                        className="w-full h-auto"
                        priority
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-red-900/20 to-transparent" />
                    </div>
                  </motion.div>

                  {/* Floating badge - Moved outside the main container */}
                  <motion.div
                    className="absolute -right-3 -bottom-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 shadow-xl z-10"
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 0.5,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-red-200 fill-red-200/20" />
                      <span className="text-sm font-medium text-white">
                        Premium Quality
                      </span>
                    </div>
                  </motion.div>

                  {/* Decorative dots */}
                  <div className="absolute -right-4 top-1/4 flex flex-col gap-1.5">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-red-200/50"
                      />
                    ))}
                  </div>
                  <div className="absolute -left-4 bottom-1/4 flex flex-col gap-1.5">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-red-200/50"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-linear-to-b from-white to-red-50">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-16 text-red-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            Our Services
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerChildren}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              {
                icon: Camera,
                title: "Photo Album Printing",
                description:
                  "Immerse your memories in our meticulously crafted photo albums. Our affordable prints blend cutting-edge technology with handcrafted precision for an unforgettable keepsake.",
              },
              {
                icon: Star,
                title: "Creative Works",
                description:
                  "Elevate your photo album with captivating effects on each page. Our artistic touch enhances your memories, ensuring a unique and visually stunning storytelling experience.",
              },
              {
                icon: MessageSquare,
                title: "Album Pad Making",
                description:
                  "Strengthen your photobook with our custom-made album pads. Crafted for durability, our front and back covers provide protection while maintaining a touch of elegance to complement your cherished moments.",
              },
              {
                icon: Clock,
                title: "Album Box Making",
                description:
                  "Preserve your memories in style with our bespoke album boxes. Merging functionality with aesthetics, our packaging/storage boxes are handcrafted to safeguard your photo albums, reflecting the quality within.",
              },
              {
                icon: Calendar,
                title: "Calendar Making",
                description:
                  "Capture the essence of time with our personalized calendars. Affordable and beautifully crafted, our calendars blend functionality with creativity, ensuring your year unfolds with cherished moments at your fingertips.",
              },
              {
                icon: Camera,
                title: "Photography and Videography",
                description:
                  "From industrial shoots to product photography and special occasions, our professional team captures every detail with precision and artistry. We deliver high-quality visuals that tell your story effectively.",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-red-100 group"
                variants={fadeInUp}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-16 h-16 bg-linear-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200">
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-red-900">
                  {service.title}
                </h3>
                <p className="text-slate-600">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Albums Section - Enhanced */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center mb-12"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div>
              <motion.span
                className="inline-block text-red-600 font-medium mb-2"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Our Showcase
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-bold text-red-900">
                Featured Albums
              </h2>
            </div>
            <Link
              href="/albums"
              className="group text-red-600 hover:text-red-700 font-medium flex items-center mt-4 md:mt-0 transition-colors duration-200"
            >
              View All Albums
              <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoading ? (
              // Loading skeletons
              [...Array(3)].map((_, index) => (
                <motion.div
                  key={index}
                  className="group relative isolate animate-pulse"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                >
                  <div className="relative overflow-hidden rounded-xl shadow-lg bg-white">
                    <div className="relative aspect-4/5 bg-gray-200" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <div className="space-y-3">
                        <div className="h-6 bg-gray-300 rounded w-3/4" />
                        <div className="h-4 bg-gray-300 rounded w-1/2" />
                        <div className="h-8 bg-gray-300 rounded w-1/3 mt-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : featuredAlbums.length === 0 ? (
              <motion.div
                className="col-span-3 text-center py-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold text-gray-700">
                  No featured albums yet
                </h3>
                <p className="text-gray-500 mt-2">
                  Check back soon for featured content
                </p>
              </motion.div>
            ) : (
              featuredAlbums.map((album, index) => (
                <motion.div
                  key={album.id}
                  className="group relative isolate"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  whileHover={{ y: -8 }}
                >
                  <div className="relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl bg-white">
                    <div className="relative aspect-4/5">
                      <Image
                        src={album.cover_image_url || "/placeholder.svg"}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Enhanced gradient overlay - visible by default */}
                      <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 via-red-900/50 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                      {/* Glow effect */}
                      <div className="absolute -inset-x-2 bottom-0 h-1/2 bg-red-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    {/* Content visible by default */}
                    <div className="absolute inset-0 flex flex-col justify-end p-6 transition-all duration-500">
                      <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-white mb-2 translate-y-0 group-hover:translate-y-0 transition-transform duration-500">
                          {album.title}
                        </h3>
                        <p className="text-red-100 mb-4 line-clamp-2 opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                          {album.description || "No description"}
                        </p>
                        <Link href={`/albums/${album.id}`}>
                          <Button
                            size="sm"
                            className="bg-white/90 backdrop-blur-sm text-red-600 hover:bg-white hover:text-red-700 transition-colors duration-200 group/btn translate-y-0 group-hover:translate-y-0 opacity-90 hover:opacity-100"
                          >
                            View Album
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* Card glow effect */}
                  <div className="absolute -inset-x-4 -inset-y-4 z-[-1] bg-red-500/20 opacity-0 blur-2xl transition duration-500 group-hover:opacity-100" />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials - Further Optimized */}
      <section className="py-20 bg-linear-to-br from-red-50 to-white relative overflow-hidden">
        {/* Static background elements */}
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-red-200 opacity-30 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-red-100 opacity-20 blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-red-900">
              What Our Clients Say
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Real reviews from our satisfied customers on Google Reviews
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
            {/* Testimonial cards with simplified animations */}
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className={`bg-white p-6 rounded-xl shadow-lg border border-red-100 relative hover:shadow-xl transition-all duration-200 hover:-translate-y-1 ${
                  index === 0 || index === 3 ? "md:row-span-2" : ""
                } ${index === 2 || index === 5 ? "lg:row-span-2" : ""}`}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className="absolute top-4 right-4 text-4xl text-red-100 font-serif">
                  &quot;
                </div>
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className={`h-4 w-4 ${
                        starIndex < testimonial.stars
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-slate-500">
                    ({testimonial.stars}/5)
                  </span>
                </div>

                <p className="text-slate-600 mb-6 relative z-10 leading-relaxed">
                  {testimonial.quote}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm transition-transform duration-200 hover:scale-105">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-semibold text-red-900 text-sm">
                        {testimonial.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {testimonial.date}
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 opacity-20">
                  <svg
                    className="w-6 h-6 text-red-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Google Reviews CTA */}
          <div className="text-center mt-12">
            <p className="text-slate-600 mb-4">See more reviews on Google</p>
            <Button
              asChild
              variant="outline"
              className="border-red-200 text-red-700 hover:bg-red-50 transition-colors duration-200"
            >
              <a
                href="https://www.google.com/search?sca_esv=d6b7cd5f9271c9c7&sxsrf=AE3TifNuy-P0AdrYsyWPn16GPkiLnKMwyQ:1749355121336&si=AMgyJEtREmoPL4P1I5IDCfuA8gybfVI2d5Uj7QMwYCZHKDZ-ExB71LX0tMl5rEws_3c3lUUo3xoQ_Z6aLw1lZ9TmHhR3sOAq-sHveQSImTwAIVn4S-7hytJanufWjTAimkFmCyVUmC1R&q=G+album+Reviews&sa=X&ved=2ahUKEwiZmt_U9-CNAxUXS2wGHQ_nJBsQ0bkNegQIIxAE&biw=1512&bih=823&dpr=2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                View Google Reviews
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section - Simplified */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            className="relative isolate overflow-hidden bg-red-900 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="mx-auto max-w-3xl text-center text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Ready to Create Your Perfect Album?
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-center text-lg text-red-100">
              Join thousands of satisfied customers and bring your memories to
              life with our premium photo albums.
            </p>
            <form className="mx-auto mt-10 flex max-w-md gap-x-4">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                autoComplete="email"
                className="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-red-200 focus:outline-2 focus:-outline-offset-2 focus:outline-white sm:text-sm/6 transition-all duration-200"
              />
              <Button
                type="submit"
                className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-red-900 shadow-2xs hover:bg-red-50 transition-colors duration-200"
              >
                Subscribe
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -30px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(30px, 30px) scale(1.05);
          }
        }

        .animate-blob {
          animation: blob 20s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
