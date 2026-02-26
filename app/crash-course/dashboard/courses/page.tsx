"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { useCrashCourseAuth } from "@/contexts/crash-course-auth-context"
import { crashCourseData } from "@/data/crash-course-data"
import { motion } from "framer-motion"
import Link from "next/link"
import { Code, Calculator, BrainCircuit, BookOpen, Globe, Search } from "lucide-react"

const icons = {
  Code: <Code className="h-5 w-5" />,
  Calculator: <Calculator className="h-5 w-5" />,
  BrainCircuit: <BrainCircuit className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  Globe: <Globe className="h-5 w-5" />,
}

export default function CoursesPage() {
  const { userProfile } = useCrashCourseAuth()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCourses = crashCourseData.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">My Courses</h1>
        <p className="text-muted-foreground">Browse and continue your crash course materials.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => {
          const courseProgress = userProfile?.courseProgress?.[course.id]?.progress || 0
          const completedVideos = userProfile?.courseProgress?.[course.id]?.completedVideos || []

          return (
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
                        <span>{courseProgress}%</span>
                      </div>
                      <Progress value={courseProgress} className="h-2" />
                    </div>
                    <div className="text-sm">
                      <p>
                        <strong>Videos:</strong> {completedVideos.length} of {course.videos.length} completed
                      </p>
                      <p>
                        <strong>Status:</strong> {courseProgress === 100 ? "Completed" : "In Progress"}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/crash-course/dashboard/courses/${course.id}`} className="w-full">
                    <Button className="w-full">{courseProgress > 0 ? "Continue Learning" : "Start Course"}</Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
