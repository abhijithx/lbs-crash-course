import { db } from "./firebase"
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp, onSnapshot, updateDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore"

interface SessionData {
  userId: string // Add userId field
  active: boolean
  timestamp: any
  deviceInfo: string
  ipAddress?: string
  userAgent?: string
  loginAttempts?: number
  lastWarningTime?: any
  sessionId: string // Unique session identifier
  lastActivity: any
}

interface SessionListener {
  unsubscribe: () => void
  userId: string
}

class SessionManager {
  private listeners: Map<string, SessionListener> = new Map()
  private currentSessionId: string | null = null
  private readonly MAX_LOGIN_ATTEMPTS = 3
  private readonly WARNING_COOLDOWN = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  // Generate unique session ID
  private generateSessionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Store current session ID in memory
  private setCurrentSessionId(sessionId: string): void {
    this.currentSessionId = sessionId
  }

  async createSession(uid: string): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized")

    const sessionId = this.generateSessionId()
    this.setCurrentSessionId(sessionId)

    const deviceInfo = this.getDeviceInfo()
    const sessionData: SessionData = {
      userId: uid,
      active: true,
      timestamp: serverTimestamp(),
      lastActivity: serverTimestamp(),
      deviceInfo,
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "",
      loginAttempts: 0,
      sessionId: sessionId
    }

