"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { CookieManager, CookiePreferences } from "@/utils/cookie-manager";

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = CookieManager.hasAcceptedCookies();
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    CookieManager.setPreferences(preferences);
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    const preferences: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    CookieManager.setPreferences(preferences);
    setIsVisible(false);
  };

  const handleCustomize = () => {
    window.location.href = "/cookie-preferences";
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
      >
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 pr-4 max-w-full">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                We value your privacy
              </h3>
              <p className="text-sm text-gray-600 mb-1 sm:mb-2">
                We use cookies and similar technologies to provide you with a
                better experience on our website, analyze site traffic, and
                secure our services in accordance with our{" "}
                <Link
                  href="/privacy-policy"
                  className="text-red-600 hover:text-red-700 underline"
                >
                  Privacy Policy
                </Link>
                . You can manage your preferences at any time.
              </p>
              <p className="text-xs text-gray-500">
                As per Indian Information Technology Rules, 2011 and Information
                Technology (Reasonable Security Practices and Procedures and
                Sensitive Personal Data or Information) Rules, 2011.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:min-w-[300px]">
              <button
                onClick={handleAcceptNecessary}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors active:bg-gray-300"
              >
                Necessary Only
              </button>
              <button
                onClick={handleCustomize}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-red-600 border border-red-600 hover:bg-red-50 rounded-md transition-colors active:bg-red-100"
              >
                Customize
              </button>
              <button
                onClick={handleAcceptAll}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors active:bg-red-800"
              >
                Accept All
              </button>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 active:bg-gray-200"
              aria-label="Close cookie banner"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieBanner;
