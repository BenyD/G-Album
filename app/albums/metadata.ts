import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Albums - G Album",
  description:
    "Browse our collection of premium photo albums and create your own custom album today.",
  openGraph: {
    title: "Photo Albums - G Album",
    description:
      "Browse our collection of premium photo albums and create your own custom album today.",
    images: [
      {
        url: "/api/og-image?title=Photo Albums&subtitle=Dream To Reality",
        width: 1200,
        height: 630,
        alt: "G Album Photo Albums",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Photo Albums - G Album",
    description:
      "Browse our collection of premium photo albums and create your own custom album today.",
    images: ["/api/og-image?title=Photo Albums&subtitle=Dream To Reality"],
  },
};
