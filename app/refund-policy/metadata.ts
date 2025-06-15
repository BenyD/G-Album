import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy - G Album",
  description:
    "Learn about our refund and return policies for G Album products and services.",
  openGraph: {
    title: "Refund Policy - G Album",
    description:
      "Learn about our refund and return policies for G Album products and services.",
    images: [
      {
        url: "/api/og-image?title=Refund Policy&subtitle=Dream To Reality",
        width: 1200,
        height: 630,
        alt: "G Album Refund Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refund Policy - G Album",
    description:
      "Learn about our refund and return policies for G Album products and services.",
    images: ["/api/og-image?title=Refund Policy&subtitle=Dream To Reality"],
  },
};
