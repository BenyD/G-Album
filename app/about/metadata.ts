import { aboutConfig } from "@/config/about";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - G Album",
  description: aboutConfig.hero.subtitle,
  openGraph: {
    title: "About Us - G Album",
    description: aboutConfig.hero.subtitle,
    images: [
      {
        url: `/api/og-image?title=About Us&subtitle=Dream To Reality`,
        width: 1200,
        height: 630,
        alt: "About G Album",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - G Album",
    description: aboutConfig.hero.subtitle,
    images: [`/api/og-image?title=About Us&subtitle=Dream To Reality`],
  },
};
