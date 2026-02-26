"use client"

import { useState } from "react"
import { MarkdownList } from "@/components/resources/markdown-list"
import { MarkdownReaderModal } from "@/components/resources/markdown-reader-modal"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Maximize2, Minimize2, X } from "lucide-react"
import { motion } from "framer-motion"

export default function PlacementResourcesPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const handleFileSelect = (fileName: string) => {
    setSelectedFile(fileName)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedFile(null)
    setIsFullScreen(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">Placement Resources</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Access important Markdown documents related to placements from the CETMCA26 GitHub repository.
        </p>
      </motion.div>

      <MarkdownList onFileSelect={handleFileSelect} />

      {/* Modal Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className={`${
            isFullScreen 
              ? "w-screen h-screen max-w-none max-h-none m-0 rounded-none" 
              : "w-[95vw] h-[90vh] max-w-6xl"
          } p-0 overflow-hidden transition-all duration-300`}
        >
          {selectedFile && (
            <div className="flex flex-col h-full">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <h2 className="text-lg font-semibold truncate">{selectedFile}</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="h-8 w-8 p-0"
                    title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                  >
                    {isFullScreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseModal}
                    className="h-8 w-8 p-0"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-hidden">
                <MarkdownReaderModal 
                  fileName={selectedFile} 
                  onBack={handleCloseModal}
                  isFullScreen={isFullScreen}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
