"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Briefcase, User } from "lucide-react"

const NEW_FEATURES_DIALOG_KEY = "newFeaturesSeen_v1" // Increment version if you want to show it again

export function NewFeaturesDialog() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem(NEW_FEATURES_DIALOG_KEY)
    if (!hasSeen) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    localStorage.setItem(NEW_FEATURES_DIALOG_KEY, "true")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle className="h-6 w-6 text-green-500" /> New Features Available!
          </DialogTitle>
          <DialogDescription>
            We've added some exciting new functionalities to enhance your experience.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-semibold">Job Opportunities</h4>
              <p className="text-sm text-muted-foreground">
                Explore the latest job listings tailored for MCA students.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-semibold">Create/Edit Your Portfolio</h4>
              <p className="text-sm text-muted-foreground">
                Showcase your skills, experience, and projects to potential employers.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Got It!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
