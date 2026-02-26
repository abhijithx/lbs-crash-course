"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCrashCourseAuth } from "@/contexts/crash-course-auth-context"
import { CrashCourseNavbar } from "@/components/crash-course/navbar"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useCrashCourseAuth()
  const router = useRouter()

  const SimpleSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
  </div>
);


  useEffect(() => {
    if (!loading && !user) {
      router.push("/crash-course")
    }
  }, [user, loading, router])

  // if (loading) {
  //   return <LoadingScreen />
  // }

  if (!user) {
    return null // Will redirect in the useEffect
  }

  return (
         <div className="min-h-screen flex flex-col bg-background lg:group">
      <CrashCourseNavbar />
      {/* MODIFIED: Added transition and group-hover:lg:pl-64 */}
      <main className="flex-1 lg:pl-20 lg:transition-all lg:duration-300 group-hover:lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* If auth is loading, OR if we're done loading but have no user
            (which means we're about to redirect), show the inline loader.
            Otherwise, show the children.
          */}
          {(loading || !user) ? <SimpleSpinner /> : children}
        </div>
      </main>
    </div>
  )
}
