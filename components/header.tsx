"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Albums", href: "/albums" },
  { name: "Gallery", href: "/gallery" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
    // Initial scroll position check
    const scrollTop = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollTop / docHeight;
    setScrolled(scrollTop > 10);
    setScrollProgress(scrollPercent * 100);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;

      setScrolled(scrollTop > 10);
      setScrollProgress(scrollPercent * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  // Determine if we should show the red version
  const shouldShowRed = scrolled || mobileMenuOpen;

  return (
    <motion.header
      initial={false}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        shouldShowRed
          ? "bg-white/95 backdrop-blur-md shadow-sm py-2"
          : "bg-transparent py-4"
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group relative z-50">
            <div className="relative">
              <Image
                src={
                  shouldShowRed
                    ? "/G Album Logo (RED).png"
                    : "/G Album Logo (WHITE).png"
                }
                alt="G Album Logo"
                width={40}
                height={40}
                className="h-10 w-auto transition-transform duration-500 group-hover:scale-110"
                priority
              />
              <div className="absolute inset-0 bg-red-500 rounded-full opacity-0 group-hover:opacity-20 transition-all duration-500 blur-xl" />
            </div>
            <span
              className={`ml-3 text-xl font-bold transition-colors duration-500 ${
                shouldShowRed ? "text-red-900" : "text-white"
              } group-hover:text-red-600`}
            >
              G Album
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative font-medium transition-all duration-300 group ${
                  shouldShowRed
                    ? "text-slate-700 hover:text-red-600"
                    : "text-white hover:text-white/80"
                }`}
              >
                {item.name}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-500 to-red-700 transition-all duration-300 ${
                    pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            ))}
            <Button
              asChild
              className={`relative overflow-hidden transition-all duration-300 ${
                shouldShowRed
                  ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-sm hover:shadow-md"
                  : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20"
              }`}
            >
              <Link href="/contact">
                <span className="relative z-10 flex items-center">
                  Get in Touch
                  <motion.div
                    className="ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    →
                  </motion.div>
                </span>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            className={`relative z-50 p-3 -mr-3 md:hidden group ${
              mobileMenuOpen
                ? "text-red-600"
                : shouldShowRed
                  ? "text-red-900"
                  : "text-white"
            }`}
          >
            <div className="relative w-6 h-5">
              <motion.span
                initial={false}
                animate={{
                  top: mobileMenuOpen ? "50%" : "0%",
                  rotate: mobileMenuOpen ? 45 : 0,
                  translateY: mobileMenuOpen ? "-50%" : "0%",
                  width: mobileMenuOpen ? "24px" : "16px",
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                }}
                className="absolute right-0 h-0.5 bg-current transform origin-center"
              />
              <motion.span
                initial={false}
                animate={{
                  opacity: mobileMenuOpen ? 0 : 1,
                  width: "24px",
                  x: mobileMenuOpen ? 8 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                }}
                className="absolute top-1/2 right-0 h-0.5 bg-current -translate-y-1/2"
              />
              <motion.span
                initial={false}
                animate={{
                  bottom: mobileMenuOpen ? "50%" : "0%",
                  rotate: mobileMenuOpen ? -45 : 0,
                  translateY: mobileMenuOpen ? "50%" : "0%",
                  width: mobileMenuOpen ? "24px" : "20px",
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                }}
                className="absolute right-0 h-0.5 bg-current transform origin-center"
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence mode="wait">
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
              />

              {/* Menu Content */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 25,
                }}
                className="fixed inset-x-4 top-[4.5rem] p-6 rounded-2xl bg-white shadow-2xl z-40 md:hidden overflow-hidden"
                style={{
                  maxHeight: "calc(100vh - 6rem)",
                  willChange: "transform, opacity",
                }}
              >
                <div className="flex flex-col h-full">
                  {/* Navigation Links */}
                  <div className="flex-1 overflow-y-auto -mx-2 px-2">
                    <nav className="space-y-1">
                      {navigation.map((item, i) => (
                        <motion.div
                          key={item.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: i * 0.1,
                            ease: "easeOut",
                          }}
                        >
                          <Link
                            href={item.href}
                            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 group ${
                              pathname === item.href
                                ? "bg-red-50 text-red-600"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{item.name}</span>
                            <motion.span
                              initial={false}
                              animate={{
                                x: pathname === item.href ? 0 : -8,
                                opacity: pathname === item.href ? 1 : 0,
                              }}
                              className="text-red-600"
                            >
                              →
                            </motion.span>
                          </Link>
                        </motion.div>
                      ))}
                    </nav>
                  </div>

                  {/* Action Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="pt-6 mt-6 border-t border-slate-200"
                  >
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-sm hover:shadow-md"
                    >
                      <Link
                        href="/contact"
                        className="flex items-center justify-center"
                      >
                        Get in Touch
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                          className="ml-2"
                        >
                          →
                        </motion.span>
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Scroll Progress Bar - Only show if not on gallery page */}
      {pathname !== "/gallery" && (
        <div className="absolute bottom-0 left-0 w-full h-0.5">
          <motion.div
            className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700"
            style={{
              width: `${scrollProgress}%`,
              boxShadow:
                "0 0 10px rgba(239, 68, 68, 0.5), 0 0 20px rgba(239, 68, 68, 0.3)",
            }}
          >
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-r from-transparent to-white/20 blur-sm" />
          </motion.div>
        </div>
      )}
    </motion.header>
  );
}
