"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Star, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { collection, addDoc, doc, updateDoc } from "firebase/firestore"
import type { FeedbackFormData } from "@/types/feedback"

interface FeedbackFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
}

export function FeedbackForm({ isOpen, onClose, onSubmit }: FeedbackFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<FeedbackFormData>({
    name: "",
    college: "",
    rating: 0,
    review: "",
    favoriteFeature: "",
    improvement: "",
  })
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) return

    setIsSubmitting(true)
    try {
      // Add feedback to Firestore
      await addDoc(collection(db, "feedback"), {
        userId: user.uid,
        name: formData.name,
        college: formData.college,
        email: user.email,
        rating: formData.rating,
        review: formData.review,
        favoriteFeature: formData.favoriteFeature,
        improvement: formData.improvement,
        createdAt: new Date().toISOString(),
      })

      // Mark user as having submitted feedback
      await updateDoc(doc(db, "crashCourseUsers", user.uid), {
        feedbackSubmitted: true,
      })

      onSubmit()
      onClose()
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.name && formData.college && formData.rating > 0 && formData.review

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            We'd Love Your Feedback!
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>Help us improve CETMCA26 by sharing your experience with our platform.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College *</Label>
              <Input
                id="college"
                value={formData.college}
                onChange={(e) => setFormData((prev) => ({ ...prev, college: e.target.value }))}
                placeholder="Enter your college name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label>Overall Rating *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || formData.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {formData.rating > 0 && `${formData.rating} star${formData.rating > 1 ? "s" : ""}`}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Your Review *</Label>
            <Textarea
              id="review"
              value={formData.review}
              onChange={(e) => setFormData((prev) => ({ ...prev, review: e.target.value }))}
              placeholder="Share your experience with CETMCA26..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="favoriteFeature">What's your favorite feature?</Label>
            <Textarea
              id="favoriteFeature"
              value={formData.favoriteFeature}
              onChange={(e) => setFormData((prev) => ({ ...prev, favoriteFeature: e.target.value }))}
              placeholder="Tell us what you love most about our platform..."
              rows={2}
            />
          </div>

        
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
