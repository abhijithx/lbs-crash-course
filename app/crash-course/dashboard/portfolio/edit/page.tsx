"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCrashCourseAuth } from "@/contexts/crash-course-auth-context"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Loader2, CheckCircle, Edit } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import type { StudentPortfolioData } from "@/types/student-portfolio"

const defaultPortfolio: StudentPortfolioData = {
  id: "",
  name: "",
  avatar: "/placeholder.svg?height=200&width=200",
  role: "",
  skills: [],
  bio: "",
  github: "",
  linkedin: "",
  email: "",
  cv: "", // Added cv field to default portfolio
  experience: [],
  education: [],
  projects: [],
}

export default function EditPortfolioPage() {
  const { user, loading: authLoading } = useCrashCourseAuth()
  const [portfolio, setPortfolio] = useState<StudentPortfolioData>(defaultPortfolio)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isEditing, setIsEditing] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/crash-course") // Redirect to login if not authenticated
      return
    }

    if (user) {
      const fetchPortfolio = async () => {
        setLoading(true)
        try {
          const docRef = doc(db, "studentPortfolios", user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setPortfolio({ ...defaultPortfolio, ...(docSnap.data() as StudentPortfolioData), id: user.uid })
            setIsSaved(true)
            setIsEditing(false) // If portfolio exists, show view mode first
          } else {
            setPortfolio({ ...defaultPortfolio, id: user.uid, email: user.email || "" })
            setIsSaved(false)
            setIsEditing(true) // New portfolio, start in edit mode
          }
        } catch (error) {
          console.error("Error fetching portfolio:", error)
          toast({
            title: "Error",
            description: "Failed to load portfolio data.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
      fetchPortfolio()
    }
  }, [user, authLoading, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPortfolio((prev) => ({ ...prev, [name]: value }))
  }

  const handleArrayChange = (
    index: number,
    field: string,
    value: string,
    arrayName: "experience" | "education" | "projects",
  ) => {
    setPortfolio((prev) => {
      const newArray = [...prev[arrayName]]
      ;(newArray[index] as any)[field] = value
      return { ...prev, [arrayName]: newArray }
    })
  }

  const addArrayItem = (arrayName: "experience" | "education" | "projects") => {
    setPortfolio((prev) => {
      const newArray = [...prev[arrayName]]
      if (arrayName === "experience") {
        newArray.push({ id: Date.now().toString(), company: "", role: "", duration: "", description: "" })
      } else if (arrayName === "education") {
        newArray.push({ id: Date.now().toString(), institution: "", degree: "", duration: "", description: "" })
      } else if (arrayName === "projects") {
        newArray.push({ id: Date.now().toString(), title: "", description: "", technologies: [], link: "" })
      }
      return { ...prev, [arrayName]: newArray as any }
    })
  }

  const removeArrayItem = (arrayName: "experience" | "education" | "projects", index: number) => {
    setPortfolio((prev) => {
      const newArray = [...prev[arrayName]]
      newArray.splice(index, 1)
      return { ...prev, [arrayName]: newArray as any }
    })
  }

  const handleProjectTechnologiesChange = (index: number, value: string) => {
    setPortfolio((prev) => {
      const newProjects = [...prev.projects]
      newProjects[index].technologies = value
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean)
      return { ...prev, projects: newProjects }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save your portfolio.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const portfolioToSave = {
        ...portfolio,
        skills: portfolio.skills.map((skill) => skill.trim()).filter(Boolean), // Ensure skills are trimmed and not empty
        updatedAt: serverTimestamp(),
      }
      await setDoc(doc(db, "studentPortfolios", user.uid), portfolioToSave)
      
      setIsSaved(true)
      setIsEditing(false)
      
      toast({
        title: "Success",
        description: "Your portfolio has been saved successfully!",
      })
    } catch (error) {
      console.error("Error saving portfolio:", error)
      toast({
        title: "Error",
        description: "Failed to save portfolio data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    // Optionally reload the portfolio data to revert changes
    if (user) {
      const fetchPortfolio = async () => {
        try {
          const docRef = doc(db, "studentPortfolios", user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setPortfolio({ ...defaultPortfolio, ...(docSnap.data() as StudentPortfolioData), id: user.uid })
          }
        } catch (error) {
          console.error("Error fetching portfolio:", error)
        }
      }
      fetchPortfolio()
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100svh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading portfolio editor...</p>
      </div>
    )
  }

  // Success View (after saving)
  if (isSaved && !isEditing) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800">Portfolio Saved Successfully!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your portfolio has been saved and is now available for others to view.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Portfolio Preview Summary */}
            <div className="rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold">Portfolio Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Name:</strong> {portfolio.name}
                </div>
                <div>
                  <strong>Role:</strong> {portfolio.role}
                </div>
                <div>
                  <strong>Skills:</strong> {portfolio.skills.join(", ")}
                </div>
                <div>
                  <strong>Experience:</strong> {portfolio.experience.length} entries
                </div>
                <div>
                  <strong>Education:</strong> {portfolio.education.length} entries
                </div>
                <div>
                  <strong>Projects:</strong> {portfolio.projects.length} entries
                </div>
                {portfolio.cv && (
                  <div className="md:col-span-2">
                    <strong>CV:</strong> <a href={portfolio.cv} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View CV</a>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleEditClick} variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit Portfolio
              </Button>
              <Button 
                onClick={() => window.open(`/students/${user?.uid}`, '_blank')} 
                className="flex items-center gap-2"
              >
                View Public Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Edit Mode (form view)
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold">
                {isSaved ? "Edit Your Portfolio" : "Create Your Portfolio"}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isSaved 
                  ? "Update your professional details, experience, education, and projects." 
                  : "Add your professional details, experience, education, and projects."
                }
              </CardDescription>
            </div>
            {isSaved && (
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" value={portfolio.name} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="role">Role/Title</Label>
                  <Input id="role" name="role" value={portfolio.role} onChange={handleChange} required />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    name="avatar"
                    value={portfolio.avatar}
                    onChange={handleChange}
                    placeholder="e.g., https://example.com/your-avatar.png"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={portfolio.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="A short description about yourself..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={portfolio.email}
                    onChange={handleChange}
                    required
                    disabled // Email usually comes from auth, not editable here
                  />
                </div>
                <div>
                  <Label htmlFor="cv">CV/Resume URL</Label>
                  <Input
                    id="cv"
                    name="cv"
                    type="url"
                    value={portfolio.cv || ""}
                    onChange={handleChange}
                    placeholder="e.g., https://example.com/your-resume.pdf"
                  />
                </div>
                <div>
                  <Label htmlFor="github">GitHub Profile URL</Label>
                  <Input
                    id="github"
                    name="github"
                    type="url"
                    value={portfolio.github}
                    onChange={handleChange}
                    placeholder="e.g., https://github.com/yourusername"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    value={portfolio.linkedin}
                    onChange={handleChange}
                    placeholder="e.g., https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    name="skills"
                    value={portfolio.skills.join(", ")}
                    onChange={(e) =>
                      setPortfolio((prev) => ({
                        ...prev,
                        skills: e.target.value.split(",").map((s) => s.trim()),
                      }))
                    }
                    placeholder="e.g., React, Node.js, Python, SQL"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Experience */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Experience</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("experience")}>
                  <Plus className="h-4 w-4 mr-2" /> Add Experience
                </Button>
              </div>
              {portfolio.experience.map((exp, index) => (
                <Card key={exp.id} className="p-4 space-y-3 relative">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeArrayItem("experience", index)}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Remove Experience</span>
                  </Button>
                  <div>
                    <Label htmlFor={`exp-role-${index}`}>Role</Label>
                    <Input
                      id={`exp-role-${index}`}
                      value={exp.role}
                      onChange={(e) => handleArrayChange(index, "role", e.target.value, "experience")}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`exp-company-${index}`}>Company</Label>
                    <Input
                      id={`exp-company-${index}`}
                      value={exp.company}
                      onChange={(e) => handleArrayChange(index, "company", e.target.value, "experience")}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`exp-duration-${index}`}>Duration</Label>
                    <Input
                      id={`exp-duration-${index}`}
                      value={exp.duration}
                      onChange={(e) => handleArrayChange(index, "duration", e.target.value, "experience")}
                      placeholder="e.g., 2022 - Present"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`exp-description-${index}`}>Description</Label>
                    <Textarea
                      id={`exp-description-${index}`}
                      value={exp.description}
                      onChange={(e) => handleArrayChange(index, "description", e.target.value, "experience")}
                      rows={3}
                      placeholder="Briefly describe your responsibilities and achievements."
                      required
                    />
                  </div>
                </Card>
              ))}
              {portfolio.experience.length === 0 && (
                <p className="text-muted-foreground text-sm text-center">No experience added yet.</p>
              )}
            </div>

            <Separator />

            {/* Education */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Education</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("education")}>
                  <Plus className="h-4 w-4 mr-2" /> Add Education
                </Button>
              </div>
              {portfolio.education.map((edu, index) => (
                <Card key={edu.id} className="p-4 space-y-3 relative">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeArrayItem("education", index)}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Remove Education</span>
                  </Button>
                  <div>
                    <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                    <Input
                      id={`edu-degree-${index}`}
                      value={edu.degree}
                      onChange={(e) => handleArrayChange(index, "degree", e.target.value, "education")}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
                    <Input
                      id={`edu-institution-${index}`}
                      value={edu.institution}
                      onChange={(e) => handleArrayChange(index, "institution", e.target.value, "education")}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edu-duration-${index}`}>Duration</Label>
                    <Input
                      id={`edu-duration-${index}`}
                      value={edu.duration}
                      onChange={(e) => handleArrayChange(index, "duration", e.target.value, "education")}
                      placeholder="e.g., 2021 - 2024"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`edu-description-${index}`}>Description</Label>
                    <Textarea
                      id={`edu-description-${index}`}
                      value={edu.description}
                      onChange={(e) => handleArrayChange(index, "description", e.target.value, "education")}
                      rows={3}
                      placeholder="Briefly describe your studies and achievements."
                      required
                    />
                  </div>
                </Card>
              ))}
              {portfolio.education.length === 0 && (
                <p className="text-muted-foreground text-sm text-center">No education added yet.</p>
              )}
            </div>

            <Separator />

            {/* Projects */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Projects</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("projects")}>
                  <Plus className="h-4 w-4 mr-2" /> Add Project
                </Button>
              </div>
              {portfolio.projects.map((project, index) => (
                <Card key={project.id} className="p-4 space-y-3 relative">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeArrayItem("projects", index)}
                  >
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">Remove Project</span>
                  </Button>
                  <div>
                    <Label htmlFor={`proj-title-${index}`}>Project Title</Label>
                    <Input
                      id={`proj-title-${index}`}
                      value={project.title}
                      onChange={(e) => handleArrayChange(index, "title", e.target.value, "projects")}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`proj-description-${index}`}>Description</Label>
                    <Textarea
                      id={`proj-description-${index}`}
                      value={project.description}
                      onChange={(e) => handleArrayChange(index, "description", e.target.value, "projects")}
                      rows={3}
                      placeholder="Briefly describe your project."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`proj-technologies-${index}`}>Technologies (comma-separated)</Label>
                    <Input
                      id={`proj-technologies-${index}`}
                      value={project.technologies.join(", ")}
                      onChange={(e) => handleProjectTechnologiesChange(index, e.target.value)}
                      placeholder="e.g., React, Node.js, MongoDB"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`proj-link-${index}`}>Project Link (GitHub/Live Demo)</Label>
                    <Input
                      id={`proj-link-${index}`}
                      type="url"
                      value={project.link}
                      onChange={(e) => handleArrayChange(index, "link", e.target.value, "projects")}
                      placeholder="e.g., https://github.com/yourusername/yourproject"
                    />
                  </div>
                </Card>
              ))}
              {portfolio.projects.length === 0 && (
                <p className="text-muted-foreground text-sm text-center">No projects added yet.</p>
              )}
            </div>

            <CardFooter className="flex justify-end p-0 pt-8">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Portfolio"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
