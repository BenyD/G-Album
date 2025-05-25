import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Login - G Album Admin",
  description: "Login to G Album admin dashboard",
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  // This is a standalone layout without header, footer, or sidebar
  return <>{children}</>
}
