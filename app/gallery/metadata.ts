import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery - G Album",
  description: "Explore our collection of beautiful photo albums and memories",
  openGraph: {
    title: "Gallery - G Album",
    description:
      "Explore our collection of beautiful photo albums and memories",
    images: [
      {
        url: "/api/og-image?title=Gallery&subtitle=Dream To Reality",
        width: 1200,
        height: 630,
        alt: "G Album Gallery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gallery - G Album",
    description:
      "Explore our collection of beautiful photo albums and memories",
    images: ["/api/og-image?title=Gallery&subtitle=Dream To Reality"],
  },
};
