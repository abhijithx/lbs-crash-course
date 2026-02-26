'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc } from 'firebase/firestore'

const DEFAULT_GROUP_CODES = ['3EU1VU', 'RFRF1O', 'IXB9CX','J0DYKW','4I09I2']

export function useAutoJoinGroups() {
  const { user } = useAuth()
  const [isAutoJoining, setIsAutoJoining] = useState(false)
  const [autoJoinComplete, setAutoJoinComplete] = useState(false)
  const [autoJoinError, setAutoJoinError] = useState<string | null>(null)
  const hasAttempted = useRef(false)

  useEffect(() => {
    if (!user || hasAttempted.current) return

    const performAutoJoin = async () => {
      hasAttempted.current = true
      setIsAutoJoining(true)
      setAutoJoinError(null)

      try {
        // Get all default groups first
        const groupsRef = collection(db, 'groups')
        const groupPromises = DEFAULT_GROUP_CODES.map(code => 
          getDocs(query(groupsRef, where('code', '==', code)))
        )
        
        const groupSnapshots = await Promise.all(groupPromises)
        const validGroups = groupSnapshots
          .map(snap => snap.docs[0])
          .filter(doc => doc) // Remove undefined

        if (validGroups.length === 0) {
          console.log('No default groups found')
          setAutoJoinComplete(true)
          return
        }

        // Check existing memberships
        const membersRef = collection(db, 'groupMembers')
        const membershipPromises = validGroups.map(groupDoc =>
          getDocs(query(membersRef, 
            where('groupId', '==', groupDoc.id),
            where('userId', '==', user.uid)
          ))
        )

        const membershipSnapshots = await Promise.all(membershipPromises)
        
        // Find groups user is not a member of
        const groupsToJoin = validGroups.filter((_, index) => 
          membershipSnapshots[index].empty
        )

        if (groupsToJoin.length === 0) {
          console.log('User already member of all default groups')
          setAutoJoinComplete(true)
          return
        }

        // Use individual addDoc calls instead of batch (simpler for this use case)
        const joinPromises = groupsToJoin.map(groupDoc =>
          addDoc(collection(db, 'groupMembers'), {
            groupId: groupDoc.id,
            userId: user.uid,
            joinedAt: serverTimestamp(),
          })
        )

        await Promise.all(joinPromises)
        console.log(`Auto-joined ${groupsToJoin.length} groups`)
        setAutoJoinComplete(true)

      } catch (error) {
        console.error('Auto-join failed:', error)
        setAutoJoinError('Failed to join default groups')
      } finally {
        setIsAutoJoining(false)
      }
    }

    performAutoJoin()
  }, [user])

  return {
    isAutoJoining,
    autoJoinComplete,
    autoJoinError
  }
}
