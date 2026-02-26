"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCrashCourseAuth } from "@/contexts/crash-course-auth-context"
import { crashCourseData } from "@/data/crash-course-data"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Code, Calculator, BrainCircuit, BookOpen, Globe, Calendar, Clock } from "lucide-react"
import JobsSection from "@/components/crash-course/jobs-section"

const icons = {
  Code: <Code className="h-5 w-5" />,
  Calculator: <Calculator className="h-5 w-5" />,
  BrainCircuit: <BrainCircuit className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Globe: <Globe className="h-5 w-5" />,
}

export default function ProfilePage() {
  const { user, userProfile } = useCrashCourseAuth()
  const [activeTab, setActiveTab] = useState("progress")

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!userProfile?.courseProgress) return 0

    const totalCourses = crashCourseData.length
    let completedProgress = 0

    Object.values(userProfile.courseProgress).forEach((course) => {
      completedProgress += course.progress || 0
    })

    return Math.round(completedProgress / totalCourses)
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
       <JobsSection />
      </motion.div>

  
    </div>
  )
}