    // Create session with auto-generated ID, not using UID as document ID
    await addDoc(collection(db, "sessions"), sessionData)
    console.log(`Created session ${sessionId} for user ${uid}`)
  }

  async checkSession(uid: string): Promise<boolean> {
    if (!db) throw new Error("Firestore is not initialized")

    try {
      const sessionsRef = collection(db, "sessions")
      const userSessionsQuery = query(
        sessionsRef, 
        where("userId", "==", uid),
        where("active", "==", true)
      )
      const snapshot = await getDocs(userSessionsQuery)
      
      return !snapshot.empty
    } catch (error) {
      console.error("Error checking session:", error)
      return false
    }
  }

  async deleteSession(uid: string): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized")

    try {
      // Delete current session only
      if (this.currentSessionId) {
        const sessionsRef = collection(db, "sessions")
        const currentSessionQuery = query(
          sessionsRef,
          where("userId", "==", uid),
          where("sessionId", "==", this.currentSessionId)
        )
        const snapshot = await getDocs(currentSessionQuery)
        
        if (!snapshot.empty) {
          await deleteDoc(snapshot.docs[0].ref)
          console.log(`Deleted current session ${this.currentSessionId} for user ${uid}`)
        }
      }
    } catch (error) {
      console.error("Error deleting session:", error)
    }

    // Clean up listener
    const listener = this.listeners.get(uid)
    if (listener) {
      listener.unsubscribe()
      this.listeners.delete(uid)
    }
  }

  async deleteAllUserSessions(userId: string): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized")

    try {
      const sessionsRef = collection(db, "sessions")
      const userSessionsQuery = query(sessionsRef, where("userId", "==", userId))
      const snapshot = await getDocs(userSessionsQuery)
      
      if (snapshot.empty) {
        console.log(`No sessions found for user: ${userId}`)
        return
      }
      
      const deletePromises = snapshot.docs.map(doc => {
        console.log(`Deleting session: ${doc.id} for user: ${userId}`)
        return deleteDoc(doc.ref)
      })
      
      await Promise.all(deletePromises)
      console.log(`Deleted ${deletePromises.length} sessions for user ${userId}`)
      
      // Clean up all listeners for this user
      this.listeners.forEach((listener, key) => {
        if (listener.userId === userId) {
          listener.unsubscribe()
          this.listeners.delete(key)
        }
      })
      
    } catch (error) {
      console.error("Error deleting all user sessions:", error)
      throw error
    }
  }

  // Force logout by setting a global logout flag
  async forceLogoutAllDevices(userId: string): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized")

    try {
      // Create a global logout flag document
      const logoutFlagRef = doc(db, "logoutFlags", userId)
      await setDoc(logoutFlagRef, {
        forceLogout: true,
        timestamp: serverTimestamp(),
        reason: "password_reset"
      })

      // Also delete all sessions
      await this.deleteAllUserSessions(userId)
      
      console.log(`Force logout initiated for user: ${userId}`)
    } catch (error) {
      console.error("Error forcing logout:", error)
      throw error
    }
  }

  // Check if user should be force logged out
  async checkForceLogout(userId: string): Promise<boolean> {
    if (!db) throw new Error("Firestore is not initialized")

    try {
      const logoutFlagRef = doc(db, "logoutFlags", userId)
      const logoutFlagDoc = await getDoc(logoutFlagRef)
      
      if (logoutFlagDoc.exists() && logoutFlagDoc.data()?.forceLogout) {
        // Clear the flag after checking
        await deleteDoc(logoutFlagRef)
        return true
      }
      
      return false
    } catch (error) {
      console.error("Error checking force logout:", error)
      return false
    }
  }

  async recordFailedLoginAttempt(
    uid: string,
  ): Promise<{ shouldWarn: boolean; shouldBlock: boolean; attemptsCount: number }> {
    if (!db) throw new Error("Firestore is not initialized")

    // For failed login attempts, we'll use a separate collection
    const failedAttemptsRef = doc(db, "failedLoginAttempts", uid)
    const docSnap = await getDoc(failedAttemptsRef)

    let currentAttempts = 0
    let lastWarningTime = null

    if (docSnap.exists()) {
      const data = docSnap.data()
      currentAttempts = data.loginAttempts || 0
      lastWarningTime = data.lastWarningTime
    }

    const newAttempts = currentAttempts + 1
    const now = new Date()

    // Check if we should show warning (not shown in last 24 hours)
    const shouldWarn =
      newAttempts >= 2 &&
      (!lastWarningTime || now.getTime() - lastWarningTime.toDate().getTime() > this.WARNING_COOLDOWN)

    // Check if we should block (3 or more attempts)
    const shouldBlock = newAttempts >= this.MAX_LOGIN_ATTEMPTS

    // Update the failed attempts document
    const updateData: any = {
      loginAttempts: newAttempts,
      lastAttemptTime: serverTimestamp(),
    }

    if (shouldWarn) {
      updateData.lastWarningTime = serverTimestamp()
    }

    await setDoc(failedAttemptsRef, updateData, { merge: true })

    return { shouldWarn, shouldBlock, attemptsCount: newAttempts }
  }

  async resetLoginAttempts(uid: string): Promise<void> {
    if (!db) throw new Error("Firestore is not initialized")

    const failedAttemptsRef = doc(db, "failedLoginAttempts", uid)
    await deleteDoc(failedAttemptsRef)
  }

  async isUserBlocked(uid: string): Promise<boolean> {
    if (!db) throw new Error("Firestore is not initialized")

    const failedAttemptsRef = doc(db, "failedLoginAttempts", uid)
    const docSnap = await getDoc(failedAttemptsRef)
    
    if (docSnap.exists()) {
      const data = docSnap.data()
      return (data.loginAttempts || 0) >= this.MAX_LOGIN_ATTEMPTS
    }
    return false
  }

  // Listen for force logout events
  listenToForceLogout(uid: string, onForceLogout: () => void): void {
    if (!db) return

    const logoutFlagRef = doc(db, "logoutFlags", uid)
    const unsubscribe = onSnapshot(
      logoutFlagRef,
      (doc) => {
        if (doc.exists() && doc.data()?.forceLogout) {
          console.log("Force logout detected for user:", uid)
          onForceLogout()
        }
      },
      (error) => {
        console.error("Force logout listener error:", error)
      }
    )

    this.listeners.set(`force_logout_${uid}`, { unsubscribe, userId: uid })
  }

  listenToSession(uid: string, onSessionTerminated: () => void): void {
    if (!db) return

    // Clean up existing listener
    const existingListener = this.listeners.get(uid)
    if (existingListener) {
      existingListener.unsubscribe()
    }

    // Listen to user sessions
    const sessionsRef = collection(db, "sessions")
    const userSessionsQuery = query(
      sessionsRef,
      where("userId", "==", uid),
      where("active", "==", true)
    )

    const unsubscribe = onSnapshot(
      userSessionsQuery,
      (snapshot) => {
        if (snapshot.empty) {
          console.log("No active sessions found for user:", uid)
          onSessionTerminated()
        }
      },
      (error) => {
        console.error("Session listener error:", error)
      }
    )

    this.listeners.set(uid, { unsubscribe, userId: uid })
  }

  cleanup(): void {
    this.listeners.forEach((listener) => {
      listener.unsubscribe()
    })
    this.listeners.clear()
    this.currentSessionId = null
  }

  private getDeviceInfo(): string {
    if (typeof window === "undefined") return "Server"

    const userAgent = window.navigator.userAgent
    const platform = window.navigator.platform
    const timestamp = new Date().toISOString()

    return `${platform} - ${userAgent.substring(0, 50)}... - ${timestamp}`
  }
}

export const sessionManager = new SessionManager()