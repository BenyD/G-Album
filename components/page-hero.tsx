"use client";

import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  hasCustomBackground?: boolean;
}

export default function PageHero({
  title,
  subtitle,
  children,
  className = "",
  hasCustomBackground = false,
}: PageHeroProps) {
  return (
    <section
      className={`relative bg-linear-to-br from-red-600 to-red-900 text-white overflow-hidden -mt-16 ${className}`}
    >
      {!hasCustomBackground && (
        <>
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
        </>
      )}

      <div className="container mx-auto px-4 relative z-10 pt-8">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
          {subtitle && <p className="text-xl text-red-100">{subtitle}</p>}
          {children}
        </motion.div>
      </div>
    </section>
  );
}
