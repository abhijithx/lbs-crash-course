"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore"
import type { Feedback } from "@/types/feedback"

export function FeedbackCarousel() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!db) return

      try {
        const feedbackQuery = query(collection(db, "feedback"), orderBy("createdAt", "desc"), limit(20))
        const feedbackSnapshot = await getDocs(feedbackQuery)
        const feedbackData = feedbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Feedback[]

        setFeedbacks(feedbackData)
      } catch (error) {
        console.error("Error fetching feedbacks:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedbacks()
  }, [])

  useEffect(() => {
    if (feedbacks.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % feedbacks.length)
    }, 4000) // Change every 4 seconds

    return () => clearInterval(interval)
  }, [feedbacks.length])

  if (isLoading) {
    return (
      <div className="w-full">
        <h3 className="text-xl font-semibold mb-4 text-center">What Our Users Say</h3>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="min-w-[300px] animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (feedbacks.length === 0) {
    return null
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const visibleFeedbacks = feedbacks
    .slice(currentIndex, currentIndex + 3)
    .concat(feedbacks.slice(0, Math.max(0, currentIndex + 3 - feedbacks.length)))

  return (
  <div className="w-full mb-2 mt-2">
  <h3 className="text-xl font-semibold mb-6 text-center">What Our Users Say</h3>

  {/* Make parent a group to control child hover effects */}
  <div className="relative hover:transition-none group">
    <div
      className="flex gap-4 transition-transform duration-500 ease-in-out group-hover:transition-none"
      style={{ transform: `translateX(-${(currentIndex % feedbacks.length) * 0}px)` }}
    >
      {visibleFeedbacks.map((feedback, index) => (
        <Card
          key={`${feedback.id}-${index}`}
          className="min-w-[300px] max-w-[300px] h-[300px] flex-shrink-0 border border-gray-200 rounded-lg shadow-md"
        >
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                {renderStars(feedback.rating)}
                <span className="text-sm text-muted-foreground">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Hide scrollbar, make scrollable on overflow */}
              <div className="mb-2 overflow-y-auto max-h-[100px] text-sm pr-1 scrollbar-none">
                <p className="text-sm">{feedback.favoriteFeature}</p>
              </div>
            </div>

            <div className="space-y-0.5 mt-2">
              <p className="font-medium text-sm">{feedback.name}</p>
              <p className="text-xs text-muted-foreground">{feedback.college}</p>
              <p className="text-xs text-muted-foreground">{feedback.email}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>

  {/* Dots indicator */}
  <div className="flex justify-center mt-4 gap-2">
    {feedbacks.map((_, index) => (
      <button
        key={index}
        className={`w-2 h-2 rounded-full transition-colors ${
          index === currentIndex ? "bg-primary" : "bg-gray-300"
        }`}
        onClick={() => setCurrentIndex(index)}
      />
    ))}
  </div>
</div>

  )
}
