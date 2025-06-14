"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import Image from "next/image";
import PageHero from "@/components/page-hero";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { contactConfig } from "@/config/contact";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      // Show success toast
      toast.success("Message sent successfully! Redirecting to WhatsApp...");

      // Clear form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      });

      // Redirect to WhatsApp after a short delay
      setTimeout(() => {
        window.location.href = data.whatsappUrl;
      }, 1500);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Update the contact info section to use the config
  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: [
        contactConfig.whatsapp.number,
        ...contactConfig.whatsapp.alternateNumbers,
      ],
    },
    {
      icon: Mail,
      title: "Email",
      details: [contactConfig.email.primary, contactConfig.email.alternate],
    },
    {
      icon: MapPin,
      title: "Address",
      details: [
        `${contactConfig.address.line1}, ${contactConfig.address.line2}`,
        `${contactConfig.address.city}, ${contactConfig.address.state}, ${contactConfig.address.country}`,
      ],
    },
  ];

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
                {contactInfo.map((contact, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start p-6 bg-gradient-to-br from-white to-red-50 rounded-xl shadow-md border border-red-100 hover:shadow-lg transition-all duration-300"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mr-4 shrink-0 shadow-md"
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <contact.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-red-900 mb-2">
                        {contact.title}
                      </h3>
                      {contact.details.map((detail, i) => (
                        <a
                          key={i}
                          href={
                            contact.title === "Phone"
                              ? `tel:${detail}`
                              : contact.title === "Email"
                                ? `mailto:${detail}`
                                : "#"
                          }
                          className="block text-slate-600 hover:text-red-600 transition-colors duration-200 mb-1"
                        >
                          {detail}
                        </a>
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
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.655961843812!2d80.27406069999999!3d13.057557399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526626d7cad0f5%3A0x848ef8cffda3a829!2sG%20album!5e0!3m2!1sen!2sin!4v1749355571128!5m2!1sen!2sin"
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
                <p className="text-slate-600 mb-8">
                  Visit our creative studio where we design and craft beautiful
                  photo albums.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    {
                      src: "/images/contact/contact_inside-1.jpg",
                      alt: "G Album Office Reception",
                      caption: "Modern Reception Area",
                    },
                    {
                      src: "/images/contact/contact_outside-1.jpg",
                      alt: "G Album Design Studio",
                      caption: "Studio Entrance",
                    },
                    {
                      src: "/images/contact/contact_outside-2.jpg",
                      alt: "G Album Printing Area",
                      caption: "Creative Workspace",
                    },
                    {
                      src: "/images/contact/contact_inside-2.jpeg",
                      alt: "G Album Showroom",
                      caption: "Album Showroom",
                    },
                  ].map((image, index) => (
                    <motion.div
                      key={index}
                      className="group relative aspect-square rounded-xl overflow-hidden shadow-md"
                      variants={fadeInUp}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        loading={index < 2 ? "eager" : "lazy"}
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-sm font-medium">{image.caption}</p>
                      </div>
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
                    className="text-2xl md:text-3xl font-bold mb-2 text-red-900"
                    variants={fadeInUp}
                  >
                    Send us a message
                  </motion.h2>
                  <motion.p className="text-slate-600 mb-8" variants={fadeInUp}>
                    Fill out the form below and we&apos;ll get back to you as
                    soon as possible.
                  </motion.p>

                  <motion.form
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    onSubmit={handleSubmit}
                  >
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      variants={fadeInUp}
                    >
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-slate-700 font-medium"
                        >
                          Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          className="border-red-200 focus-visible:ring-red-500 transition-all duration-200 hover:border-red-300"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-slate-700 font-medium"
                        >
                          Email (Optional)
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email"
                          className="border-red-200 focus-visible:ring-red-500 transition-all duration-200 hover:border-red-300"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </motion.div>

                    <motion.div className="space-y-2" variants={fadeInUp}>
                      <Label
                        htmlFor="phone"
                        className="text-slate-700 font-medium"
                      >
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        placeholder="Your phone number"
                        className="border-red-200 focus-visible:ring-red-500 transition-all duration-200 hover:border-red-300"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </motion.div>

                    <motion.div className="space-y-2" variants={fadeInUp}>
                      <Label
                        htmlFor="message"
                        className="text-slate-700 font-medium"
                      >
                        Message
                      </Label>
                      <textarea
                        id="message"
                        rows={4}
                        placeholder="Your message"
                        className="w-full rounded-md border border-red-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 hover:border-red-300 resize-none"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                      ></textarea>
                    </motion.div>

                    <motion.div
                      variants={fadeInUp}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2.5 transition-all duration-200 shadow-md hover:shadow-lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </div>
                        ) : (
                          <>
                            Send to WhatsApp
                            <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
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
