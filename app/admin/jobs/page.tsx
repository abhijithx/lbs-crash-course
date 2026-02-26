"use client"

import type React from "react"
import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Loader2, PlusCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminJobsPage() {
  const [jobData, setJobData] = useState({
    name: "",
    description: "",
    company: "",
    lastDate: "",
    skills: "", // Comma-separated string
    package: "",
    applyLink: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setJobData((prevData) => ({
      ...prevData,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const skillsArray = jobData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)

      await addDoc(collection(db, "jobs"), {
        ...jobData,
        skills: skillsArray,
        createdAt: serverTimestamp(),
      })

      toast({
        title: "Job Posted Successfully!",
        description: "The new job listing has been added.",
        variant: "default",
      })

      // Clear form
      setJobData({
        name: "",
        description: "",
        company: "",
        lastDate: "",
        skills: "",
        package: "",
        applyLink: "",
      })
    } catch (error) {
      console.error("Error adding job:", error)
      toast({
        title: "Error Posting Job",
        description: "There was an error adding the job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          <PlusCircle className="h-9 w-9" /> Post New Job
        </h1>
        <p className="text-muted-foreground">Add new job opportunities for students.</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
          <CardDescription>Fill in the information for the new job listing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Job Title</Label>
              <Input id="name" value={jobData.name} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={jobData.company} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={jobData.description} onChange={handleChange} required rows={5} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lastDate">Application Last Date</Label>
                <Input id="lastDate" type="date" value={jobData.lastDate} onChange={handleChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="package">Package (e.g., "5 LPA - 8 LPA")</Label>
                <Input id="package" value={jobData.package} onChange={handleChange} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skills">Skills (comma-separated, e.g., "React, Node.js, Firebase")</Label>
              <Input
                id="skills"
                value={jobData.skills}
                onChange={handleChange}
                placeholder="e.g., React, Node.js, SQL"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="applyLink">Apply Link</Label>
              <Input id="applyLink" type="url" value={jobData.applyLink} onChange={handleChange} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                </>
              ) : (
                "Post Job"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
