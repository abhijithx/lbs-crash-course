"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"

type FeedbackContextType = {
  shouldShowFeedback: boolean
  setShouldShowFeedback: (show: boolean) => void
  hasCompletedQuiz: boolean
  hasFeedbackSubmitted: boolean
  checkFeedbackEligibility: () => Promise<void>
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined)

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [shouldShowFeedback, setShouldShowFeedback] = useState(false)
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false)
  const [hasFeedbackSubmitted, setHasFeedbackSubmitted] = useState(false)

  const checkFeedbackEligibility = async () => {
    if (!user || !db) return

    try {
      // Check if user has already submitted feedback
      const userDoc = await getDoc(doc(db, "crashCourseUsers", user.uid))
      const userData = userDoc.data()
      const feedbackSubmitted = userData?.feedbackSubmitted || false
      setHasFeedbackSubmitted(feedbackSubmitted)

      if (feedbackSubmitted) {
        setShouldShowFeedback(false)
        return
      }

      // Check if user has completed at least one quiz
      const quizAttemptsQuery = query(collection(db, "quizAttempts"), where("userId", "==", user.uid))
      const quizAttemptsSnapshot = await getDocs(quizAttemptsQuery)
      const hasQuizAttempts = !quizAttemptsSnapshot.empty
      setHasCompletedQuiz(hasQuizAttempts)

      // Show feedback form if user has completed a quiz and hasn't submitted feedback
      setShouldShowFeedback(hasQuizAttempts && !feedbackSubmitted)
    } catch (error) {
      console.error("Error checking feedback eligibility:", error)
    }
  }

  useEffect(() => {
    if (user) {
      checkFeedbackEligibility()
    }
  }, [user])

  return (
    <FeedbackContext.Provider
      value={{
        shouldShowFeedback,
        setShouldShowFeedback,
        hasCompletedQuiz,
        hasFeedbackSubmitted,
        checkFeedbackEligibility,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  )
}

export const useFeedback = () => {
  const context = useContext(FeedbackContext)
  if (context === undefined) {
    throw new Error("useFeedback must be used within a FeedbackProvider")
  }
  return context
}
