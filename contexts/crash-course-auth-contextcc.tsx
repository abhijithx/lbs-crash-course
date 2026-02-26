"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

type UserProfile = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  sessionId?: string
  createdAt?: string
  lastLogin?: string
  courseProgress?: {
    [courseId: string]: {
      completed: boolean
      lastWatched: string
      progress: number
      completedVideos: string[]
    }
  }
}

type AuthContextType = {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  logOut: () => Promise<void>
  updateUserProgress: (courseId: string, videoId: string, progress: number) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function CrashCourseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [sessionId] = useState<string>(() => uuidv4())

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        const userDocRef = doc(db, "crashCourseUsers", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile

          // If session is different, update to new session (i.e., current device)
          if (data.sessionId && data.sessionId !== sessionId) {
            // Forcefully replace session ID to current one
            await setDoc(
              userDocRef,
              { lastLogin: serverTimestamp(), sessionId },
              { merge: true }
            )
          }

          setUserProfile({
            ...data,
            sessionId,
          })
        } else {
          const newUserProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            sessionId,
            courseProgress: {
              cs: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
              math: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
              qa: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
              english: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
              gk: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
            },
          }

          await setDoc(userDocRef, newUserProfile)
          setUserProfile(newUserProfile)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [sessionId])

  useEffect(() => {
    if (!user || !userProfile) return
    const checkSession = async () => {
      const userDocRef = doc(db, "crashCourseUsers", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile
        if (data.sessionId !== sessionId) {
          await signOut(auth)
          setUserProfile(null)
          setError("You have been logged out due to login on another device.")
        }
      }
    }

    const interval = setInterval(checkSession, 5000)
    return () => clearInterval(interval)
  }, [user, userProfile, sessionId])

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/crash-course/dashboard")
    } catch (err: any) {
      console.error("Email sign in error:", err)
      setError(err.message)
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      setError(null)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      const newUserProfile: UserProfile = {
        uid,
        email,
        displayName,
        photoURL: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        sessionId,
        courseProgress: {
          cs: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
          math: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
          qa: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
          english: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
          gk: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
        },
      }

      await setDoc(doc(db, "crashCourseUsers", uid), newUserProfile)
      await setDoc(doc(db, "users", uid), {
        username: displayName,
        email,
        createdAt: serverTimestamp(),
      })

      router.push("/crash-course/dashboard")
    } catch (err: any) {
      console.error("Email sign up error:", err)
      setError(err.message)
    }
  }

  const logOut = async () => {
    try {
      await signOut(auth)
      router.push("/crash-course")
    } catch (err: any) {
      console.error("Sign out error:", err)
      setError(err.message)
    }
  }

  const updateUserProgress = async (courseId: string, videoId: string, progress: number) => {
    if (!user || !userProfile) return

    try {
      const userDocRef = doc(db, "crashCourseUsers", user.uid)
      const currentProgress = userProfile.courseProgress?.[courseId] || {
        completed: false,
        lastWatched: "",
        progress: 0,
        completedVideos: [],
      }

      const completedVideos = [...(currentProgress.completedVideos || [])]
      if (!completedVideos.includes(videoId)) {
        completedVideos.push(videoId)
      }

      await setDoc(
        userDocRef,
        {
          courseProgress: {
            ...userProfile.courseProgress,
            [courseId]: {
              completed: progress === 100,
              lastWatched: videoId,
              progress,
              completedVideos,
            },
          },
        },
        { merge: true }
      )

      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              courseProgress: {
                ...prev.courseProgress,
                [courseId]: {
                  completed: progress === 100,
                  lastWatched: videoId,
                  progress,
                  completedVideos,
                },
              },
            }
          : null
      )
    } catch (err) {
      console.error("Error updating progress:", err)
      setError("Failed to update progress")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        logOut,
        updateUserProgress,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useCrashCourseAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useCrashCourseAuth must be used within a CrashCourseAuthProvider")
  }
  return context
}
