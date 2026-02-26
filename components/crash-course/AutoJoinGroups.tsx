'use client'

import { useAutoJoinGroups } from '@/hooks/useAutoJoinGroups'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle } from 'lucide-react'

export function AutoJoinGroups() {
  const { isAutoJoining, autoJoinComplete, autoJoinError } = useAutoJoinGroups()

  if (!isAutoJoining && !autoJoinError && autoJoinComplete) {
    return null // Don't show anything when complete and successful
  }

  return (
    <div className="mb-4">
      {isAutoJoining && (
        <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          <div className="flex items-center">
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
            <AlertDescription>Setting up your account...</AlertDescription>
          </div>
        </Alert>
      )}

      {autoJoinError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{autoJoinError}</AlertDescription>
        </Alert>
      )}

      {autoJoinComplete && !autoJoinError && (
        <Alert className="bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Account setup complete!</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
