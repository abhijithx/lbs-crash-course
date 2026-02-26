"use client"

import { useEffect, useState } from "react"
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
import { getAllProjects } from "@/lib/firestore-utils"
import { Search } from "lucide-react"

// Define the structure of your Project card
type ProjectData = {
  id: string,
  title: string,
  description: string,
  imageUrl: string,
  repoLink: string,
  technologies: string[],
  teamMembers: string[],
  userName?: string,
  userAvatar?: string,
  userId?: string,
}

export default function ProjectsPage() {
  const [allProjects, setAllProjects] = useState<ProjectData[]>([])
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [modalProject, setModalProject] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch projects on mount
  useEffect(() => {
    setLoading(true)
    getAllProjects()
      .then((projects) => {
        setAllProjects(projects)
        setFilteredProjects(projects)
      })
      .finally(() => setLoading(false))
  }, [])

  // Search filter effect
  useEffect(() => {
    if (searchTerm.length < 1) {
      setFilteredProjects(allProjects)
      return
    }
    setFilteredProjects(
      allProjects.filter(project =>
        project.technologies.some(tech =>
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    )
  }, [searchTerm, allProjects])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Projects</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore all the projects developed by CETMCA26 students.
        </p>
      </div>

      <div className="flex items-center mb-8 gap-4 max-w-md mx-auto">
        <Input
          type="text"
          placeholder="Search by technology (e.g., React, Python)"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <Button type="button" size="icon" variant="outline">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {loading ? (
        <ProjectsListSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <Card
              key={project.id}
              className="hover:ring-2 hover:ring-blue-400 transition cursor-pointer flex flex-col justify-between"
              onClick={() => setModalProject(project)}
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  {project.userAvatar && (
                    <img
                      src={project.userAvatar}
                      alt="user avatar"
                      className="w-8 h-8 rounded-full border"
                    />
                  )}
                  <span className="text-sm text-gray-600">{project.userName}</span>
                </div>
                <CardTitle className="truncate">{project.title}</CardTitle>
                <CardDescription className="line-clamp-2">{project.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {project.imageUrl && (
                  <img
                    src={project.imageUrl}
                    className="rounded-lg w-full h-44 object-cover mb-4"
                    alt={project.title}
                  />
                )}
                <div className="mb-2">
                  <strong>Technologies:</strong>{" "}
                  {project.technologies && project.technologies.length > 0
                    ? project.technologies.join(", ")
                    : "None"
                  }
                </div>
                <div className="mb-2">
                  <strong>Team Members:</strong>{" "}
                  {project.teamMembers && project.teamMembers.length > 0
                    ? project.teamMembers.join(", ")
                    : "None"
                  }
                </div>
                <div className="flex gap-2 flex-wrap">
                  {project.repoLink && (
                    <a
                      href={project.repoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      GitHub/Demo
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={!!modalProject} onOpenChange={() => setModalProject(null)}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-4">
              {modalProject?.imageUrl && (
                <img
                  src={modalProject.imageUrl}
                  alt={modalProject.title}
                  className="w-20 h-20 rounded-lg object-cover border"
                />
              )}
              <div>
                <DialogTitle className="text-2xl font-bold">{modalProject?.title}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  by {modalProject?.userName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="mb-4">
            <p>{modalProject?.description}</p>
          </div>
          <div className="mb-2">
            <strong>Technologies:</strong>{" "}
            {modalProject?.technologies && modalProject.technologies.length > 0
              ? modalProject.technologies.join(", ")
              : "None"
            }
          </div>
          <div className="mb-2">
            <strong>Team Members:</strong>{" "}
            {modalProject?.teamMembers && modalProject.teamMembers.length > 0
              ? modalProject.teamMembers.join(", ")
              : "None"
            }
          </div>
          {modalProject?.repoLink && (
            <div className="mb-2">
              <a
                href={modalProject.repoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                GitHub/Live Demo
              </a>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setModalProject(null)}>
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Skeleton for loading state
function ProjectsListSkeleton() {
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
