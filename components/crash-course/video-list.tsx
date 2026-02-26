"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Course } from "@/data/crash-course-data"
import { motion } from "framer-motion"
import Link from "next/link"
import { Clock, Play, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"

// Add state for tracking click attempts on locked videos
interface VideoListProps {
  course: Course
  currentVideoId: string
  completedVideos: string[]
}

export function VideoList({ course, currentVideoId, completedVideos }: VideoListProps) {
  const [clickedLockedVideo, setClickedLockedVideo] = useState<string | null>(null)

  // Check if a video is unlocked
  const isVideoUnlocked = (videoId: string, order: number) => {
    if (order === 1) return true

    // Check if previous video is completed
    const previousVideo = course.videos.find((v) => v.order === order - 1)
    if (!previousVideo) return false

    return completedVideos.includes(previousVideo.id)
  }

  // Handle click on locked video
  const handleLockedVideoClick = (videoId: string) => {
    setClickedLockedVideo(videoId)
    // Clear the message after 3 seconds
    setTimeout(() => setClickedLockedVideo(null), 3000)
  }

  return (
    <Card className="bg-black/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Course Videos</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[60vh] overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {course.videos.map((video, index) => {
            const isCompleted = completedVideos.includes(video.id)
            const isCurrent = video.id === currentVideoId
            const unlocked = isVideoUnlocked(video.id, video.order)
            const showLockedMessage = clickedLockedVideo === video.id

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div
                  className={`p-3 rounded-lg transition-colors ${
                    isCurrent ? "bg-primary/20 border border-primary/50" : "border border-gray-800 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : unlocked ? (
                        <Play className="h-4 w-4 text-primary" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className={`text-sm font-medium ${isCurrent ? "text-primary" : "text-white"}`}>
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs flex items-center gap-1 bg-transparent border-gray-700"
                        >
                          <Clock className="h-3 w-3" />
                          <span>{video.duration}</span>
                        </Badge>
                      </div>
                      {showLockedMessage && (
                        <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>Complete previous videos to unlock</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {unlocked ? (
                              <Link href={`/crash-course/dashboard/courses/${course.id}/video/${video.id}`}>
                                <Button size="sm" variant={unlocked ? "default" : "outline"}>
                                  {isCurrent ? "Current" : isCompleted ? "Rewatch" : "Watch"}
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="opacity-50"
                                onClick={() => handleLockedVideoClick(video.id)}
                              >
                                Locked
                              </Button>
                            )}
                          </TooltipTrigger>
                          {!unlocked && (
                            <TooltipContent>
                              <p>Complete previous videos to unlock</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
