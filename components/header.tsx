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

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  return (
    <motion.header
      initial={false}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-2"
          : "bg-transparent py-4"
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <Image
                src={
                  scrolled
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
                scrolled ? "text-red-900" : "text-white"
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
                  scrolled
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
                scrolled
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
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className={`relative z-50 p-3 -mr-3 transition-colors duration-300 ${
                mobileMenuOpen
                  ? "text-red-600"
                  : scrolled
                  ? "text-red-900 hover:text-red-700"
                  : "text-white hover:text-white/80"
              }`}
            >
              <div className="w-6 h-6 relative">
                <span
                  className={`absolute left-0 top-1/2 w-6 h-0.5 transform transition-all duration-300 ${
                    mobileMenuOpen
                      ? "rotate-45 bg-current"
                      : "-translate-y-1.5 bg-current"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                    mobileMenuOpen
                      ? "opacity-0 scale-0"
                      : "opacity-100 scale-100"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 w-6 h-0.5 transform transition-all duration-300 ${
                    mobileMenuOpen
                      ? "-rotate-45 bg-current"
                      : "translate-y-1.5 bg-current"
                  }`}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="fixed inset-0 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Menu Content */}
              <motion.div
                id="mobile-menu"
                role="dialog"
                aria-modal="true"
                className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  opacity: { duration: 0.2 },
                }}
              >
                <div className="flex flex-col h-full overflow-y-auto pb-safe">
                  <div className="flex-1 px-6 py-20 space-y-6">
                    {navigation.map((item, i) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: i * 0.05,
                        }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block py-4 text-lg font-medium transition-colors relative group ${
                            pathname === item.href
                              ? "text-red-600"
                              : "text-slate-700 hover:text-red-600"
                          }`}
                        >
                          {item.name}
                          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                  <motion.div
                    className="p-6 bg-slate-50 border-t border-slate-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-sm hover:shadow-md"
                    >
                      <Link
                        href="/contact"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get in Touch
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Scroll Progress Bar */}
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
    </motion.header>
  );
}
