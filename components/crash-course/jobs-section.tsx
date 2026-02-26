"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Job } from "@/types/job"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Briefcase, Calendar, DollarSign, Code, Building2, X } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function JobsSection() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      try {
        const jobsCollectionRef = collection(db, "jobs")
        const q = query(jobsCollectionRef, orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        const fetchedJobs: Job[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Job[]
        setJobs(fetchedJobs)
        setFilteredJobs(fetchedJobs)
      } catch (error) {
        console.error("Error fetching jobs:", error)
        // Optionally show an error message to the user
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    const results = jobs.filter(
      (job) =>
        job.company.toLowerCase().includes(lowerCaseSearchTerm) ||
        job.skills.some((skill) => skill.toLowerCase().includes(lowerCaseSearchTerm)) ||
        job.name.toLowerCase().includes(lowerCaseSearchTerm),
    )
    setFilteredJobs(results)
  }, [searchTerm, jobs])

  // Modal component
  function Modal({ job, onClose }: { job: Job, onClose: () => void }) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-2">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          className="bg-white dark:bg-zinc-950 rounded-lg shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <div className="flex items-center gap-2 text-lg font-bold">
                <Briefcase className="h-5 w-5" /> {job.name}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <Building2 className="h-4 w-4" /> {job.company}
              </div>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose} className="ml-2">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 flex flex-col px-6 pb-4 pt-2 overflow-y-auto">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" /> Last Date: {job.lastDate}
              <DollarSign className="h-4 w-4 ml-4" /> Package: {job.package}
            </div>
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <div
                className="rounded border px-3 py-2 bg-background max-h-48 overflow-y-auto scroll-thin"
                style={{ minHeight: 80 }}
              >
                <span className="whitespace-pre-wrap">{job.description}</span>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Skills Required</h4>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <Code className="h-3 w-3 mr-1" /> {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t px-6 py-4">
            <Link href={job.applyLink} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button className="w-full">Apply Now</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-muted-foreground">Loading jobs...</span>
      </div>
    )
  }

  return (
    <section className="py-8">
      {/* Modal for job details */}
      {selectedJob && <Modal job={selectedJob} onClose={() => setSelectedJob(null)} />}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Briefcase className="h-7 w-7" /> Job Opportunities
        </h2>
        <p className="text-muted-foreground">
          Explore the latest job openings tailored for MCA students and graduates.
        </p>
      </motion.div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by company, skills, or job title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 rounded-md border focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      {filteredJobs.length === 0 && !loading && (
        <div className="text-center text-muted-foreground py-10">No jobs found matching your search criteria.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="cursor-pointer"
            onClick={() => setSelectedJob(job)}
          >
            <Card className="h-full flex flex-col hover:ring-2 hover:ring-primary transition">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{job.name}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-muted-foreground">
                  <Building2 className="h-4 w-4" /> {job.company}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <p className="text-sm text-foreground line-clamp-3">{job.description}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" /> Last Date: {job.lastDate}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" /> Package: {job.package}
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        <Code className="h-3 w-3 mr-1" /> {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <span>View Details</span>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
