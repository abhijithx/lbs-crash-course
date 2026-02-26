"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Users, Crown, Award, Medal, Sparkles, Eye, Star, ChevronRight } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, query, getDocs, doc, getDoc, where } from "firebase/firestore"

interface GroupData {
  id: string
  name: string
  memberCount: number
  topPerformers: {
    username: string
    score: number
    userId: string
  }[]
}

interface GroupTopperModalProps {
  group: GroupData
  isOpen: boolean
  onClose: () => void
}

function GroupTopperModal({ group, isOpen, onClose }: GroupTopperModalProps) {
  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Award className="h-6 w-6 text-gray-500" />
      case 2:
        return <Medal className="h-6 w-6 text-orange-500" />
      default:
        return <Star className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getRankBg = (index: number) => {
    switch (index) {
      case 0:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/50 dark:to-yellow-900/50 border-yellow-200"
      case 1:
        return "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950/50 dark:to-gray-900/50 border-gray-200"
      case 2:
        return "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200"
      default:
        return "bg-card border"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {group.name} - Hall of Fame
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96 pr-4">
          <div className="space-y-4">
            {group.topPerformers.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No quiz attempts yet in this group</p>
                <p className="text-sm text-muted-foreground mt-2">Be the first to take a quiz!</p>
              </div>
            ) : (
              group.topPerformers.map((performer, index) => (
                <div
                  key={performer.userId}
                  className={`p-4 rounded-xl border transition-all duration-200 ${getRankBg(index)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background/50">
                      {getRankIcon(index)}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${performer.username}`}
                        alt={performer.username}
                      />
                      <AvatarFallback>{performer.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{performer.username}</h4>
                      <p className="text-xs text-muted-foreground">Rank #{index + 1}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{performer.score}</div>
                      <div className="text-xs text-muted-foreground">points</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export function HallOfFame() {
  const [groups, setGroups] = useState<GroupData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null)

  useEffect(() => {
    async function fetchGroupsData() {
      try {
        setLoading(true)

        // Get all groups
        const groupsSnapshot = await getDocs(collection(db, "groups"))
        const groupsData: GroupData[] = []

        for (const groupDoc of groupsSnapshot.docs) {
          const groupData = groupDoc.data()
          const groupId = groupDoc.id

          // Count members in each group
          const membersQuery = query(collection(db, "groupMembers"), where("groupId", "==", groupId))
          const membersSnapshot = await getDocs(membersQuery)
          const memberCount = membersSnapshot.size

          // Get top performers for this group
          const topPerformers: { username: string; score: number; userId: string }[] = []

          try {
            // Get quizzes for this group
            const quizzesQuery = query(collection(db, "quizzes"), where("groupId", "==", groupId))
            const quizzesSnapshot = await getDocs(quizzesQuery)

            if (!quizzesSnapshot.empty) {
              const quizIds = quizzesSnapshot.docs.map((doc) => doc.id)

              // Get all attempts for these quizzes
              const userScores: Record<string, number> = {}

              for (const quizId of quizIds) {
                const attemptsQuery = query(collection(db, "quizAttempts"), where("quizId", "==", quizId))
                const attemptsSnapshot = await getDocs(attemptsQuery)

                attemptsSnapshot.docs.forEach((doc) => {
                  const attempt = doc.data()
                  const userId = attempt.userId
                  userScores[userId] = (userScores[userId] || 0) + (attempt.score || 0)
                })
              }

              // Get top 5 performers
              const sortedUsers = Object.entries(userScores)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)

              for (const [userId, score] of sortedUsers) {
                try {
                  const userDoc = await getDoc(doc(db, "crashCourseUsers", userId))
                  if (userDoc.exists()) {
                    const userData = userDoc.data()
                    const username = userData.displayName || userData.email?.split("@")[0] || "Unknown"
                    topPerformers.push({ username, score, userId })
                  }
                } catch (err) {
                  console.warn(`Error fetching user ${userId}:`, err)
                }
              }
            }
          } catch (err) {
            console.warn(`Error fetching top performers for group ${groupId}:`, err)
          }

          groupsData.push({
            id: groupId,
            name: groupData.name || `Group ${groupId}`,
            memberCount,
            topPerformers,
          })
        }

        // Sort by member count (descending)
        groupsData.sort((a, b) => b.memberCount - a.memberCount)
        setGroups(groupsData)
      } catch (error) {
        console.error("Error fetching groups data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGroupsData()
  }, [])

  if (loading) {
    return (
      <Card className="w-full ">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-primary" />
            Groups Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-48">
            <div className="space-y-2 pr-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="w-6 h-6 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-muted rounded w-3/4 mb-1"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="w-4 h-4 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    )
  }

  if (groups.length === 0) {
    return (
      <Card className="w-full ">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-primary" />
            Groups Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-6">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No groups found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-purple/5 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="p-1.5 rounded-full bg-primary/10">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              Groups Overview
            </CardTitle>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-purple-500 animate-pulse" />
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {groups.length}
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Tap to view hall of fame</p>
        </CardHeader>
        <CardContent className="pt-0 p-4">
          <ScrollArea className="h-48">
            <div className="space-y-2 pr-2">
              {groups.slice(0, 6).map((group, index) => (
                <Button
                  key={group.id}
                  variant="ghost"
                  className="w-full h-auto p-0 hover:bg-transparent group"
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className="w-full p-3 rounded-lg border transition-all duration-300 hover:shadow-md hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent bg-card group-hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                            <Users className="h-3 w-3 text-primary" />
                          </div>
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-white">★</span>
                            </div>
                          )}
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <h4 className="font-medium text-sm truncate leading-tight">{group.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <div className="w-1 h-1 rounded-full bg-green-500"></div>
                              {group.memberCount}
                            </span>
                            {group.topPerformers.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Trophy className="h-2 w-2" />
                                  {group.topPerformers.length}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <div className="text-right">
                          <div className="text-xs font-bold text-primary">#{index + 1}</div>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
          {groups.length > 6 && (
            <div className="text-center pt-3 border-t mt-3">
              <p className="text-xs text-muted-foreground">
                +{groups.length - 6} more groups
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedGroup && (
        <GroupTopperModal group={selectedGroup} isOpen={!!selectedGroup} onClose={() => setSelectedGroup(null)} />
      )}
    </>
  )
}