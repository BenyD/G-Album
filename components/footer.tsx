"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaWhatsapp, FaFacebookF, FaInstagram } from "react-icons/fa";
import { Mail, Phone } from "lucide-react";

const navigation = {
  company: [
    { name: "About Us", href: "/about" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "/terms-of-service" },
    { name: "Refund Policy", href: "/refund-policy" },
    { name: "Cookie Preferences", href: "/cookie-preferences" },
  ],
  social: [
    {
      name: "WhatsApp",
      href: "https://wa.me/1234567890", // Replace with your actual WhatsApp number
      icon: FaWhatsapp,
    },
    {
      name: "Email",
      href: "mailto:contact@galbum.com", // Replace with your actual email
      icon: Mail,
    },
    {
      name: "Phone",
      href: "tel:+1234567890", // Replace with your actual phone number
      icon: Phone,
    },
    {
      name: "Facebook",
      href: "#",
      icon: FaFacebookF,
    },
    {
      name: "Instagram",
      href: "#",
      icon: FaInstagram,
    },
  ],
};

export default function Footer() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <footer>
      {/* CTA Section with White Background - Only shown on homepage */}
      {isHomePage && (
        <div className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base/7 font-semibold text-red-600">
                Create Your Perfect Album
              </h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl">
                Preserve your memories with our premium photo albums
              </p>
              <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-gray-600">
                Since 2018, we&apos;ve been crafting affordable, professional
                photo albums with a creative touch that exceeds expectations.
              </p>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/contact"
                  className="rounded-md bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-2xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Section with Red Gradient Background */}
      <div className="bg-linear-to-br from-red-800 to-red-950">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="xl:grid xl:grid-cols-12 xl:gap-8">
            <div className="space-y-4 xl:col-span-4">
              <div className="flex items-center">
                <Image
                  src="/G Album Logo (WHITE).svg"
                  alt="G Album Logo"
                  width={36}
                  height={36}
                  className="h-9 w-auto"
                />
                <span className="ml-3 text-xl font-bold text-white">
                  G Album
                </span>
              </div>
              <p className="text-sm text-red-200 max-w-md">
                Crafting premium photo albums since 2018. We transform your
                precious memories into beautiful, lasting keepsakes with
                professional quality and creative design. Our team of skilled
                designers and craftspeople work meticulously to ensure each
                album tells your unique story with elegance and precision.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-8 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm/6 font-semibold text-white">
                    Company
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.company.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm/6 text-red-200 hover:text-white"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm/6 font-semibold text-white">Legal</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.legal.map((item) => (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className="text-sm/6 text-red-200 hover:text-white"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <h3 className="text-sm/6 font-semibold text-white">
                  Newsletter
                </h3>
                <p className="mt-2 text-sm text-red-200">
                  Stay updated with our latest album designs and special offers.
                </p>
                <form className="mt-6 sm:flex sm:max-w-md">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <Input
                    id="email-address"
                    name="email-address"
                    type="email"
                    required
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full min-w-0 bg-white/10 border-white/20 text-white placeholder:text-red-200 focus:bg-white/20 focus:border-white/40"
                  />
                  <div className="mt-4 sm:ml-4 sm:mt-0 sm:shrink-0">
                    <Button
                      type="submit"
                      className="w-full bg-white text-red-900 hover:bg-red-50 font-semibold"
                    >
                      Subscribe
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-white/10 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex gap-x-6 md:order-2">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-red-200 hover:text-white"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="size-6" aria-hidden="true" />
                </a>
              ))}
            </div>
            <p className="mt-8 text-sm/6 text-red-200 md:order-1 md:mt-0">
              &copy; {new Date().getFullYear()} G Album. All rights reserved.
              <Link
                href="/admin/login"
                className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
              >
                Admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
