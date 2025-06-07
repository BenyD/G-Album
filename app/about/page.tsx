"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Truck, Camera, Clock, MessageSquare } from "lucide-react";
import PageHero from "@/components/page-hero";
import { useState, useEffect } from "react";

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

const scaleIn = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.25, ease: "easeOut" },
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
  const [techRef, isTechInView] = useInView();

  // Sample team members
  const teamMembers = [
    {
      name: "Rahul Sharma",
      role: "Founder & Creative Director",
      image: "/professional-indian-man-portrait.png",
      bio: "With over 15 years of experience in photography and album design, Rahul founded G Album with a vision to create affordable yet premium quality photo albums.",
    },
    {
      name: "Priya Patel",
      role: "Lead Designer",
      image: "/professional-indian-woman-portrait.png",
      bio: "Priya brings her artistic vision and attention to detail to every album design, ensuring each one tells a unique story.",
    },
    {
      name: "Vikram Singh",
      role: "Production Manager",
      image: "/professional-indian-man-portrait-2.png",
      bio: "Vikram oversees our production process, ensuring that every album meets our high standards of quality and craftsmanship.",
    },
    {
      name: "Ananya Desai",
      role: "Customer Relations",
      image: "/placeholder-aldzd.png",
      bio: "Ananya is dedicated to providing exceptional customer service, guiding clients through the entire album creation process.",
    },
  ];

  // Sample technology/machines for bento grid
  const technologies = [
    {
      name: "HP Indigo Digital Press",
      title: "Professional Printing",
      description:
        "State-of-the-art digital printing technology delivering vibrant, high-resolution images with exceptional color accuracy and detail.",
      image: "/hp-indigo-press.png",
      tags: ["High Quality", "Color Accuracy", "Professional Grade"],
    },
    {
      name: "Automatic Binding Machine",
      title: "Precision Binding",
      description:
        "Advanced binding equipment ensuring durability and perfect finishing for every album we create.",
      image: "/placeholder-8i1yi.png",
      tags: ["Durability", "Precision", "Quality Finish"],
    },
    {
      name: "UV Coating System",
      title: "Protection & Enhancement",
      description:
        "Advanced coating technology that protects images from fading while enhancing colors and providing a premium feel.",
      image: "/uv-coating-machine.png",
      tags: ["Protection", "Enhancement", "Longevity"],
    },
    {
      name: "Laser Cutting Machine",
      title: "Custom Designs",
      description:
        "Precision cutting technology for custom album covers and intricate design elements that make each album unique.",
      image:
        "/placeholder.svg?height=600&width=800&query=laser cutting machine for albums",
      tags: ["Precision", "Customization", "Innovation"],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen pt-16">
      <PageHero
        title="About G Album"
        subtitle="Crafting memories into beautiful albums since 2018"
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
                Our Story
              </h2>
              <div className="space-y-4 text-slate-700">
                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate={isAboutInView ? "animate" : "initial"}
                  className="space-y-4"
                >
                  <motion.p variants={fadeInUp}>
                    Since 2018, G Album has been crafting affordable,
                    professional photo albums, striving consistently to meet and
                    exceed the expectations of our customers.
                  </motion.p>
                  <motion.p variants={fadeInUp}>
                    Our primary focus has always been ensuring our clients
                    experience top-tier quality and contentment from our
                    offerings.
                  </motion.p>
                  <motion.p variants={fadeInUp}>
                    Additionally, we consistently leverage advanced, modern
                    technology to fulfill the diverse requirements of our
                    customers.
                  </motion.p>
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
                  src="/placeholder.svg?height=600&width=800&query=photo album workshop with people working"
                  alt="G Album workshop"
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

      {/* Technology We Use - Bento Grid */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
          <motion.div
            ref={techRef}
            initial={{ opacity: 0, y: 10 }}
            animate={
              isTechInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
            }
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-base/7 font-semibold text-red-600">
              Advanced Technology
            </h2>
            <p className="mt-2 max-w-lg text-4xl font-semibold tracking-tight text-pretty text-gray-950 sm:text-5xl">
              Everything we use to craft perfect albums
            </p>
          </motion.div>
          <motion.div
            className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Technology cards with optimized animations */}
            <motion.div
              className="relative lg:col-span-4"
              variants={fadeInUp}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-4xl lg:rounded-tl-4xl" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)] lg:rounded-tl-[calc(2rem+1px)]">
                <img
                  alt={technologies[0].name}
                  src={technologies[0].image || "/placeholder.svg"}
                  className="h-80 object-cover object-center"
                />
                <div className="p-10 pt-4">
                  <h3 className="text-sm/4 font-semibold text-red-600">
                    {technologies[0].name}
                  </h3>
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                    {technologies[0].title}
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-gray-600">
                    {technologies[0].description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {technologies[0].tags.map((tag, i) => (
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
              <div className="pointer-events-none absolute inset-px rounded-lg shadow-xs ring-1 ring-black/5 max-lg:rounded-t-4xl lg:rounded-tl-4xl" />
            </motion.div>

            {/* Other technology cards */}
            {technologies.slice(1).map((tech, index) => (
              <motion.div
                key={index}
                className={`relative ${
                  index === 0
                    ? "lg:col-span-2"
                    : index === 1
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
                      ? "lg:rounded-tr-4xl"
                      : index === 1
                      ? "lg:rounded-bl-4xl"
                      : "max-lg:rounded-b-4xl lg:rounded-br-4xl"
                  }`}
                />
                <div
                  className={`relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] ${
                    index === 0
                      ? "lg:rounded-tr-[calc(2rem+1px)]"
                      : index === 1
                      ? "lg:rounded-bl-[calc(2rem+1px)]"
                      : "max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-br-[calc(2rem+1px)]"
                  }`}
                >
                  <img
                    alt={tech.name}
                    src={tech.image || "/placeholder.svg"}
                    className="h-80 object-cover object-center"
                  />
                  <div className="p-10 pt-4">
                    <h3 className="text-sm/4 font-semibold text-red-600">
                      {tech.name}
                    </h3>
                    <p className="mt-2 text-lg font-medium tracking-tight text-gray-950">
                      {tech.title}
                    </p>
                    <p className="mt-2 max-w-lg text-sm/6 text-gray-600">
                      {tech.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {tech.tags.map((tag, i) => (
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
                      ? "lg:rounded-tr-4xl"
                      : index === 1
                      ? "lg:rounded-bl-4xl"
                      : "max-lg:rounded-b-4xl lg:rounded-br-4xl"
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
            Why Choose Us
          </motion.h2>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {/* Feature cards with optimized animations */}
            {[
              {
                icon: Truck,
                title: "Delivery Around India",
                description:
                  "Across all working days, we use reliable carriers to deliver our products throughout India, ensuring your package reaches you promptly.",
              },
              {
                icon: Camera,
                title: "Latest Technology",
                description:
                  "We utilize advanced industrial tech to construct expert-level albums. We also deploy potent printing machines for superior image clarity.",
              },
              {
                icon: Clock,
                title: "Handcrafted Pads",
                description:
                  "Each of our albums is meticulously handcrafted, showcasing inventive patterns and securing the longevity and durability of all your cherished pages.",
              },
              {
                icon: MessageSquare,
                title: "Customer Service",
                description:
                  "Our dedication is towards supplying our clients with superior service, leading them throughout the entire journey, guaranteeing their gratification.",
              },
            ].map((feature, index) => (
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
                  <feature.icon className="h-8 w-8 text-white" />
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
              We're a passionate group of professionals dedicated to crafting
              the perfect photo albums that preserve your most cherished
              memories with exceptional quality and attention to detail.
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
            {teamMembers.map((member, index) => (
              <motion.li key={member.name} variants={fadeInUp}>
                <motion.div
                  className="mx-auto"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                >
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="mx-auto size-32 rounded-full object-cover border-2 border-red-100"
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
