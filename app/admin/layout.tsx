import type { Metadata } from "next";
import AdminLayoutClient from "./layout.client";

export const metadata: Metadata = {
  title: "Admin Dashboard - G Album",
  description: "Admin dashboard for G Album",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
