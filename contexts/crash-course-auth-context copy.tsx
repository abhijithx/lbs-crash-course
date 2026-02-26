"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { sessionManager } from "@/lib/session-manager"

type UserProfile = {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
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
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  logOut: () => Promise<void>
  updateUserProgress: (courseId: string, videoId: string, progress: number) => Promise<void>
  forceLogout: () => Promise<void>
  warningInfo: { shouldWarn: boolean; attemptsCount: number; isBlocked: boolean } | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function CrashCourseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warningInfo, setWarningInfo] = useState<{
    shouldWarn: boolean
    attemptsCount: number
    isBlocked: boolean
  } | null>(null)
  const router = useRouter()

  // Ensure Firebase auth is available
  const [firebaseReady, setFirebaseReady] = useState(false)

  // Initialize Firebase auth if needed
  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      // Check if auth is already initialized
      const authInstance = auth || (window.firebase?.auth ? window.firebase.auth() : null)

      if (authInstance) {
        setFirebaseReady(true)
      } else {
        console.error("Firebase auth is not available")
        setError("Firebase authentication is not available")
        setLoading(false)
      }
    }
  }, [])

  // Set up auth state listener once Firebase is ready
  useEffect(() => {
    if (!firebaseReady || typeof window === "undefined") return

    let unsubscribe = () => {}

    try {
      // Make sure auth is defined before using it
      if (auth) {
        unsubscribe = onAuthStateChanged(
          auth,
          async (user) => {
            setUser(user)

            if (user && db) {
              try {
                const userDocRef = doc(db, "crashCourseUsers", user.uid)
                const userDoc = await getDoc(userDocRef)
                
                if (userDoc.exists()) {
                  setUserProfile(userDoc.data() as UserProfile)

                  // Update last login
                  await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true })
                } else {
                  // Create new user profile
                  const newUserProfile: UserProfile = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
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

                // Reset warning info and login attempts on successful auth
                setWarningInfo(null)
                await sessionManager.resetLoginAttempts(user.uid)
              } catch (err) {
                console.error("Error fetching user profile:", err)
                setError("Failed to load user profile")
              }
            } else {
              setUserProfile(null)
            }

            setLoading(false)
          },
          (error) => {
            console.error("Auth state change error:", error)
            setError("Authentication error: " + error.message)
            setLoading(false)
          },
        )
      } else {
        setLoading(false)
        setError("Firebase auth is not initialized")
      }
    } catch (err) {
      console.error("Error setting up auth listener:", err)
      setLoading(false)
      setError("Failed to initialize authentication")
    }

    return () => {
      unsubscribe()
      sessionManager.cleanup()
    }
  }, [firebaseReady])

  const handleSessionConflict = async (user: User) => {
    const warningData = await sessionManager.recordFailedLoginAttempt(user.uid)
    setWarningInfo(warningData)

    await signOut(auth)

    if (warningData.shouldBlock) {
      throw new Error(
        "Account blocked due to multiple unauthorized login attempts. Contact support to unlock your account.",
      )
    } else if (warningData.shouldWarn) {
      throw new Error(
        `⚠️ FINAL WARNING: This account is already logged in elsewhere. ${warningData.attemptsCount} attempts detected. ONE MORE ATTEMPT WILL BLOCK YOUR ACCOUNT. Do not share your credentials with others!`,
      )
    } else {
      throw new Error(
        "This account is already logged in on another device. Please log out from the other device first. Or Reset Your Password from Forgot Password",
      )
    }
  }


  const signInWithEmail = async (email: string, password: string) => {
    if (!auth) {
      setError("Authentication service is not available")
      return
    }

    try {
      setError(null)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Check if user is blocked
      const isBlocked = await sessionManager.isUserBlocked(user.uid)
      if (isBlocked) {
        await signOut(auth)
        setWarningInfo({ shouldWarn: true, attemptsCount: 3, isBlocked: true })
        throw new Error(
          "Account temporarily blocked due to multiple unauthorized login attempts. Please contact support or wait 24 hours.",
        )
      }

      // Check if user already has an active session
      const hasActiveSession = await sessionManager.checkSession(user.uid)
      if (hasActiveSession) {
        await handleSessionConflict(user)
        return
      }

      // Create new session
      await sessionManager.createSession(user.uid)

      // Set up session listener
      sessionManager.listenToSession(user.uid, () => {
        forceLogout()
      })

      setWarningInfo(null)
      router.push("/crash-course/dashboard")
    } catch (err: any) {
      console.error("Email sign in error:", err)
      setError(err.message)
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!auth || !db) {
      setError("Authentication service is not available")
      return
    }

    try {
      setError(null)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Create user profile
      const userDocRef = doc(db, "crashCourseUsers", userCredential.user.uid)
      const newUserProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: email,
        displayName: displayName,
        photoURL: null,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        courseProgress: {
          cs: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
          math: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
          qa: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
          english: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
          gk: { completed: false, lastWatched: "", progress: 0, completedVideos: [] },
        },
      }

      await setDoc(userDocRef, newUserProfile)

      // Create session for new user
      await sessionManager.createSession(userCredential.user.uid)

      // Set up session listener
      sessionManager.listenToSession(userCredential.user.uid, () => {
        forceLogout()
      })

      setWarningInfo(null)
      router.push("/crash-course/dashboard")
    } catch (err: any) {
      console.error("Email sign up error:", err)
      setError(err.message)
    }
  }

  const logOut = async () => {
    if (!auth) {
      setError("Authentication service is not available")
      return
    }

    try {
      if (user) {
        // Delete session before signing out
        await sessionManager.deleteSession(user.uid)
      }

      await signOut(auth)
      setWarningInfo(null)
      router.push("/crash-course")
    } catch (err: any) {
      console.error("Sign out error:", err)
      setError(err.message)
    }
  }

  const updateUserProgress = async (courseId: string, videoId: string, progress: number) => {
    if (!user || !userProfile || !db) return

    try {
      const userDocRef = doc(db, "crashCourseUsers", user.uid)

      // Get current progress
      const currentProgress = userProfile.courseProgress?.[courseId] || {
        completed: false,
        lastWatched: "",
        progress: 0,
        completedVideos: [],
      }

      // Update completed videos if not already in the list
      const completedVideos = [...(currentProgress.completedVideos || [])]
      if (!completedVideos.includes(videoId)) {
        completedVideos.push(videoId)
      }

      // Update user profile in Firestore
      await setDoc(
        userDocRef,
        {
          courseProgress: {
            ...userProfile.courseProgress,
            [courseId]: {
              completed: progress === 100,
              lastWatched: videoId,
              progress: progress,
              completedVideos,
            },
          },
        },
        { merge: true },
      )

      // Update local state
      setUserProfile((prev) => {
        if (!prev) return null

        return {
          ...prev,
          courseProgress: {
            ...prev.courseProgress,
            [courseId]: {
              completed: progress === 100,
              lastWatched: videoId,
              progress: progress,
              completedVideos,
            },
          },
        }
      })
    } catch (err) {
      console.error("Error updating progress:", err)
      setError("Failed to update progress")
    }
  }

  const forceLogout = async () => {
    try {
      if (auth && user) {
        await sessionManager.deleteSession(user.uid)
        await signOut(auth)
        setWarningInfo(null)
        router.push("/crash-course")
      }
    } catch (error: any) {
      console.error("Error during force logout:", error)
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
        forceLogout,
        warningInfo,
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
