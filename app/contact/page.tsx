"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import Image from "next/image";
import PageHero from "@/components/page-hero";
import { useState, useEffect } from "react";

// Optimized animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: "easeOut" },
};

const fadeInLeft = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.25, ease: "easeOut" },
};

const fadeInRight = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0 },
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

// Add loading state detection
const useHasLoaded = () => {
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  return hasLoaded;
};

export default function ContactPage() {
  const hasLoaded = useHasLoaded();

  return (
    <div className="flex flex-col min-h-screen pt-16">
      <PageHero
        title="Contact Us"
        subtitle="We'd love to hear from you. Get in touch with our team."
        className="py-20"
      />

      {/* Contact Information and Form */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              variants={fadeInLeft}
              initial="initial"
              animate="animate"
            >
              <motion.h2
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                className="text-2xl md:text-3xl font-bold mb-6 text-red-900"
              >
                Get In Touch
              </motion.h2>

              {/* Contact Info Cards */}
              <motion.div
                className="space-y-6 mb-8"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {[
                  {
                    icon: Phone,
                    title: "Phone",
                    details: ["+91 1234567890", "+91 9876543210"],
                  },
                  {
                    icon: Mail,
                    title: "Email",
                    details: ["contact@galbum.com", "support@galbum.com"],
                  },
                  {
                    icon: MapPin,
                    title: "Address",
                    details: ["123 Album Street", "Mumbai, Maharashtra, India"],
                  },
                ].map((contact, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start p-6 bg-linear-to-br from-white to-red-50 rounded-xl shadow-md border border-red-100"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-linear-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mr-4 shrink-0"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <contact.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-lg text-red-900 mb-1">
                        {contact.title}
                      </h3>
                      {contact.details.map((detail, i) => (
                        <p key={i} className="text-slate-600">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Google Map */}
              <motion.div
                className="rounded-xl overflow-hidden shadow-lg border border-red-100 h-[450px] relative mb-12"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241317.11609823277!2d72.74109995709657!3d19.08219783958221!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c6306644edc1%3A0x5da4ed8f8d648c69!2sMumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1653651111548!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="G Album Location"
                  className="absolute inset-0"
                ></iframe>
              </motion.div>

              {/* Office Photos Grid */}
              <motion.div
                className="mt-12"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-red-900">
                  Our Office
                </h2>
                <p className="text-slate-600 mb-6">
                  Visit our creative studio where we design and craft beautiful
                  photo albums.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    {
                      src: "/modern-photo-studio-reception.png",
                      alt: "G Album Office Reception",
                    },
                    {
                      src: "/placeholder.svg?height=400&width=400&query=photo album design studio workspace",
                      alt: "G Album Design Studio",
                    },
                    {
                      src: "/placeholder.svg?height=400&width=400&query=photo album printing equipment",
                      alt: "G Album Printing Area",
                    },
                    {
                      src: "/placeholder.svg?height=600&width=800&query=photo album showroom with samples",
                      alt: "G Album Showroom",
                      className: "md:col-span-2",
                    },
                    {
                      src: "/placeholder.svg?height=400&width=400&query=photo album binding and finishing area",
                      alt: "G Album Finishing Area",
                    },
                  ].map((image, index) => (
                    <motion.div
                      key={index}
                      className={`relative aspect-square rounded-lg overflow-hidden shadow-md ${
                        image.className || ""
                      }`}
                      variants={fadeInUp}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover"
                        loading={index < 2 ? "eager" : "lazy"}
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeInRight}
              initial="initial"
              animate="animate"
            >
              <div className="bg-white rounded-xl shadow-lg p-8 border border-red-100 overflow-hidden sticky top-24">
                {/* Glassmorphism effect */}
                {hasLoaded && (
                  <>
                    <motion.div
                      className="absolute -top-20 -right-20 w-40 h-40 bg-red-100 rounded-full opacity-50 blur-3xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.7, 0.5],
                      }}
                      transition={{
                        duration: 6,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.div
                      className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-50 rounded-full opacity-50 blur-3xl"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        delay: 2,
                      }}
                    />
                  </>
                )}

                <div className="relative z-10">
                  <motion.h2
                    className="text-2xl md:text-3xl font-bold mb-6 text-red-900"
                    variants={fadeInUp}
                  >
                    Send us a message
                  </motion.h2>
                  <motion.p className="text-slate-600 mb-6" variants={fadeInUp}>
                    Fill out the form below and we'll get back to you as soon as
                    possible.
                  </motion.p>

                  <motion.form
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      variants={fadeInUp}
                    >
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700">
                          Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          className="border-red-200 focus-visible:ring-red-500"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email"
                          className="border-red-200 focus-visible:ring-red-500"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div className="space-y-2" variants={fadeInUp}>
                      <Label htmlFor="phone" className="text-slate-700">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        placeholder="Your phone number"
                        className="border-red-200 focus-visible:ring-red-500"
                      />
                    </motion.div>

                    <motion.div className="space-y-2" variants={fadeInUp}>
                      <Label htmlFor="subject" className="text-slate-700">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        placeholder="What is this regarding?"
                        className="border-red-200 focus-visible:ring-red-500"
                        required
                      />
                    </motion.div>

                    <motion.div className="space-y-2" variants={fadeInUp}>
                      <Label htmlFor="message" className="text-slate-700">
                        Message
                      </Label>
                      <textarea
                        id="message"
                        rows={4}
                        placeholder="Your message"
                        className="w-full rounded-md border border-red-200 p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-red-500"
                        required
                      ></textarea>
                    </motion.div>

                    <motion.div
                      variants={fadeInUp}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                      >
                        Send to WhatsApp
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </motion.form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
