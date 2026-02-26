"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { CheckCircle, Play, Lock, ArrowLeft, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import CourseVideoPlayer from "@/components/crash-course/course-video-player"
import { getCourseData } from "@/data/crash-course-data"
import type { crashCourseData } from "@/data/crash-course-data"
import { useCrashCourseAuth } from "@/contexts/crash-course-auth-context"

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const { userProfile, updateUserProgress } = useCrashCourseAuth()

  const [crashCourseData, setCourseData] = useState<crashCourseData | null>(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Get completed videos from userProfile instead of localStorage
  const completedVideos = userProfile?.courseProgress?.[courseId]?.completedVideos || []
  const overallProgress = userProfile?.courseProgress?.[courseId]?.progress || 0

  useEffect(() => {
    const loadCourseData = async () => {
      setIsLoading(true)
      const data = await getCourseData(courseId)
      setCourseData(data)
      
      // Find the last watched video if available
      if (userProfile?.courseProgress?.[courseId]?.lastWatched) {
        const lastWatchedIndex = data.videos.findIndex(
          (video) => video.id === userProfile.courseProgress?.[courseId]?.lastWatched
        )
        if (lastWatchedIndex !== -1) {
          setCurrentVideoIndex(lastWatchedIndex)
        }
      }
      
      setIsLoading(false)
    }

    loadCourseData()
  }, [courseId, userProfile])

  const handleVideoSelect = async (index: number, videoId: string) => {
    setCurrentVideoIndex(index)
    
    // Mark video as completed if not already
    if (!completedVideos.includes(videoId)) {
      // Calculate new progress percentage
      const totalVideos = crashCourseData?.videos.length || 0
      const newCompletedCount = completedVideos.length + 1
      const newProgress = Math.round((newCompletedCount / totalVideos) * 100)
      
      // Update progress in Firestore through the auth context
      await updateUserProgress(courseId, videoId, newProgress)
    }
  }

  const handleVideoCompleted = async () => {
    // This function can be called when a video finishes playing
    if (!crashCourseData) return
    
    const currentVideo = crashCourseData.videos[currentVideoIndex]
    
    if (!completedVideos.includes(currentVideo.id)) {
      // Calculate new progress percentage
      const totalVideos = crashCourseData.videos.length
      const newCompletedCount = completedVideos.length + 1
      const newProgress = Math.round((newCompletedCount / totalVideos) * 100)
      
      // Update progress in Firestore through the auth context
      await updateUserProgress(courseId, currentVideo.id, newProgress)
    }
  }

  if (isLoading || !crashCourseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const currentVideo = crashCourseData.videos[currentVideoIndex]
  const progressPercentage = Math.round((completedVideos.length / crashCourseData.videos.length) * 100)

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Button variant="ghost" className="mb-4" onClick={() => router.push("/crash-course/dashboard/courses")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
        <div className={`p-4 rounded-lg   mb-4`}>
          <h1 className="text-3xl font-bold mb-2">{crashCourseData.title}</h1>
          <p className="text-white/80">{crashCourseData.description}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="mb-6">
            <CardContent className="p-4">
              <CourseVideoPlayer 
                videoId={currentVideo.youtubeId} 
                onVideoComplete={handleVideoCompleted}
              />
              <div className="mt-6">
                <h2 className="text-2xl font-bold mb-2">{currentVideo.title}</h2>
                <p className="text-muted-foreground">{currentVideo.description}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {completedVideos.length} of {crashCourseData.videos.length} videos completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <div className="space-y-4">
                {crashCourseData.videos.map((video, index) => {
                  const isCompleted = completedVideos.includes(video.id)
                  const unlocked = index === 0 || completedVideos.includes(crashCourseData.videos[index - 1]?.id)

                  return (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => unlocked && handleVideoSelect(index, video.id)}
                      >
                        <div className="flex items-center gap-3">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : unlocked ? (
                            <Play className="h-5 w-5 text-primary" />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <h3 className="font-medium">{video.title}</h3>
                            <p className="text-sm text-muted-foreground">{video.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{video.duration}</span>
                        </Badge>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle>Course Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Course Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{crashCourseData.videos.length}</p>
                      <p className="text-sm text-muted-foreground">Total Videos</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{completedVideos.length}</p>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}