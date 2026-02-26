"use client"

import { useState, useEffect } from "react"
import { useCrashCourseAuth } from "@/contexts/crash-course-auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AlertCircle, Trophy } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc, orderBy } from "firebase/firestore"

interface QuizLeaderboardEntry {
  userId: string
  username: string
  score: number
  completedAt: Date
}

interface Quiz {
  id: string
  title: string
  createdAt: Date
}

interface GroupLeaderboardProps {
  quizId: string
}

// Helper function to extract username from email
function extractUsernameFromEmail(email: string): string {
  if (!email) return "Unknown User"
  return email.replace(/@gmail\.com$/, "")
}

export function GroupLeaderboard({ quizId }: GroupLeaderboardProps) {
  const { user } = useCrashCourseAuth()
  const [quizTitle, setQuizTitle] = useState<string>("")
  const [leaderboard, setLeaderboard] = useState<QuizLeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch quiz details and leaderboard
  useEffect(() => {
    async function fetchQuizLeaderboard() {
      if (!quizId) return

      try {
        setLoading(true)

        // Get quiz details
        const quizDoc = await getDoc(doc(db, "quizzes", quizId))
        if (quizDoc.exists()) {
          setQuizTitle(quizDoc.data().title || "Quiz")
        }

        // Get all attempts for this specific quiz
        const attemptsQuery = query(
          collection(db, "quizAttempts"), 
          where("quizId", "==", quizId)
        )

        const attemptsSnapshot = await getDocs(attemptsQuery)

        // Process attempts and get user details
        const leaderboardData: QuizLeaderboardEntry[] = []

        for (const attemptDoc of attemptsSnapshot.docs) {
          const attempt = attemptDoc.data()
          
          // Get user details
          const userDoc = await getDoc(doc(db, "crashCourseUsers", attempt.userId))
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            
            // Extract username from email or use existing username
            const displayUsername = userData.username || extractUsernameFromEmail(userData.email) || "Unknown User"
            
            leaderboardData.push({
              userId: attempt.userId,
              username: displayUsername,
              score: attempt.score || 0,
              completedAt: attempt.completedAt?.toDate() || new Date()
            })
          }
        }

        // Sort by score (descending), then by completion time (ascending) for tie-breaking
        leaderboardData.sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score
          }
          return a.completedAt.getTime() - b.completedAt.getTime()
        })

        setLeaderboard(leaderboardData)
      } catch (err: any) {
        console.error("Error fetching quiz leaderboard:", err)
        setError("Failed to load leaderboard. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchQuizLeaderboard()
  }, [quizId])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="ml-2">Loading leaderboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">No attempts yet for this quiz.</p>
        <p className="text-sm text-muted-foreground">
          Be the first to take this quiz and appear on the leaderboard!
        </p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Leaderboard
          {quizTitle && <span className="text-muted-foreground">- {quizTitle}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Score</TableHead>
          
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry, index) => (
              <TableRow key={entry.userId} className={entry.userId === user?.uid ? "bg-primary/5" : ""}>
                <TableCell className="font-medium">
                  {index === 0 ? (
                    <span className="text-yellow-500 font-bold">🥇 1</span>
                  ) : index === 1 ? (
                    <span className="text-gray-500 font-bold">🥈 2</span>
                  ) : index === 2 ? (
                    <span className="text-amber-700 font-bold">🥉 3</span>
                  ) : (
                    index + 1
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${entry.username}`}
                        alt={entry.username}
                      />
                      <AvatarFallback>{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className={entry.userId === user?.uid ? "font-medium" : ""}>
                      {entry.username}
                      {entry.userId === user?.uid && " (You)"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{entry.score}</TableCell>
              
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}