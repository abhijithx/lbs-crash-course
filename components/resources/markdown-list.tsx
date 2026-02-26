"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Loader2, Github, ExternalLink, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GitHubContent {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string | null
  type: "file" | "dir"
  _links: {
    self: string
    git: string
    html: string
  }
}

export function MarkdownList({ onFileSelect }: { onFileSelect: (fileName: string) => void }) {
  const [files, setFiles] = useState<GitHubContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMarkdownFiles() {
      try {
        setLoading(true)
        setError(null)
        
        // First check if the repository exists
        const repoResponse = await fetch("https://api.github.com/repos/cetmca26/Placement25")
        if (!repoResponse.ok) {
          if (repoResponse.status === 404) {
            throw new Error("Repository 'cetmca26/Placement25' not found. Please verify the repository exists.")
          }
          throw new Error(`Repository access failed: ${repoResponse.statusText}`)
        }

        const response = await fetch("https://api.github.com/repos/cetmca26/Placement25/contents/")

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("GitHub API rate limit exceeded or access denied. Please try again later.")
          }
          if (response.status === 404) {
            throw new Error("Repository contents not found. The repository may be empty or private.")
          }
          throw new Error(`Failed to fetch files: ${response.statusText}`)
        }

        const data: GitHubContent[] = await response.json()
        const markdownFiles = data.filter((item) => item.type === "file" && item.name.endsWith(".md"))
        
        if (markdownFiles.length === 0) {
          throw new Error("No markdown files found in the repository.")
        }
        
        setFiles(markdownFiles)
      } catch (err: any) {
        console.error("Error fetching markdown files:", err)
        setError(err.message || "Failed to load files. Please check your network or try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchMarkdownFiles()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading placement resources...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Try accessing the repository directly or check if it's publicly available:
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Button variant="outline" asChild>
              <a href="https://github.com/cetmca26/Placement25" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                Visit Repository
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No Markdown files found in the Placement25 repository.</p>
        <a href="https://github.com/cetmca26/Placement25" target="_blank" rel="noopener noreferrer">
          <Button className="mt-4 flex items-center gap-2">
            <Github className="h-4 w-4" />
            Visit Repository
          </Button>
        </a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {files.map((file, index) => (
        <motion.div
          key={file.sha}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="flex h-full flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                {file.name}
              </CardTitle>
              <CardDescription>Placement Resource</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">Click to view the detailed content of this resource.</p>
            </CardContent>
            <div className="p-4 pt-0 space-y-2">
              <Button onClick={() => onFileSelect(file.name)} className="w-full">
                View Content
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                asChild
              >
                <a
                  href={`https://raw.githubusercontent.com/cetmca26/Placement25/main/${file.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Raw
                </a>
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
