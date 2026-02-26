"use client"

import { useEffect, useState } from "react"
import { FeedbackForm } from "./feedback-form"
import { useFeedback } from "@/contexts/feedback-context"

export function FeedbackPopup() {
  const { shouldShowFeedback, setShouldShowFeedback, checkFeedbackEligibility } = useFeedback()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (shouldShowFeedback) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [shouldShowFeedback])

  const handleClose = () => {
    setIsOpen(false)
    setShouldShowFeedback(false)
  }

  const handleSubmit = () => {
    setIsOpen(false)
    setShouldShowFeedback(false)
    checkFeedbackEligibility()
  }

  return <FeedbackForm isOpen={isOpen} onClose={handleClose} onSubmit={handleSubmit} />
}
