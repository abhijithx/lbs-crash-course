"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AlertCircle, Share2, Trophy, Award, Medal, Crown, Star, Sparkles } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import type { LeaderboardEntry } from "@/types/quiz"

interface GroupLeaderboardProps {
  groupId: string
}

export function GroupLeaderboard({ groupId }: GroupLeaderboardProps) {
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [groupName, setGroupName] = useState<string>("")
  const [isSharing, setIsSharing] = useState(false)
  const podiumRef = useRef<HTMLDivElement>(null)

  // Helper function to extract username from email
  const getUsernameFromEmail = (email: string): string => {
    if (email.includes("@gmail.com")) {
      return email.replace("@gmail.com", "")
    }
    // For other email domains, extract the part before @
    return email.split("@")[0]
  }

  // Function to get specific avatar for top performers
  const getTopPerformerAvatar = (rank: number, username: string) => {
    const avatarProps = {
      1: {
        icon: Crown,
        bgColor: "bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500",
        iconColor: "text-yellow-900",
        borderColor: "border-yellow-400",
        size: "h-16 w-16 sm:h-24 sm:w-24",
        shadowColor: "shadow-yellow-400/50",
      },
      2: {
        icon: Award,
        bgColor: "bg-gradient-to-br from-gray-300 via-gray-400 to-slate-500",
        iconColor: "text-gray-900",
        borderColor: "border-gray-400",
        size: "h-14 w-14 sm:h-20 sm:w-20",
        shadowColor: "shadow-gray-400/50",
      },
      3: {
        icon: Medal,
        bgColor: "bg-gradient-to-br from-orange-300 via-orange-400 to-amber-600",
        iconColor: "text-orange-900",
        borderColor: "border-orange-400",
        size: "h-14 w-14 sm:h-20 sm:w-20",
        shadowColor: "shadow-orange-400/50",
      },
    }

    const config = avatarProps[rank as keyof typeof avatarProps]
    if (!config) return null

    const IconComponent = config.icon

    return (
      <div
        className={`${config.size} ${config.bgColor} ${config.borderColor} ${config.shadowColor} border-4 rounded-full flex items-center justify-center shadow-2xl relative transform hover:scale-105 transition-transform duration-300`}
      >
        <IconComponent className={`${config.iconColor} w-8 h-8 sm:w-12 sm:h-12`} />
        <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-bold border-3 border-current shadow-lg">
          {rank}
        </div>
        {rank === 1 && (
          <div className="absolute -top-1 -left-1">
            <Star className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500 fill-yellow-400 animate-pulse" />
          </div>
        )}
      </div>
    )
  }



  useEffect(() => {
    async function fetchLeaderboard() {
      if (!user || !groupId) return

      try {
        setLoading(true)
        setError(null)

        // First, get the group name for display
        try {
          const groupDoc = await getDoc(doc(db, "groups", groupId))
          if (groupDoc.exists()) {
            setGroupName(groupDoc.data().name || "")
          }
        } catch (err) {
          console.warn("Could not fetch group name:", err)
        }

        // Get all quizzes specifically for this group
        const quizzesQuery = query(collection(db, "quizzes"), where("groupId", "==", groupId))

        const quizzesSnapshot = await getDocs(quizzesQuery)

        if (quizzesSnapshot.empty) {
          console.log(`No quizzes found for group ${groupId}`)
          setLeaderboard([])
          setLoading(false)
          return
        }

        const quizIds = quizzesSnapshot.docs.map((doc) => doc.id)
        console.log(`Found ${quizIds.length} quizzes for group ${groupId}:`, quizIds)

        // Get all attempts for these specific quizzes
        const allAttempts: any[] = []

        // Process quizzes in batches to avoid Firestore limitations
        const batchSize = 10
        for (let i = 0; i < quizIds.length; i += batchSize) {
          const batch = quizIds.slice(i, i + batchSize)
          const attemptsQuery = query(collection(db, "quizAttempts"), where("quizId", "in", batch))

          const attemptsSnapshot = await getDocs(attemptsQuery)
          attemptsSnapshot.docs.forEach((doc) => {
            allAttempts.push({ id: doc.id, ...doc.data() })
          })
        }

        console.log(`Found ${allAttempts.length} attempts for group ${groupId}`)

        if (allAttempts.length === 0) {
          setLeaderboard([])
          setLoading(false)
          return
        }

        // Aggregate scores by user for this specific group
        const userScores: Record<
          string,
          {
            totalScore: number
            quizzesTaken: number
            attempts: any[]
          }
        > = {}

        allAttempts.forEach((attempt) => {
          const userId = attempt.userId

          if (!userScores[userId]) {
            userScores[userId] = {
              totalScore: 0,
              quizzesTaken: 0,
              attempts: [],
            }
          }

          userScores[userId].totalScore += attempt.score || 0
          userScores[userId].quizzesTaken += 1
          userScores[userId].attempts.push(attempt)
        })

        console.log(`Aggregated scores for ${Object.keys(userScores).length} users in group ${groupId}`)

        // Get user details for each user who has taken quizzes in this group
        const userPromises = Object.keys(userScores).map(async (userId) => {
          try {
            const userDoc = await getDoc(doc(db, "crashCourseUsers", userId))

            if (userDoc.exists()) {
              const userData = userDoc.data()
              let username = ""

              // Use displayName if available, otherwise extract from email
              if (userData.displayName && userData.displayName.trim() !== "") {
                username = userData.displayName
              } else if (userData.email) {
                username = getUsernameFromEmail(userData.email)
              } else {
                username = "Unknown User"
              }

              return {
                userId,
                username,
                totalScore: userScores[userId].totalScore,
                quizzesTaken: userScores[userId].quizzesTaken,
                groupId, // Add groupId to make it explicit
              } as LeaderboardEntry & { groupId: string }
            }

            // If user document doesn't exist, still show them with limited info
            return {
              userId,
              username: `User ${userId.substring(0, 8)}`,
              totalScore: userScores[userId].totalScore,
              quizzesTaken: userScores[userId].quizzesTaken,
              groupId,
            } as LeaderboardEntry & { groupId: string }
          } catch (err) {
            console.error(`Error fetching user ${userId}:`, err)
            return {
              userId,
              username: `User ${userId.substring(0, 8)}`,
              totalScore: userScores[userId].totalScore,
              quizzesTaken: userScores[userId].quizzesTaken,
              groupId,
            } as LeaderboardEntry & { groupId: string }
          }
        })

        const leaderboardEntries = await Promise.all(userPromises)

        // Sort by total score (descending), then by quizzes taken (ascending) as tiebreaker
        leaderboardEntries.sort((a, b) => {
          if (b.totalScore !== a.totalScore) {
            return b.totalScore - a.totalScore
          }
          return a.quizzesTaken - b.quizzesTaken
        })

        console.log(`Final leaderboard for group ${groupId}:`, leaderboardEntries)
        setLeaderboard(leaderboardEntries)
      } catch (err: any) {
        console.error("Error fetching group leaderboard:", err)
        setError(`Failed to load leaderboard for this group. Please try again.`)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [groupId, user])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 sm:py-12">
        <div className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="ml-2 text-sm sm:text-base">Loading group leaderboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6 sm:py-8 px-4">
        <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive text-sm sm:text-base mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
          Try Again
        </Button>
      </div>
    )
  }

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 px-4">
        <p className="text-muted-foreground mb-4 text-sm sm:text-base">No quiz attempts yet in this group.</p>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Leaderboard will be available once group members start taking quizzes.
        </p>
      </div>
    )
  }

  const topThree = leaderboard.slice(0, 3)

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 ">
      {/* Top 3 Podium Section */}
      {topThree.length > 0 && (
        <Card className="overflow-hidden   relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-4 left-4 opacity-20">
              <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
            </div>
            
            
          </div>

          <CardHeader className="text-center pb-2 px-4 sm:px-6 relative z-10 card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-3xl bg-gradient-to-r from-purple-600 p-4 via-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                   Hall of Fame 
                </CardTitle>
                     <span className="text-sm sm:text-base text-muted-foreground mt-4 pt-5">Group Quiz Toppers</span>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
             
                  {groupName ? `Group Name : ${groupName}  ` : "Group Champions"}
                </p>
                <hr className="mt-5"/>
              </div>
          
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:px-6 relative z-10" ref={podiumRef}>
            <div className="flex justify-center items-end gap-3 sm:gap-6 py-6 sm:py-8">
              {/* Second Place */}
              {topThree[1] && (
                <div className="flex flex-col items-center animate-in slide-in-from-left-5 duration-700 delay-200">
                  {getTopPerformerAvatar(2, topThree[1].username)}
                  <div className="mt-3 sm:mt-4 text-center ">
                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-3 border-gray-300 shadow-xl transform hover:scale-105 transition-transform duration-300">
                      <p className="font-bold text-gray-700 dark:text-gray-300 text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">
                        🥈 {topThree[1].username}
                        {topThree[1].userId === user?.uid && (
                          <span className="text-primary text-xs ml-1 hidden sm:inline">(You)</span>
                        )}
                      </p>
                      <p className="text-xl sm:text-3xl font-bold text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                        {topThree[1].totalScore} <span className="text-blue-500">💎</span>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {topThree[1].quizzesTaken} quiz{topThree[1].quizzesTaken !== 1 ? "es" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* First Place */}
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-5 duration-700 delay-100">
                {getTopPerformerAvatar(1, topThree[0].username)}
                <div className="mt-4 sm:mt-6 text-center">
                  <div className="bg-gradient-to-br from-yellow-200 via-yellow-300 to-amber-400 dark:from-yellow-600/50 dark:via-yellow-700/50 dark:to-amber-800/50 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-3 border-yellow-400 shadow-2xl transform hover:scale-105 transition-transform duration-300 relative">
                    <div className="absolute -top-2 -left-2">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full animate-ping"></div>
                    </div>
                    <p className="font-bold text-yellow-800 dark:text-yellow-200 text-base sm:text-lg truncate max-w-[120px] sm:max-w-none">
                      👑 {topThree[0].username}
                      {topThree[0].userId === user?.uid && (
                        <span className="text-yellow-700 text-sm ml-1 hidden sm:inline">(You)</span>
                      )}
                    </p>
                    <p className="text-2xl sm:text-4xl font-bold text-yellow-700 dark:text-yellow-300 flex items-center justify-center gap-2 my-2">
                      {topThree[0].totalScore} <span className="text-yellow-600 text-xl sm:text-3xl">💎</span>
                    </p>
                    <p className="text-sm sm:text-base text-yellow-700 dark:text-yellow-400 font-medium">
                      {topThree[0].quizzesTaken} quiz{topThree[0].quizzesTaken !== 1 ? "es" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Third Place */}
              {topThree[2] && (
                <div className="flex flex-col items-center animate-in slide-in-from-right-5 duration-700 delay-300">
                  {getTopPerformerAvatar(3, topThree[2].username)}
                  <div className="mt-3 sm:mt-4 text-center">
                    <div className="bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-800/50 dark:to-orange-900/50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-3 border-orange-400 shadow-xl transform hover:scale-105 transition-transform duration-300">
                      <p className="font-bold text-orange-700 dark:text-orange-300 text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">
                        🥉 {topThree[2].username}
                        {topThree[2].userId === user?.uid && (
                          <span className="text-primary text-xs ml-1 hidden sm:inline">(You)</span>
                        )}
                      </p>
                      <p className="text-xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 flex items-center justify-center gap-1">
                        {topThree[2].totalScore} <span className="text-orange-500">💎</span>
                      </p>
                      <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-500">
                        {topThree[2].quizzesTaken} quiz{topThree[2].quizzesTaken !== 1 ? "es" : ""}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Attribution */}
            <div className="text-center mt-6 pt-4 border-t border-purple-200 dark:border-purple-800">
              <p className="text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                LBS Crash Course Quiz Leaderboard
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Conducted o <span className="font-semibold">cetmca26.live</span> •{" "}
                {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            {groupName ? `${groupName} Leaderboard` : "Group Leaderboard"}
          </CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Showing results for {leaderboard.length} member{leaderboard.length !== 1 ? "s" : ""} in this group
          </p>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.userId}
                className={`p-3 rounded-lg border ${
                  entry.userId === user?.uid ? "bg-primary/5 border-primary/20" : "bg-card"
                } ${index < 3 ? "bg-gradient-to-r from-transparent via-blue-50/30 to-transparent dark:via-blue-900/20" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[24px]">
                      <span
                        className={`text-sm font-medium ${
                          index === 0
                            ? "text-yellow-600 font-bold"
                            : index === 1
                              ? "text-gray-600 font-bold"
                              : index === 2
                                ? "text-orange-600 font-bold"
                                : "text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${entry.username}`}
                        alt={entry.username}
                      />
                      <AvatarFallback>{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium truncate ${
                          entry.userId === user?.uid ? "text-primary" : ""
                        } ${index < 3 ? "font-semibold" : ""}`}
                      >
                        {entry.username}
                        {entry.userId === user?.uid && <span className="text-primary text-xs ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.quizzesTaken} quiz{entry.quizzesTaken !== 1 ? "es" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-medium ${
                        index === 0
                          ? "text-yellow-600 font-bold text-base"
                          : index === 1
                            ? "text-gray-600 font-bold"
                            : index === 2
                              ? "text-orange-600 font-bold"
                              : ""
                      } flex items-center gap-1`}
                    >
                      {entry.totalScore} <span className="text-blue-500">💎</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Quizzes Taken</TableHead>
                  <TableHead className="text-right">Total Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry, index) => (
                  <TableRow
                    key={entry.userId}
                    className={`${entry.userId === user?.uid ? "bg-primary/5 border-primary/20" : ""} ${
                      index < 3
                        ? "bg-gradient-to-r from-transparent via-blue-50/30 to-transparent dark:via-blue-900/20"
                        : ""
                    } animate-in slide-in-from-left-3 duration-500 hover:bg-muted/50 transition-colors`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <TableCell className="font-medium">
                      <span
                        className={`${
                          index === 0
                            ? "text-yellow-600 font-bold"
                            : index === 1
                              ? "text-gray-600 font-bold"
                              : index === 2
                                ? "text-orange-600 font-bold"
                                : "text-muted-foreground font-medium"
                        }`}
                      >
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${entry.username}`}
                            alt={entry.username}
                          />
                          <AvatarFallback>{entry.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span
                          className={`${entry.userId === user?.uid ? "font-medium text-primary" : ""} ${
                            index < 3 ? "font-semibold" : ""
                          }`}
                        >
                          {entry.username}
                          {entry.userId === user?.uid && <span className="text-primary text-sm ml-1">(You)</span>}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      <span className={index < 3 ? "font-medium" : ""}>{entry.quizzesTaken}</span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span
                        className={`${
                          index === 0
                            ? "text-yellow-600 font-bold text-lg"
                            : index === 1
                              ? "text-gray-600 font-bold"
                              : index === 2
                                ? "text-orange-600 font-bold"
                                : ""
                        } flex items-center justify-end gap-1`}
                      >
                        {entry.totalScore} <span className="text-blue-500">💎</span>
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
