import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - G Album",
  description: "Get in touch with us to create your perfect photo album",
  openGraph: {
    title: "Contact Us - G Album",
    description: "Get in touch with us to create your perfect photo album",
    images: [
      {
        url: "/api/og-image?title=Contact Us&subtitle=Dream To Reality",
        width: 1200,
        height: 630,
        alt: "Contact G Album",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - G Album",
    description: "Get in touch with us to create your perfect photo album",
    images: ["/api/og-image?title=Contact Us&subtitle=Dream To Reality"],
  },
};
