"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { useCrashCourseAuth } from "@/contexts/crash-course-auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Loader2, Edit, Save, Link2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

type BlogSection = {
  heading: string
  content: string
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

// Blog Template
const defaultBlog: BlogData = {
  id: "",
  title: "",
  description: "",
  date: "",
  userName: "",
  sections: [{ heading: "", content: "" }],
  links: [],
}

export default function BlogAddPage() {
  const { user, loading: authLoading } = useCrashCourseAuth()
  const [blogs, setBlogs] = useState<BlogData[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Fetch blogs on mount (FireStore code can be added here)
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/crash-course")
      return
    }
    const fetchBlogs = async () => {
      setLoading(true)
      try {
        const docRef = doc(db, "studentBlogs", user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setBlogs(docSnap.data().blogs || [])
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load blogs", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchBlogs()
  }, [user, authLoading, router, toast])

  // Add blog
  const addBlog = () => {
    let userName = ""
    if (user && user.email) {
      userName = user.email.replace(/@gmail\.com$/i, "")
    }
    setBlogs((prev) => [
      ...prev,
      {
        ...defaultBlog,
        id: Date.now().toString(),
        userName,
        date: new Date().toISOString().slice(0, 10),
      },
    ])
    setEditingIndex(blogs.length)
  }

  // Remove blog
  const removeBlog = (index: number) => {
    setBlogs((prev) => prev.filter((_, i) => i !== index))
    setEditingIndex(null)
  }

  // Edit blog
  const editBlog = (index: number) => {
    setEditingIndex(index)
  }

  // Handle simple blog field change
  const handleChange = (index: number, field: keyof BlogData, value: string | BlogSection[] | string[]) => {
    setBlogs((prev) => {
      const updated = [...prev]
      if (field === "links") {
        updated[index][field] = typeof value === "string"
          ? value.split(",").map(v => v.trim()).filter(Boolean)
          : value as string[]
      } else {
        updated[index][field] = value as any
      }
      return updated
    })
  }

  // Add/remove/change sections for a blog
  const handleSectionChange = (blogIdx: number, secIdx: number, field: keyof BlogSection, value: string) => {
    setBlogs((prev) => {
      const updated = [...prev]
      updated[blogIdx].sections[secIdx][field] = value
      return updated
    })
  }

  const addSection = (blogIdx: number) => {
    setBlogs((prev) => {
      const updated = [...prev]
      updated[blogIdx].sections.push({ heading: "", content: "" })
      return updated
    })
  }

  const removeSection = (blogIdx: number, secIdx: number) => {
    setBlogs((prev) => {
      const updated = [...prev]
      updated[blogIdx].sections = updated[blogIdx].sections.filter((_, i) => i !== secIdx)
      return updated
    })
  }

  // Save all blogs to Firestore
  const handleSave = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" })
      return
    }
    setIsSaving(true)
    try {
      await setDoc(doc(db, "studentBlogs", user.uid), {
        blogs: blogs,
        updatedAt: serverTimestamp(),
      })
      toast({ title: "Success", description: "Blogs saved!" })
      setEditingIndex(null)
    } catch (err) {
      toast({ title: "Error", description: "Failed to save data.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  // Cancel edit mode
  const cancelEdit = () => setEditingIndex(null)

  if (loading || authLoading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100svh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading blogs...</span>
      </div>
    )

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Your Blogs</CardTitle>
          <CardDescription className="text-muted-foreground">
            Add, edit, or remove your blogs. Each blog supports multiple sections, links, and shows your username!
          </CardDescription>
          {user && (
            <div className="mt-2 space-y-1 text-sm">
              <div><strong>Name:</strong> {user.displayName ?? "No name found"}</div>
              <div><strong>Email:</strong> {user.email ?? "No email found"}</div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={addBlog} variant="outline" className="mb-6">
            <Plus className="h-4 w-4 mr-2" /> Add Blog
          </Button>
          <Separator />
          {blogs.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">No blogs added yet.</p>
          )}
          {blogs.map((blog, index) => (
            <Card key={blog.id} className="my-4 p-4 space-y-4 relative">
              {editingIndex === index ? (
                <>
                  <div>
                    <Label htmlFor={`title-${index}`}>Blog Title</Label>
                    <Input id={`title-${index}`} value={blog.title} onChange={e => handleChange(index, "title", e.target.value)} required placeholder="Blog title" />
                  </div>
                  <div>
                    <Label htmlFor={`desc-${index}`}>Description</Label>
                    <Textarea id={`desc-${index}`} value={blog.description} onChange={e => handleChange(index, "description", e.target.value)} rows={2} placeholder="Blog description" />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={blog.date} onChange={e => handleChange(index, "date", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor={`links-${index}`}>Links (comma separated)</Label>
                    <Input id={`links-${index}`} value={blog.links.join(", ")} onChange={e => handleChange(index, "links", e.target.value)} placeholder="https://, ..." />
                  </div>
                  <Separator className="my-4" />
                  <div>
                    <Label>Sections</Label>
                    <div className="flex flex-col gap-4 mt-2">
                      {blog.sections.map((section, secIdx) => (
                        <Card key={secIdx} className="p-3">
                          <div className="flex flex-row gap-2 items-center">
                            <Label htmlFor={`heading-${index}-${secIdx}`} className="flex-shrink-0">Heading</Label>
                            <Input id={`heading-${index}-${secIdx}`} value={section.heading} onChange={e => handleSectionChange(index, secIdx, "heading", e.target.value)} placeholder="Section heading" />
                          </div>
                          <div className="mt-2">
                            <Label htmlFor={`content-${index}-${secIdx}`}>Content</Label>
                            <Textarea id={`content-${index}-${secIdx}`} value={section.content} onChange={e => handleSectionChange(index, secIdx, "content", e.target.value)} rows={2} placeholder="Section content" />
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="destructive" onClick={() => removeSection(index, secIdx)}>
                              <Minus className="h-4 w-4 mr-2" /> Remove Section
                            </Button>
                          </div>
                        </Card>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => addSection(index)} className="mt-2">
                        <Plus className="h-4 w-4 mr-2" /> Add Section
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="button" onClick={handleSave} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save
                    </Button>
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <strong>{blog.title}</strong>
                    <span className="text-xs text-muted-foreground">{blog.date}</span>
                  </div>
                  <div>{blog.description}</div>
                  <div>
                    <span className="text-xs text-gray-600">By @{blog.userName}</span>
                  </div>
                  {blog.links.length > 0 && (
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {blog.links.map((link, linkIdx) => (
                        <a key={linkIdx} href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <Link2 className="w-4 h-4" /> {link}
                        </a>
                      ))}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Sections:</span>
                    {blog.sections.length > 0 ? (
                      <div className="mt-2 flex flex-col gap-2">
                        {blog.sections.map((section, secIdx) => (
                          <Card key={secIdx} className="p-3">
                            <div className="text-sm font-bold">{section.heading}</div>
                            <div className="text-xs">{section.content}</div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground ml-1">None</span>
                    )}
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="button" onClick={() => editBlog(index)} variant="outline">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => removeBlog(index)}>
                      <Minus className="h-4 w-4 mr-2" /> Remove
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
