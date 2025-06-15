import { Metadata } from "next";

export const metadata: Metadata = {
  title: "G Album - Dream To Reality",
  description:
    "Crafting memories into beautiful albums since 2018. Professional photo album creation and printing services with premium quality and personalized designs.",
  openGraph: {
    title: "G Album - Dream To Reality",
    description:
      "Crafting memories into beautiful albums since 2018. Professional photo album creation and printing services.",
    images: [
      {
        url: "/api/og-image?title=G Album&subtitle=Dream To Reality",
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
    images: ["/api/og-image?title=G Album&subtitle=Dream To Reality"],
  },
};
