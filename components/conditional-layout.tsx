"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AdminLayoutWrapper from "@/components/admin/admin-layout-wrapper";
import { AuthProvider } from "@/components/admin/auth-context";
import { RoleProvider } from "@/components/admin/role-context";

// List of valid routes in the application
const validRoutes = [
  "/",
  "/about",
  "/albums",
  "/gallery",
  "/contact",
  "/privacy-policy",
  "/terms-of-service",
  "/refund-policy",
  "/cookie-preferences",
];

// Shared animation variants
const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1], // Custom cubic-bezier for smoother motion
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

// Fade and scale variant for modal-like pages
const modalTransitionVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.2,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Check if we're in admin routes or special pages
  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";
  const isModalRoute =
    pathname.includes("login") || pathname.includes("signup");

  // Check if this is a valid route or a dynamic route
  const isDynamicRoute = pathname.startsWith("/albums/");
  const isValidRoute = validRoutes.includes(pathname) || isDynamicRoute;
  const is404Page = !isValidRoute && !isAdminRoute;

  // 404 page - standalone layout with page transition
  if (is404Page) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          variants={pageTransitionVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="min-h-screen"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Admin login page - standalone layout with modal-like animation
  if (isAdminLogin || isModalRoute) {
    return (
      <AuthProvider>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            variants={modalTransitionVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </AuthProvider>
    );
  }

  // Admin dashboard pages - use admin layout
  if (isAdminRoute) {
    return (
      <AuthProvider>
        <RoleProvider>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageTransitionVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="min-h-screen"
            >
              <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
            </motion.div>
          </AnimatePresence>
        </RoleProvider>
      </AuthProvider>
    );
  }

  // Main website pages - use website layout
  return (
    <>
      <Header />
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          variants={pageTransitionVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="min-h-[calc(100vh-4rem)]" // Account for header height
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}
