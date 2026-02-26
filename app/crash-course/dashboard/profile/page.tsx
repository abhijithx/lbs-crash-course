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
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">View your profile information and track your learning progress.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={user?.photoURL || undefined} alt={userProfile?.displayName || "User"} />
                  <AvatarFallback className="text-2xl">
                    {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{user?.email?.split("@")[0] || "Student"}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joined on</p>
                    <p className="font-medium">{formatDate(userProfile?.createdAt || "")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Course</p>
                    <p className="font-medium">PLACEMENT MCA</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Overall Progress</p>
                <div className="flex items-center gap-2">
                  <Progress value={calculateOverallProgress()} className="h-2 flex-grow" />
                  <span className="text-sm font-medium">{calculateOverallProgress()}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
              <CardDescription>Track your progress across all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                  {/* <TabsTrigger value="completed">Completed</TabsTrigger> */}
                </TabsList>
                <TabsContent value="progress">
                  <div className="space-y-6">
                    {crashCourseData.map((course, index) => {
                      const courseProgress = userProfile?.courseProgress?.[course.id]?.progress || 0
                      const completedVideos = userProfile?.courseProgress?.[course.id]?.completedVideos || []

                      return (
                        <div key={course.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-md ${course.color} text-white`}>
                                {icons[course.icon as keyof typeof icons]}
                              </div>
                              <div>
                                <h3 className="font-medium">{course.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {completedVideos.length} of {course.videos.length} videos completed
                                </p>
                              </div>
                            </div>
                            <span className="font-medium">{courseProgress}%</span>
                          </div>
                          <Progress value={courseProgress} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
                {/* <TabsContent value="completed">
                  <div className="space-y-4">
                    {crashCourseData.map((course) => {
                      const completedVideos = userProfile?.courseProgress?.[course.id]?.completedVideos || []

                      return (
                        <div key={course.id}>
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`p-2 rounded-md ${course.color} text-white`}>
                              {icons[course.icon as keyof typeof icons]}
                            </div>
                            <h3 className="font-medium">{course.title}</h3>
                          </div>

                          {completedVideos.length > 0 ? (
                            <ul className="space-y-2 pl-10">
                              {course.videos
                                .filter((video) => completedVideos.includes(video.id))
                                .map((video) => (
                                  <li key={video.id} className="text-sm">
                                    ✓ {video.title}
                                  </li>
                                ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground pl-10">No videos completed yet.</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </TabsContent> */}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
