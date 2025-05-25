"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Albums", href: "/albums" },
  { name: "Gallery", href: "/gallery" },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = scrollTop / docHeight

      setScrolled(scrollTop > 10)
      setScrollProgress(scrollPercent * 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95" : "bg-gradient-to-r from-red-600 to-red-800"
      }`}
    >
      <nav className="container mx-auto px-4 flex items-center justify-between py-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <Image
                src="/placeholder-oefem.png"
                alt="G Album Logo"
                width={40}
                height={40}
                className="h-10 w-auto transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-red-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-md"></div>
            </div>
            <span
              className={`ml-3 text-xl font-bold transition-colors ${
                scrolled ? "text-red-900" : "text-white"
              } group-hover:text-red-600`}
            >
              G Album
            </span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`relative font-medium transition-all duration-300 group ${
                scrolled ? "text-slate-700 hover:text-red-600" : "text-white hover:text-red-200"
              }`}
            >
              {item.name}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-red-500 to-red-700 transition-all duration-300 ${
                  pathname === item.href ? "w-full" : "w-0 group-hover:w-full"
                }`}
              ></span>
            </Link>
          ))}
          <Button
            asChild
            className={`relative overflow-hidden transition-all duration-300 ${
              scrolled
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                : "bg-white text-red-600 hover:bg-red-50"
            }`}
          >
            <Link href="/contact" className="relative z-10">
              Get in Touch
            </Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className={`transition-colors ${
              scrolled
                ? "text-red-900 hover:text-red-700 hover:bg-red-50"
                : "text-white hover:text-red-200 hover:bg-white/10"
            }`}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-200/30 to-red-300/30">
        <div
          className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-700 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 border-t border-red-100">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block py-3 px-2 text-slate-700 hover:text-red-600 font-medium transition-colors rounded-lg hover:bg-red-50 ${
                  pathname === item.href ? "bg-red-50 text-red-600" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
              >
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                  Get in Touch
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
