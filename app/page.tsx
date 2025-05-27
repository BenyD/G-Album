"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Integrated Navbar */}
      <section className="relative min-h-[90vh] bg-linear-to-br from-red-600 to-red-900 text-white overflow-hidden">
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

        <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center gap-12 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto space-y-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xs border border-white/20 rounded-full text-white/90 text-sm font-medium mb-4"
              variants={fadeInUp}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="w-2 h-2 bg-red-300 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
              <span>Premium Photo Albums Since 2018</span>
              <motion.div
                className="w-2 h-2 bg-red-300 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
            </motion.div>
            <motion.h1
              className="text-4xl md:text-6xl font-bold leading-tight"
              variants={fadeInUp}
            >
              Crafting Memories Into{" "}
              <span className="text-red-200">Beautiful Albums</span>
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-red-100 max-w-xl mx-auto"
              variants={fadeInUp}
            >
              Since 2018, We&apos;ve been creating affordable, professional
              photo albums that exceed expectations.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pt-4 justify-center"
              variants={fadeInUp}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-white text-red-600 hover:bg-red-50"
                >
                  View Our Gallery
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white bg-white/10 backdrop-blur-xs hover:bg-white/20 hover:border-red-200 transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center">
                    Contact Us
                    <MessageSquare className="ml-2 h-4 w-4" />
                  </span>
                  <span className="absolute inset-0 bg-linear-to-r from-red-500/10 to-red-600/10 rounded-md blur-xs"></span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative w-full max-w-2xl mx-auto mt-8"
            variants={scaleIn}
            initial="initial"
            animate="animate"
          >
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/wedding-photo-album.png"
                alt="G Album showcase"
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Glassmorphism effect */}
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-white/20 backdrop-blur-md rounded-lg -z-10 border border-white/30"></div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-linear-to-b from-white to-red-50">
        <div className="container mx-auto px-4">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-16 text-red-900"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our Services
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
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
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-16 h-16 bg-linear-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <service.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 text-red-900">
                  {service.title}
                </h3>
                <p className="text-slate-600">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Albums */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="flex flex-col md:flex-row justify-between items-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-red-900">
              Featured Albums
            </h2>
            <Link
              href="/albums"
              className="text-red-600 hover:text-red-700 font-medium flex items-center mt-4 md:mt-0"
            >
              View All Albums
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { title: "Wedding Collection", desc: "Elegant wedding memories" },
              { title: "Family Portraits", desc: "Timeless family moments" },
              {
                title: "Anniversary Special",
                desc: "Celebrating love stories",
              },
            ].map((album, index) => (
              <motion.div
                key={index}
                className="group"
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative overflow-hidden rounded-xl shadow-lg">
                  <div className="relative aspect-4/5">
                    <Image
                      src={`/professional-team.png?height=600&width=500&query=professional ${album.title} album`}
                      alt={album.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  {/* Glassmorphism overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-red-900/80 via-red-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <h3 className="text-xl font-bold text-white">
                      {album.title}
                    </h3>
                    <p className="text-red-100 mb-4">{album.desc}</p>
                    <Button
                      size="sm"
                      className="bg-white text-red-600 hover:bg-red-50"
                    >
                      View Album
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-linear-to-br from-red-50 to-white relative overflow-hidden">
        {/* Background blur elements */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 rounded-full bg-red-200 opacity-30 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-red-100 opacity-20 blur-3xl"
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 3,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-red-900">
              What Our Clients Say
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Real reviews from our satisfied customers on Google Reviews
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                name: "Priya & Rahul Sharma",
                role: "Wedding Couple",
                stars: 5,
                quote:
                  "G Album created the most beautiful wedding album for us. The quality and attention to detail exceeded our expectations! Every page tells our story perfectly.",
                date: "2 weeks ago",
              },
              {
                name: "Ananya Patel",
                role: "Family Portrait",
                stars: 5,
                quote:
                  "Our family portraits look amazing in the album. The team was professional and delivered exactly what we wanted.",
                date: "1 month ago",
              },
              {
                name: "Vikram Mehta",
                role: "Anniversary Celebration",
                stars: 5,
                quote:
                  "The anniversary album was a perfect gift for my wife. The craftsmanship and design are truly exceptional. Highly recommend G Album!",
                date: "3 weeks ago",
              },
              {
                name: "Sneha Gupta",
                role: "Baby Photoshoot",
                stars: 5,
                quote:
                  "They captured our baby's precious moments beautifully. The album quality is outstanding and will be treasured forever.",
                date: "1 week ago",
              },
              {
                name: "Rajesh Kumar",
                role: "Corporate Event",
                stars: 4,
                quote:
                  "Professional service for our company event album. Great attention to detail and timely delivery.",
                date: "2 months ago",
              },
              {
                name: "Kavya & Arjun",
                role: "Pre-wedding Shoot",
                stars: 5,
                quote:
                  "Amazing work on our pre-wedding album! The team understood our vision perfectly and delivered beyond expectations. The album design is simply stunning.",
                date: "1 month ago",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className={`bg-white p-6 rounded-xl shadow-lg border border-red-100 relative hover:shadow-xl transition-shadow ${
                  index === 0 || index === 3 ? "md:row-span-2" : ""
                } ${index === 2 || index === 5 ? "lg:row-span-2" : ""}`}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3 }}
              >
                {/* Quote mark */}
                <div className="absolute top-4 right-4 text-4xl text-red-100 font-serif">
                  &quot;
                </div>

                {/* Star Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, starIndex) => (
                    <motion.div
                      key={starIndex}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: starIndex * 0.1 }}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          starIndex < testimonial.stars
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </motion.div>
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
                    <motion.div
                      className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm"
                      whileHover={{ scale: 1.1 }}
                    >
                      {testimonial.name.charAt(0)}
                    </motion.div>
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

                {/* Google Reviews Badge */}
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
          </motion.div>

          {/* Google Reviews CTA */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-slate-600 mb-4">See more reviews on Google</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <a
                  href="https://www.google.com/search?q=G+Album+reviews"
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="bg-white py-16 sm:py-24"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            className="relative isolate overflow-hidden bg-red-900 px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <motion.h2
              className="mx-auto max-w-3xl text-center text-4xl font-semibold tracking-tight text-white sm:text-5xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Ready to Create Your Perfect Album?
            </motion.h2>
            <motion.p
              className="mx-auto mt-6 max-w-lg text-center text-lg text-red-100"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Join thousands of satisfied customers and bring your memories to
              life with our premium photo albums.
            </motion.p>
            <motion.form
              className="mx-auto mt-10 flex max-w-md gap-x-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
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
                className="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-red-200 focus:outline-2 focus:-outline-offset-2 focus:outline-white sm:text-sm/6"
              />
              <motion.button
                type="submit"
                className="flex-none rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-red-900 shadow-2xs hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </motion.form>
            <svg
              viewBox="0 0 1024 1024"
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -z-10 size-256 -translate-x-1/2"
            >
              <circle
                r={512}
                cx={512}
                cy={512}
                fill="url(#red-gradient)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient
                  r={1}
                  cx={0}
                  cy={0}
                  id="red-gradient"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="translate(512 512) rotate(90) scale(512)"
                >
                  <stop stopColor="#DC2626" />
                  <stop offset={1} stopColor="#EF4444" stopOpacity={0} />
                </radialGradient>
              </defs>
            </svg>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
