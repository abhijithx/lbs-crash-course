"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Search } from "lucide-react"

type BlogSection = {
  heading: string,
  content: string,
}
type BlogData = {
  id: string
  title: string
  description: string
  date: string
  userName: string
  sections: BlogSection[]
  links: string[]
}

export default function BlogDisplayPage() {
  const [allBlogs, setAllBlogs] = useState<BlogData[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<BlogData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [modalBlog, setModalBlog] = useState<BlogData | null>(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  async function fetchBlogs() {
    setLoading(true)
    try {
      // Fetch all user blog docs
      const userBlogDocs = await getDocs(collection(db, "studentBlogs"))
      const allBlogs: BlogData[] = []
      userBlogDocs.forEach(docSnap => {
        const data = docSnap.data()
        // Combine all blogs from each user
        if (data.blogs && Array.isArray(data.blogs)) {
          data.blogs.forEach((blog: BlogData) => {
            allBlogs.push(blog)
          })
        }
      })
      setAllBlogs(allBlogs)
      setFilteredBlogs(allBlogs)
    } catch (err) {
      setAllBlogs([])
      setFilteredBlogs([])
    } finally {
      setLoading(false)
    }
  }
  fetchBlogs()
}, [])
  // Filter by search input
  useEffect(() => {
    if (searchTerm.length < 1) {
      setFilteredBlogs(allBlogs)
      return
    }
    setFilteredBlogs(
      allBlogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.userName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }, [searchTerm, allBlogs])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Blogs</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse published blogs, sorted newest first.
        </p>
      </div>
      <div className="flex items-center mb-8 gap-4 max-w-md mx-auto">
        <Input
          type="text"
          placeholder="Search blog or author…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <Button type="button" size="icon" variant="outline">
          <Search className="h-5 w-5" />
        </Button>
      </div>
      {loading ? (
        <BlogListSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map(blog => (
            <Card
              key={blog.id}
              className="hover:ring-2 hover:ring-blue-400 transition cursor-pointer flex flex-col justify-between"
              onClick={() => setModalBlog(blog)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs text-gray-600 font-medium">@{blog.userName}</span>
                  <span className="text-xs text-gray-400 ml-auto">{blog.date}</span>
                </div>
                <CardTitle className="truncate">{blog.title}</CardTitle>
                <CardDescription className="line-clamp-2">{blog.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {blog.sections?.slice(0, 1).map((section, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="font-semibold text-sm">{section.heading}</div>
                    <div className="text-xs text-gray-600 line-clamp-2">{section.content}</div>
                  </div>
                ))}
                {blog.links?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {blog.links.map((l, idx) => (
                      <a key={idx} href={l} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline">
                        {l}
                      </a>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!modalBlog} onOpenChange={() => setModalBlog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{modalBlog?.title}</DialogTitle>
            <DialogDescription>
              by @{modalBlog?.userName} • {modalBlog?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="mb-2 text-gray-700 dark:text-gray-200">{modalBlog?.description}</div>
          <div className="mb-4">
            {modalBlog?.sections?.map((section, idx) => (
              <div key={idx} className="mb-3">
                <div className="font-semibold text-md mb-1">{section.heading}</div>
                <div className="text-sm">{section.content}</div>
              </div>
            ))}
          </div>
          {modalBlog?.links && modalBlog.links.length > 0 && (
            <div className="mb-2">
              <strong>Links:</strong>{" "}
              {modalBlog.links.map((l, idx) => (
                <a key={idx} href={l} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mx-1">
                  {l}
                </a>
              ))}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setModalBlog(null)}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Loading skeleton for blogs
function BlogListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}
    </div>
  )
}
