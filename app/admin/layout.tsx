import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard - G Album",
  description: "Admin dashboard for G Album",
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout is minimal since ConditionalLayout handles the admin wrapper
  // Individual admin pages don't need their own layout files anymore
  return <>{children}</>
}
