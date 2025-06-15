import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Preferences - G Album",
  description:
    "Manage your cookie preferences and privacy settings for G Album.",
  openGraph: {
    title: "Cookie Preferences - G Album",
    description:
      "Manage your cookie preferences and privacy settings for G Album.",
    images: [
      {
        url: "/api/og-image?title=Cookie Preferences&subtitle=Dream To Reality",
        width: 1200,
        height: 630,
        alt: "G Album Cookie Preferences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cookie Preferences - G Album",
    description:
      "Manage your cookie preferences and privacy settings for G Album.",
    images: [
      "/api/og-image?title=Cookie Preferences&subtitle=Dream To Reality",
    ],
  },
};
