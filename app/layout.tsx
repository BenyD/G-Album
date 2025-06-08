import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/conditional-layout";
import CookieBanner from "@/components/cookie-banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "G Album - Premium Photo Albums",
  description: "Crafting memories into beautiful albums since 2018",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ConditionalLayout>
          {children}
          <CookieBanner />
        </ConditionalLayout>
      </body>
    </html>
  );
}
