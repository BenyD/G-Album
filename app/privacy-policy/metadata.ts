import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - G Album",
  description:
    "Learn about how G Album collects, uses, and protects your personal information.",
  openGraph: {
    title: "Privacy Policy - G Album",
    description:
      "Learn about how G Album collects, uses, and protects your personal information.",
    images: [
      {
        url: "/api/og-image?title=Privacy Policy&subtitle=Dream To Reality",
        width: 1200,
        height: 630,
        alt: "G Album Privacy Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - G Album",
    description:
      "Learn about how G Album collects, uses, and protects your personal information.",
    images: ["/api/og-image?title=Privacy Policy&subtitle=Dream To Reality"],
  },
};
