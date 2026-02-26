"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { useCrashCourseAuth } from "@/contexts/crash-course-auth-context"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Loader2, Edit, Save } from "lucide-react"
import { Separator } from "@/components/ui/separator"

// Data model for a single project.
type ProjectData = {
  id: string,
  title: string,
  description: string,
  imageUrl: string,
  repoLink: string,
  technologies: string[],
  teamMembers: string[]
};

const defaultProject: ProjectData = {
  id: "",
  title: "",
  description: "",
  imageUrl: "",
  repoLink: "",
  technologies: [],
  teamMembers: [],
};

export default function ProjectPage() {
  const { user, loading: authLoading } = useCrashCourseAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch projects on mount
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/crash-course");
      return;
    }
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "studentProjects", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProjects(docSnap.data().projects || []);
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load projects", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProjects();
  }, [user, authLoading, router, toast]);

  // Add new project (blank form)
  const addProject = () => {
    let userName = "";
  if (user && user.email) {
    userName = user.email.replace(/@gmail\.com$/i, "");
  }
  setProjects((prev) => [
    ...prev,
    { ...defaultProject, id: Date.now().toString(), userName },
  ]);
  setEditingIndex(projects.length);
  };

  // Remove project
  const removeProject = (index: number) => {
    setProjects((prev) => prev.filter((_, i) => i !== index));
    setEditingIndex(null);
  };

  // Start editing existing project
  const editProject = (index: number) => {
    setEditingIndex(index);
  };

  // Handle form change
  const handleChange = (
    index: number,
    field: keyof ProjectData,
    value: string | string[]
  ) => {
    setProjects((prev) => {
      const updated = [...prev];
      // Handle array conversion for comma-separated fields
      if (field === "technologies" || field === "teamMembers") {
        updated[index][field] = (typeof value === "string"
          ? value.split(",").map(v => v.trim()).filter(Boolean)
          : value) as string[];
      } else {
        updated[index][field] = value as string;
      }
      return updated;
    });
  };

  // Save all projects to Firestore
  const handleSave = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await setDoc(doc(db, "studentProjects", user.uid), {
        projects: projects,
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Success", description: "Projects updated!" });
      setEditingIndex(null);
    } catch (err) {
      toast({ title: "Error", description: "Failed to save data.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel editing
  const cancelEdit = () => setEditingIndex(null);

  if (loading || authLoading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100svh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading projects...</span>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Your Projects</CardTitle>
          <CardDescription className="text-muted-foreground">
            Add, edit, or remove your projects here. The details help showcase your skills and teamwork.
          </CardDescription>
          {/* Show user name and email */}
          {user && (
            <div className="mt-2 space-y-1 text-sm">
              <div><strong>Name:</strong> {user.displayName ?? "No name found"}</div>
              <div><strong>Email:</strong> {user.email ?? "No email found"}</div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={addProject} variant="outline" className="mb-6">
            <Plus className="h-4 w-4 mr-2" /> Add Project
          </Button>
          <Separator />
          {projects.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">No projects added yet.</p>
          )}
          {projects.map((project, index) => (
            <Card key={project.id} className="my-4 p-4 space-y-3 relative">
              {editingIndex === index ? (
                <>
                  <div>
                    <Label htmlFor={`title-${index}`}>Project Title</Label>
                    <Input id={`title-${index}`}
                      value={project.title}
                      onChange={(e) => handleChange(index, "title", e.target.value)}
                      required
                      placeholder="Project name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`desc-${index}`}>Description</Label>
                    <Textarea id={`desc-${index}`}
                      value={project.description}
                      onChange={(e) => handleChange(index, "description", e.target.value)}
                      rows={2}
                      placeholder="Project description"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`imgurl-${index}`}>Image URL</Label>
                    <Input id={`imgurl-${index}`}
                      value={project.imageUrl}
                      onChange={(e) => handleChange(index, "imageUrl", e.target.value)}
                      placeholder="Image URL"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`repo-${index}`}>Repo/Demo Link</Label>
                    <Input id={`repo-${index}`}
                      value={project.repoLink}
                      onChange={(e) => handleChange(index, "repoLink", e.target.value)}
                      placeholder="e.g., https://github.com/yourusername/project"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`tech-${index}`}>Technologies (dot-separated)</Label>
                    <Input id={`tech-${index}`}
                      value={project.technologies.join(", ")}
                      onChange={(e) => handleChange(index, "technologies", e.target.value)}
                      placeholder="React, Node.js, MongoDB"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`team-${index}`}>Team Members (dot-separated)</Label>
                    <Input id={`team-${index}`}
                      value={project.teamMembers.join(", ")}
                      onChange={(e) => handleChange(index, "teamMembers", e.target.value)}
                      placeholder="Alice, Bob, Carol"
                    />
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
                  <div>
                    <strong>{project.title}</strong>
                  </div>
                  <div>{project.description}</div>
                  <div>
                    {project.imageUrl && (
                      <img src={project.imageUrl} alt="Project image" className="max-h-32 rounded" />
                    )}
                  </div>
                  <div>
                    <a href={project.repoLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Repo/Demo Link
                    </a>
                  </div>
                  <div>
                    <span className="font-semibold">Technologies:</span> {project.technologies.length > 0 ? project.technologies.join(", ") : "None"}
                  </div>
                  <div>
                    <span className="font-semibold">Team Members:</span> {project.teamMembers.length > 0 ? project.teamMembers.join(", ") : "None"}
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button type="button" onClick={() => editProject(index)} variant="outline">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => removeProject(index)}>
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
  );
}
