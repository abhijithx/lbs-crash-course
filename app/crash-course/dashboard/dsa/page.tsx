"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, ExternalLink, Play, Search } from "lucide-react"
import { dsaQuestions } from "@/data/dsa-questions"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

export default function DSASheet() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [loading, setLoading] = useState(true)

  // Get unique topics
  const topics = ["All", ...Array.from(new Set(dsaQuestions.map((q) => q.topic)))]
  const difficulties = ["All", "Easy", "Medium", "Hard"]

  // Load user progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!user) return

      try {
        const progressDoc = await getDoc(doc(db, "dsaProgress", user.uid))
        if (progressDoc.exists()) {
          setCompletedQuestions(progressDoc.data().completedQuestions || [])
        }
      } catch (error) {
        console.error("Error loading DSA progress:", error)
      } finally {
        setLoading(false)
      }
    }

    loadProgress()
  }, [user])

  // Save progress to Firebase
  const saveProgress = async (newCompletedQuestions: number[]) => {
    if (!user) return

    try {
      await setDoc(doc(db, "dsaProgress", user.uid), {
        userId: user.uid,
        completedQuestions: newCompletedQuestions,
        lastUpdated: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error saving DSA progress:", error)
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle question completion
  const toggleCompletion = async (questionId: number) => {
    const newCompleted = completedQuestions.includes(questionId)
      ? completedQuestions.filter((id) => id !== questionId)
      : [...completedQuestions, questionId]

    setCompletedQuestions(newCompleted)
    await saveProgress(newCompleted)

    toast({
      title: completedQuestions.includes(questionId) ? "Unmarked" : "Completed!",
      description: completedQuestions.includes(questionId)
        ? "Question unmarked as completed"
        : "Great job! Keep going! 🎉",
    })
  }

  // Filter questions
  const filteredQuestions = dsaQuestions.filter((question) => {
    const matchesSearch =
      question.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.topic.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTopic = selectedTopic === "All" || question.topic === selectedTopic
    const matchesDifficulty = selectedDifficulty === "All" || question.difficulty === selectedDifficulty

    return matchesSearch && matchesTopic && matchesDifficulty
  })

  // Calculate progress
  const totalQuestions = dsaQuestions.length
  const completedCount = completedQuestions.length
  const progressPercentage = (completedCount / totalQuestions) * 100

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="ml-2">Loading DSA Sheet...</p>
      </div>
    )
  }

  return (
    <div className="container py-8 mb-8 mt-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">CETMCA26 DSA Sheet</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Master Data Structures and Algorithms with our curated list of 75 essential problems. Track your progress and
          prepare for technical interviews.
        </p>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Progress</span>
            <span className="text-2xl font-bold text-primary">
              {completedCount}/{totalQuestions}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-3 mb-2" />
          <p className="text-sm text-muted-foreground">
            {progressPercentage.toFixed(1)}% completed • {totalQuestions - completedCount} remaining
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions or topics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {topics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {difficulties.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((question) => {
          const isCompleted = completedQuestions.includes(question.id)

          return (
            <Card
              key={question.id}
              className={`transition-all ${isCompleted ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Completion Toggle */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCompletion(question.id)}
                    className="p-1 h-auto"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </Button>

                  {/* Question Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">#{question.id}</span>
                      <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                      <Badge variant="secondary">{question.topic}</Badge>
                    </div>
                    <h3 className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {question.name}
                    </h3>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={question.lcLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        LeetCode
                      </a>
                    </Button>

                    {question.youtubeLink ? (
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={question.youtubeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <Play className="h-4 w-4" />
                          Video
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled className="flex items-center gap-1 bg-transparent">
                        <Play className="h-4 w-4" />
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No questions found matching your filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
