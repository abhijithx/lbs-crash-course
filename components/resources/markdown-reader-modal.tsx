"use client"

import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Loader2, ExternalLink, Github, AlertCircle, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MarkdownReaderModalProps {
  fileName: string
  onBack: () => void
  isFullScreen: boolean
}

export function MarkdownReaderModal({ fileName, onBack, isFullScreen }: MarkdownReaderModalProps) {
  const [markdownContent, setMarkdownContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMarkdownContent() {
      try {
        setLoading(true)
        setError(null)
        
        console.log(`Attempting to fetch: ${fileName}`)
        
        const encodedFileName = encodeURIComponent(fileName)
        const rawUrl = `https://raw.githubusercontent.com/cetmca26/Placement25/main/${encodedFileName}`
        
        console.log(`Fetching from URL: ${rawUrl}`)
        
        const response = await fetch(rawUrl, {
          method: 'GET',
          headers: {
            'Accept': 'text/plain, text/markdown, */*',
            'Cache-Control': 'no-cache'
          }
        })

        console.log(`Response status: ${response.status}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`File '${fileName}' not found in the repository.`)
          }
          if (response.status === 403) {
            throw new Error(`Access denied to '${fileName}'. Repository may be private or rate limited.`)
          }
          throw new Error(`HTTP ${response.status}: Failed to fetch '${fileName}'`)
        }

        const text = await response.text()
        console.log(`Content length: ${text.length}`)
        
        if (!text || text.trim().length === 0) {
          throw new Error(`The file '${fileName}' appears to be empty.`)
        }
        
        if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
          throw new Error(`Received HTML instead of markdown content.`)
        }
        
        setMarkdownContent(text)
      } catch (err: any) {
        console.error("Error fetching markdown content:", err)
        setError(err.message || "Failed to load content. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (fileName) {
      fetchMarkdownContent()
    }
  }, [fileName])

  // Download function
  const handleDownload = () => {
    if (markdownContent) {
      const blob = new Blob([markdownContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading {fileName}...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-4 h-full flex flex-col">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error loading {fileName}:</strong><br />
            {error}
          </AlertDescription>
        </Alert>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4 text-center">
            Try accessing the file directly or refresh:
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
            >
              Refresh Page
            </Button>
            <Button 
              variant="outline" 
              asChild
            >
              <a
                href={`https://raw.githubusercontent.com/cetmca26/Placement25/main/${encodeURIComponent(fileName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Raw
              </a>
            </Button>
            <Button 
              variant="outline" 
              asChild
            >
              <a
                href={`https://github.com/cetmca26/Placement25/blob/main/${encodeURIComponent(fileName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Action buttons */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex gap-2 justify-end flex-wrap">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <a
              href={`https://raw.githubusercontent.com/cetmca26/Placement25/main/${encodeURIComponent(fileName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Raw
            </a>
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <a
              href={`https://github.com/cetmca26/Placement25/blob/main/${encodeURIComponent(fileName)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6">
          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ node, ...props }) => (
                  <img {...props} className="max-w-full h-auto rounded-lg shadow-sm" />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto">
                    <table {...props} className="border-collapse border border-gray-300" />
                  </div>
                ),
                code: ({ node, inline, className, children, ...props }) => {
                  if (inline) {
                    return (
                      <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    )
                  }
                  return (
                    <code className="block bg-muted p-4 rounded-lg overflow-x-auto" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {markdownContent || ""}
            </ReactMarkdown>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
