"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Truck, Camera, Clock, MessageSquare } from "lucide-react";
import PageHero from "@/components/page-hero";
import { useState, useEffect } from "react";
import { aboutConfig } from "@/config/about";

// Optimized animation variants with reduced motion support
const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
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
        rootMargin: "50px",
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

export default function AboutPage() {
  const hasLoaded = useHasLoaded();
  const [aboutRef, isAboutInView] = useInView();

  // Use team members from config
  const teamMembers = aboutConfig.team.members;

  return (
    <div className="flex flex-col min-h-screen pt-16">
      <PageHero
        title={aboutConfig.hero.title}
        subtitle={aboutConfig.hero.subtitle}
        className="py-20"
      />

      {/* About Us and History */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              ref={aboutRef}
              initial={{ opacity: 0, x: -10 }}
              animate={
                isAboutInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }
              }
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-red-900">
                {aboutConfig.story.title}
              </h2>
              <div className="space-y-4 text-slate-700">
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate={isAboutInView ? "animate" : "initial"}
                  className="space-y-4"
                >
                  {aboutConfig.story.paragraphs.map((paragraph, index) => (
                    <motion.p key={index} variants={fadeInUp}>
                      {paragraph}
                    </motion.p>
                  ))}
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 10 }}
              animate={
                isAboutInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }
              }
              transition={{ duration: 0.4 }}
            >
              <motion.div
                className="relative rounded-lg overflow-hidden shadow-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src="/images/about/about-image.jpeg"
                  alt="G Album Team"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                  loading="eager"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </motion.div>
              {hasLoaded && isAboutInView && (
                <motion.div
                  className="absolute -bottom-6 -left-6 w-48 h-48 bg-linear-to-br from-red-200 to-red-300 rounded-lg -z-10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Process - Bento Grid */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <h2 className="text-base/7 font-semibold text-red-600">
              {aboutConfig.process.title}
            </h2>
            <p className="mt-2 max-w-lg text-4xl font-semibold tracking-tight text-pretty text-gray-950 sm:text-5xl">
              {aboutConfig.process.subtitle}
            </p>
          </motion.div>
          <motion.div
            className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {aboutConfig.process.steps.map((process, index) => (
              <motion.div
                key={index}
                className={`relative ${
                  index === 0
                    ? "lg:col-span-4"
                    : index === 1
                      ? "lg:col-span-2"
                      : index === 2
                        ? "lg:col-span-2"
                        : "lg:col-span-4"
                }`}
                variants={fadeInUp}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`absolute inset-px rounded-lg bg-white ${
                    index === 0
                      ? "lg:rounded-tl-4xl"
                      : index === 1
                        ? "lg:rounded-tr-4xl"
                        : index === 2
                          ? "lg:rounded-bl-4xl"
                          : "lg:rounded-br-4xl"
                  }`}
                />
                <div
                  className={`relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] ${
                    index === 0
                      ? "lg:rounded-tl-[calc(2rem+1px)]"
                      : index === 1
                        ? "lg:rounded-tr-[calc(2rem+1px)]"
                        : index === 2
                          ? "lg:rounded-bl-[calc(2rem+1px)]"
                          : "lg:rounded-br-[calc(2rem+1px)]"
                  }`}
                >
                  <Image
                    alt={process.name}
                    src={process.image || "/placeholder.svg"}
                    className="h-80 object-cover object-center"
                    width={800}
                    height={320}
                    priority={index < 2}
                  />
                  <div className="p-10 pt-4">
                    <h3 className="text-sm/4 font-semibold text-red-600">
                      {process.name}
                    </h3>
                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                      {process.title}
                    </p>
                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600">
                      {process.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {process.tags.map((tag, i) => (
                        <motion.span
                          key={i}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
                <div
                  className={`pointer-events-none absolute inset-px rounded-lg shadow-xs ring-1 ring-black/5 ${
                    index === 0
                      ? "lg:rounded-tl-4xl"
                      : index === 1
                        ? "lg:rounded-tr-4xl"
                        : index === 2
                          ? "lg:rounded-bl-4xl"
                          : "lg:rounded-br-4xl"
                  }`}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Optimize background animations */}
        <motion.div
          className="absolute top-20 right-20 w-72 h-72 rounded-full bg-red-100 opacity-30 blur-3xl"
          animate={{
            x: [0, 20, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-red-50 opacity-20 blur-3xl"
          animate={{
            x: [0, -15, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-16 text-red-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            {aboutConfig.whyChooseUs.title}
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {aboutConfig.whyChooseUs.features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-linear-to-br from-white to-red-50 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-red-100"
                variants={fadeInUp}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="w-16 h-16 bg-linear-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6"
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.4 }}
                >
                  {feature.icon === "Truck" && (
                    <Truck className="h-8 w-8 text-white" />
                  )}
                  {feature.icon === "Camera" && (
                    <Camera className="h-8 w-8 text-white" />
                  )}
                  {feature.icon === "Clock" && (
                    <Clock className="h-8 w-8 text-white" />
                  )}
                  {feature.icon === "MessageSquare" && (
                    <MessageSquare className="h-8 w-8 text-white" />
                  )}
                </motion.div>
                <h3 className="text-xl font-semibold mb-3 text-red-900">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-20 bg-linear-to-b from-red-50 to-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <h2 className="text-4xl font-semibold tracking-tight text-pretty text-red-900 sm:text-5xl">
              Meet Our Team
            </h2>
            <p className="mt-6 text-lg/8 text-slate-600">
              We&apos;re a passionate group of professionals dedicated to
              crafting the perfect photo albums that preserve your most
              cherished memories with exceptional quality and attention to
              detail.
            </p>
          </motion.div>
          <motion.ul
            role="list"
            className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 text-center sm:grid-cols-3 md:grid-cols-4 lg:mx-0 lg:max-w-none"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {teamMembers.map((member) => (
              <motion.li key={member.name} variants={fadeInUp}>
                <motion.div
                  className="mx-auto"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    className="mx-auto size-32 rounded-full object-cover border-2 border-red-100"
                    width={128}
                    height={128}
                    loading="lazy"
                    unoptimized
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/G Album Logo (RED).png";
                    }}
                  />
                </motion.div>
                <h3 className="mt-6 text-base/7 font-semibold tracking-tight text-red-900">
                  {member.name}
                </h3>
                <p className="text-sm/6 text-red-600">{member.role}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>
    </div>
  );
}
