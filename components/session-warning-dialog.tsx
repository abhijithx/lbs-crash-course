"use client"

import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, Users, Lock } from "lucide-react"

interface SessionWarningDialogProps {
  isOpen: boolean
  onClose: () => void
  message: string
  attemptsCount?: number
  isBlocked?: boolean
}

export function SessionWarningDialog({
  isOpen,
  onClose,
  message,
  attemptsCount = 0,
  isBlocked = false,
}: SessionWarningDialogProps) {
  const getWarningContent = () => {
    if (isBlocked) {
      return {
        title: "Account Temporarily Blocked",
        icon: <Lock className="h-6 w-6 text-red-500" />,
        description: (
          <div className="space-y-3">
            <p className="text-red-600 font-medium">
              Your account has been temporarily blocked due to multiple failed login attempts from different devices.
            </p>
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Security Notice:</strong> This usually indicates credential sharing or unauthorized access
                attempts.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Please contact support to unlock your account or wait 24 hours for automatic reset.
            </p>
          </div>
        ),
      }
    }

    if (attemptsCount >= 2) {
      return {
        title: "⚠️ Final Warning - Account Security Alert",
        icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
        description: (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-amber-800 font-medium mb-2">
                🚨 <strong>CRITICAL SECURITY WARNING</strong>
              </p>
              <p className="text-amber-700 text-sm">
                We've detected <strong>{attemptsCount} failed login attempts</strong> from different devices/locations.
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-800 font-bold mb-2">⛔ ONE MORE ATTEMPT WILL BLOCK YOUR ACCOUNT</p>
              <p className="text-red-700 text-sm">
                If this happens again, your account will be temporarily suspended for security reasons.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-gray-700 font-medium">🔒 Account Security Rules:</p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>
                  • <strong>DO NOT share your login credentials</strong> with anyone
                </li>
                <li>• Only log in from your personal devices</li>
                <li>• Log out properly when finished</li>
                <li>• Report suspicious activity immediately</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <strong>💡 Tip:</strong> If you're sharing credentials with classmates, please stop immediately. Each
                student should have their own account for security and progress tracking.
              </p>
            </div>
          </div>
        ),
      }
    }

    return {
      title: "Session Conflict Detected",
      icon: <Users className="h-5 w-5 text-amber-500" />,
      description: (
        <div className="space-y-3">
          <p>{message}</p>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              <strong>Security Notice:</strong> Multiple login attempts from different devices have been detected.
              Please ensure you're not sharing your credentials with others.
            </p>
          </div>
        </div>
      ),
    }
  }

  const content = getWarningContent()

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {content.icon}
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>{content.description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose} className={isBlocked ? "bg-red-600 hover:bg-red-700" : ""}>
            {isBlocked ? "Contact Support" : "I Understand"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface SessionWarningAlertProps {
  message: string
  attemptsCount?: number
  isBlocked?: boolean
  onDismiss?: () => void
}

export function SessionWarningAlert({
  message,
  attemptsCount = 0,
  isBlocked = false,
  onDismiss,
}: SessionWarningAlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!isBlocked) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onDismiss?.()
      }, 10000) // Show longer for warnings

      return () => clearTimeout(timer)
    }
  }, [onDismiss, isBlocked])

  if (!isVisible) return null

  const getAlertVariant = () => {
    if (isBlocked) return "destructive"
    if (attemptsCount >= 2) return "destructive"
    return "default"
  }

  const getAlertContent = () => {
    if (isBlocked) {
      return {
        icon: <Lock className="h-4 w-4" />,
        message: "🚫 Account blocked due to multiple unauthorized login attempts. Contact support to unlock.",
      }
    }

    if (attemptsCount >= 2) {
      return {
        icon: <AlertTriangle className="h-4 w-4" />,
        message: `⚠️ FINAL WARNING: ${attemptsCount} failed attempts detected. ONE MORE WILL BLOCK YOUR ACCOUNT. Do not share credentials!`,
      }
    }

    return {
      icon: <Shield className="h-4 w-4" />,
      message: message,
    }
  }

  const content = getAlertContent()

  return (
    <Alert variant={getAlertVariant()} className="mb-4">
      {content.icon}
      <AlertDescription className="font-medium">{content.message}</AlertDescription>
    </Alert>
  )
}
