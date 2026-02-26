"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MessageSquare } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore"
import type { Feedback } from "@/types/feedback"
import { Skeleton } from "@/components/ui/skeleton"

// Cache configuration
const CACHE_KEY = 'feedbacks_cache'
const CACHE_TIMESTAMP_KEY = 'feedbacks_cache_timestamp'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

// Cache utility functions
const getCachedFeedbacks = (): Feedback[] | null => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY)
    const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)
    
    if (!cachedData || !cacheTimestamp) {
      return null
    }
    
    const now = Date.now()
    const cacheTime = parseInt(cacheTimestamp, 10)
    
    // Check if cache is expired
    if (now - cacheTime > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(CACHE_TIMESTAMP_KEY)
      return null
    }
    
    return JSON.parse(cachedData)
  } catch (error) {
    console.error('Error reading from cache:', error)
    return null
  }
}

const setCachedFeedbacks = (feedbacks: Feedback[]): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(feedbacks))
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
  } catch (error) {
    console.error('Error saving to cache:', error)
  }
}

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(false)

  useEffect(() => {
    const loadFeedbacks = async () => {
      // First, try to load from cache
      setIsLoading(true)
      const cachedFeedbacks = getCachedFeedbacks()
      
      if (cachedFeedbacks && cachedFeedbacks.length > 0) {
        setFeedbacks(cachedFeedbacks)
        setIsLoading(false)
        setIsLoadingFromCache(true)
        
        // Optional: Fetch fresh data in background without showing loading state
        fetchFreshFeedbacks(false)
        return
      }
      
      // If no cache, fetch from database
      await fetchFreshFeedbacks(true)
    }

    const fetchFreshFeedbacks = async (showLoading: boolean = true) => {
      if (!db) return

      try {
        if (showLoading) {
          setIsLoading(true)
        }
        
        const feedbackQuery = query(
          collection(db, "feedback"), 
          orderBy("createdAt", "desc"), 
          limit(50)
        )

        const feedbackSnapshot = await getDocs(feedbackQuery)
        const feedbackData = feedbackSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Feedback[]

        setFeedbacks(feedbackData)
        
        // Cache the fresh data
        setCachedFeedbacks(feedbackData)
        
        if (isLoadingFromCache) {
          setIsLoadingFromCache(false)
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error)
        // If there's an error and we have cached data, keep using it
        const cachedFeedbacks = getCachedFeedbacks()
        if (cachedFeedbacks && cachedFeedbacks.length > 0) {
          setFeedbacks(cachedFeedbacks)
        }
      } finally {
        if (showLoading) {
          setIsLoading(false)
        }
      }
    }

    loadFeedbacks()
  }, [])

  // Function to manually refresh feedbacks
  const refreshFeedbacks = async () => {
    setIsLoading(true)
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_TIMESTAMP_KEY)
    
    if (!db) return

    try {
      const feedbackQuery = query(
        collection(db, "feedback"), 
        orderBy("createdAt", "desc"), 
        limit(50)
      )

      const feedbackSnapshot = await getDocs(feedbackQuery)
      const feedbackData = feedbackSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Feedback[]

      setFeedbacks(feedbackData)
      setCachedFeedbacks(feedbackData)
    } catch (error) {
      console.error("Error refreshing feedbacks:", error)
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="container mx-auto py-6 px-4">
        <div className="text-center">
          <div className="mb-4">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-pulse mb-2 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400">
              Wall of Love  <br></br>
              <span>Entrance Coaching By Asca</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto rounded-full animate-pulse dark:from-purple-400 dark:to-pink-400"></div>
          </div>
          {isLoadingFromCache && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              Still Counting...
            </div>
          )}
        
        </div>
      </header>

      <main className="container mx-auto px-2 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl shadow-sm p-4">

            {isLoading ? (
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="bg-gray-50 border border-gray-200 break-inside-avoid mb-6 dark:bg-gray-700 dark:border-gray-600" style={{height: `${200 + (i % 4) * 50}px`}}>
                    <CardHeader className="pb-3">
                      <CardTitle>
                        <Skeleton className="h-6 w-full bg-gray-200 dark:bg-gray-600" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-full mb-2 bg-gray-200 dark:bg-gray-600" />
                      <Skeleton className="h-4 w-full mb-2 bg-gray-200 dark:bg-gray-600" />
                      <Skeleton className="h-4 w-3/4 mb-4 bg-gray-200 dark:bg-gray-600" />
                      <div className="flex items-center space-x-3 mt-auto">
                        <Skeleton className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1 bg-gray-200 dark:bg-gray-600" />
                          <Skeleton className="h-3 w-20 bg-gray-200 dark:bg-gray-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4 dark:text-gray-500" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2 dark:text-gray-300">No Feedback Available</h3>
                <p className="text-gray-500 dark:text-gray-400">Check back later for student reviews.</p>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6">
                {feedbacks.map((feedback, index) => (
                  <Card
                    key={feedback.id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 break-inside-avoid mb-6 cursor-pointer
                             transform transition-all duration-300 ease-in-out
                             hover:scale-105 hover:shadow-2xl hover:-translate-y-2 hover:z-10 hover:border-purple-300
                             dark:from-gray-800 dark:to-gray-700 dark:border-gray-600 dark:hover:shadow-gray-700/50 dark:hover:border-purple-500
                             relative group"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <Avatar className="h-10 w-10 transition-transform duration-300 group-hover:scale-110">
                            <AvatarImage src="https://t4.ftcdn.net/jpg/05/89/93/27/360_F_589932782_vQAEAZhHnq1QCGu5ikwrYaQD0Mmurm0N.jpg" />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                              {feedback.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold text-gray-900 dark:text-white truncate transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                              {feedback.name}
                            </CardTitle>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate" title={feedback.college}>
                              {feedback.college}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={feedback.email}>
                              {feedback.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="transition-transform duration-300 group-hover:scale-110">
                            {renderStars(feedback.rating)}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 p-6">
                      <div className="space-y-4">
                        {feedback.review && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 text-gray-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-gray-200 transition-all duration-300 group-hover:shadow-md group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/50 dark:group-hover:to-indigo-900/50">
                            <p className="text-sm leading-relaxed">"{feedback.review}"</p>
                          </div>
                        )}
                        
                        {feedback.favoriteFeature && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 text-gray-700 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-gray-200 transition-all duration-300 group-hover:shadow-md group-hover:from-green-100 group-hover:to-emerald-100 dark:group-hover:from-green-900/50 dark:group-hover:to-emerald-900/50">
                            <p className="text-sm">
                              <span className="font-semibold">Favorite:</span> "{feedback.favoriteFeature}"
                            </p>
                          </div>
                        )}
                      </div>
                      
                    </CardContent>
                  </Card>
                  
                ))}
              </div>
              
            )}
          </div>
          
        </div>
      </main>
      
    </div>
  )
}