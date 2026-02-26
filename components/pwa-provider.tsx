"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, X } from "lucide-react"

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content is available
                  setWaitingWorker(newWorker)
                  setShowUpdatePrompt(true)
                }
              })
            }
          })

          // Check for waiting service worker
          if (registration.waiting) {
            setWaitingWorker(registration.waiting)
            setShowUpdatePrompt(true)
          }
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })

      // Listen for controlling service worker change
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!isUpdating) {
          window.location.reload()
        }
      })
    }
  }, [isUpdating])

  const handleUpdate = () => {
    if (waitingWorker) {
      setIsUpdating(true)
      waitingWorker.postMessage({ type: "SKIP_WAITING" })
      setShowUpdatePrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowUpdatePrompt(false)
    // Don't show again for this session
    sessionStorage.setItem("pwa-update-dismissed", "true")
  }

  return (
    <>
      {children}

      {/* Update Prompt */}
      {showUpdatePrompt && !sessionStorage.getItem("pwa-update-dismissed") && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-4 md:max-w-sm">
          <Card className="shadow-lg border-2 border-blue-500/20 bg-background/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Update Available</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>A new version of CETMCA26 is available with improvements and bug fixes.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button onClick={handleUpdate} className="flex-1" disabled={isUpdating}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
                  {isUpdating ? "Updating..." : "Update Now"}
                </Button>
                <Button variant="outline" onClick={handleDismiss}>
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
