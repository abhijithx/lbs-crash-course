import type React from "react"
import { CrashCourseAuthProvider } from "@/contexts/crash-course-auth-context"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CET MCA 26 Placement",
  description: "Preparation materials for placement exams",
}

export default function CrashCourseLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <CrashCourseAuthProvider>{children}</CrashCourseAuthProvider>
}
