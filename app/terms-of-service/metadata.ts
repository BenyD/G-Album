import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - G Album",
  description:
    "Read our terms of service and understand the rules and guidelines for using G Album's services.",
  openGraph: {
    title: "Terms of Service - G Album",
    description:
      "Read our terms of service and understand the rules and guidelines for using G Album's services.",
    images: [
      {
        url: "/api/og-image?title=Terms of Service&subtitle=Dream To Reality",
        width: 1200,
        height: 630,
        alt: "G Album Terms of Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - G Album",
    description:
      "Read our terms of service and understand the rules and guidelines for using G Album's services.",
    images: ["/api/og-image?title=Terms of Service&subtitle=Dream To Reality"],
  },
};
