"use client"

import { useEffect } from "react"

export function OrientationHandler() {
  useEffect(() => {
    const updateOrientation = () => {
      // Remove existing orientation classes
      document.body.classList.remove("orientation-portrait", "orientation-landscape")

      // Determine current orientation
      const isLandscape = window.innerWidth > window.innerHeight

      // Add appropriate class
      if (isLandscape) {
        document.body.classList.add("orientation-landscape")
      } else {
        document.body.classList.add("orientation-portrait")
      }
    }

    // Set initial orientation
    updateOrientation()

    // Listen for orientation changes
    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(updateOrientation, 100)
    }

    // Listen for both orientation change and resize events
    window.addEventListener("orientationchange", handleOrientationChange)
    window.addEventListener("resize", handleOrientationChange)

    // Cleanup
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange)
      window.removeEventListener("resize", handleOrientationChange)
    }
  }, [])

  return null
}
