// components/AppFrame.tsx
'use client'

import React from "react"
import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNavAndFooter = pathname.startsWith("/crash-course/dashboard")

  return (
    <div className="flex min-h-screen flex-col">
      {!hideNavAndFooter && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideNavAndFooter && <Footer />}
    </div>
  )
}
