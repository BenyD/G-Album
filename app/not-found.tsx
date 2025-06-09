"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  Camera,
  Users2,
  Mail,
  FileText,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* Red Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 to-red-600" />

      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {/* 404 Section */}
          <motion.div className="mb-12" variants={itemVariants}>
            <div className="relative inline-block">
              <span className="text-[8rem] md:text-[12rem] font-black text-red-500/10 select-none leading-none">
                404
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-4xl md:text-5xl font-bold text-red-600 mt-4">
                  Page Not Found
                </h1>
              </div>
            </div>
            <p className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto">
              We couldn&apos;t find the page you were looking for. Let&apos;s
              get you back on track.
            </p>
          </motion.div>

          {/* Main Actions */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            variants={itemVariants}
          >
            <Button
              asChild
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white min-w-[200px] h-12"
            >
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-600 hover:text-red-600 min-w-[200px] h-12"
            >
              <Link href="/contact">
                <Mail className="mr-2 h-5 w-5" />
                Contact Us
              </Link>
            </Button>
          </motion.div>

          {/* Quick Navigation */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            <Link
              href="/gallery"
              className="group flex items-center p-4 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-xl transition-colors"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border border-slate-200 group-hover:border-red-200">
                <Camera className="h-6 w-6 text-slate-600 group-hover:text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-medium text-slate-900 group-hover:text-red-600">
                  Gallery
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
            </Link>

            <Link
              href="/about"
              className="group flex items-center p-4 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-xl transition-colors"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border border-slate-200 group-hover:border-red-200">
                <Users2 className="h-6 w-6 text-slate-600 group-hover:text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-medium text-slate-900 group-hover:text-red-600">
                  About Us
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
            </Link>

            <Link
              href="/albums"
              className="group flex items-center p-4 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-100 rounded-xl transition-colors"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg border border-slate-200 group-hover:border-red-200">
                <FileText className="h-6 w-6 text-slate-600 group-hover:text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-medium text-slate-900 group-hover:text-red-600">
                  Albums
                </h3>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
            </Link>
          </motion.div>

          {/* Footer Links */}
          <motion.div
            variants={itemVariants}
            className="mt-12 flex items-center justify-center gap-6 text-sm text-slate-500"
          >
            <Link
              href="/privacy-policy"
              className="hover:text-red-600 flex items-center gap-1"
            >
              <ShieldCheck className="h-4 w-4" />
              Privacy Policy
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/terms-of-service"
              className="hover:text-red-600 flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Terms of Service
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
