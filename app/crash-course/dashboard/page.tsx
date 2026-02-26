"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useCrashCourseAuth } from "@/contexts/crash-course-auth-context"
import { crashCourseData } from "@/data/crash-course-data"
import { motion } from "framer-motion"
import Link from "next/link"
import { BookOpen, Code, Calculator, BrainCircuit, Globe } from "lucide-react"
// import ExamCountdownNotification  from "@/components/exam-countdown-notification"

const icons = {
  Code: <Code className="h-5 w-5" />,
  Calculator: <Calculator className="h-5 w-5" />,
  BrainCircuit: <BrainCircuit className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Globe: <Globe className="h-5 w-5" />,
}

export default function DashboardPage() {
  const { userProfile } = useCrashCourseAuth()
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    if (userProfile?.courseProgress) {
      const progress: Record<string, number> = {}

      Object.entries(userProfile.courseProgress).forEach(([courseId, data]) => {
        progress[courseId] = data.progress || 0
      })

      setCourseProgress(progress)
    }
  }, [userProfile])

  return (
    <div className="container py-8">
        {/* <ExamCountdownNotification /> */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Welcome, {userProfile?.displayName || "Student"}!</h1>
        <p className="text-muted-foreground">
          Track your progress and continue learning with our crash course materials.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crashCourseData.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col overflow-hidden">
              <CardHeader className={``}>
                <div className="flex items-center gap-2">
                  {icons[course.icon as keyof typeof icons]}
                  <CardTitle>{course.title}</CardTitle>
                </div>
                <CardDescription className="">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow py-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{courseProgress[course.id] || 0}%</span>
                    </div>
                    <Progress value={courseProgress[course.id] || 0} className="h-2" />
                  </div>
                  <div className="text-sm">
                    <p>
                      <strong>Videos:</strong> {course.videos.length}
                    </p>
                    <p>
                      <strong>Status:</strong> {courseProgress[course.id] === 100 ? "Completed" : "In Progress"}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/crash-course/dashboard/courses/${course.id}`} className="w-full">
                  <Button className="w-full">{courseProgress[course.id] ? "Continue Learning" : "Start Course"}</Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
          
        ))}
      </div>
    </div>
  )
}
