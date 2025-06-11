import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/conditional-layout";
import CookieBanner from "@/components/cookie-banner";

const inter = Inter({ subsets: ["latin"] });

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "G Album",
  url: "https://galbum.net",
  logo: "https://galbum.net/G Album Logo (RED).png",
  description:
    "Professional photo album creation and printing services with premium quality and personalized designs.",
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN",
  },
  sameAs: [
    "https://facebook.com/galbum",
    "https://instagram.com/galbum",
    "https://twitter.com/galbum",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://galbum.net"),
  title: "G Album - Dream To Reality",
  description:
    "Crafting memories into beautiful albums since 2018. Professional photo album creation and printing services with premium quality and personalized designs.",
  keywords:
    "photo albums, premium albums, custom albums, photo printing, memory books, professional albums",
  authors: [{ name: "G Album" }],
  creator: "G Album",
  publisher: "G Album Studio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "G Album",
    title: "G Album - Dream To Reality",
    description:
      "Crafting memories into beautiful albums since 2018. Professional photo album creation and printing services.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "G Album - Dream To Reality",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "G Album - Dream To Reality",
    description: "Crafting memories into beautiful albums since 2018",
    images: ["/twitter-image.jpg"],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#ef4444",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ConditionalLayout>
          {children}
          <CookieBanner />
        </ConditionalLayout>
      </body>
    </html>
  );
}
