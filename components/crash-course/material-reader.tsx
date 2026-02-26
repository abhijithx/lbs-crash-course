"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, Download, ExternalLink, X, Maximize2, Minimize2 } from "lucide-react"
import type { StudyMaterial } from "@/data/study-materials"

interface MaterialReaderProps {
  material: StudyMaterial | null
  isOpen: boolean
  onClose: () => void
}

export function MaterialReader({ material, isOpen, onClose }: MaterialReaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [embedUrl, setEmbedUrl] = useState("")
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (material && isOpen) {
      setIsLoading(true)
      // Convert Google Drive view URL to embed URL
      if (material.link.includes("drive.google.com/file/d/")) {
        const fileId = material.link.split("/d/")[1].split("/")[0]
        setEmbedUrl(`https://drive.google.com/file/d/${fileId}/preview`)
      } else {
        setEmbedUrl(material.link)
      }
    }
  }, [material, isOpen])

  // Reset fullscreen when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false)
    }
  }, [isOpen])

  const handleDownload = () => {
    if (material) {
      // Convert view URL to download URL for Google Drive
      if (material.link.includes("drive.google.com/file/d/")) {
        const fileId = material.link.split("/d/")[1].split("/")[0]
        window.open(`https://drive.google.com/uc?export=download&id=${fileId}`, "_blank")
      } else {
        window.open(material.link, "_blank")
      }
    }
  }

  const handleOpenExternal = () => {
    if (material) {
      window.open(material.link, "_blank")
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={`${
          isFullscreen 
            ? "max-w-none w-screen h-screen m-0 rounded-none" 
            : "max-w-4xl h-[80vh]"
        } flex flex-col p-0 transition-all duration-200`}
      >
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
          <div>
            <DialogTitle>{material?.name}</DialogTitle>
            <DialogDescription className="mt-1">{material?.description}</DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button> */}
            {/* <Button variant="outline" size="icon" onClick={handleOpenExternal}>
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">Open in new tab</span>
            </Button> */}
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              </span>
            </Button>
            {/* <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4 " />
              <span className="sr-only">Close</span>
            </Button> */}
            <div className="h-5 w-5"></div>
          </div>
        </DialogHeader>

        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading document...</span>
            </div>
          )}

          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            allow="autoplay"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}