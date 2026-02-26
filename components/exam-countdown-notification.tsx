"use client"

import { useState, useEffect } from "react"
import { AlarmClock, X } from "lucide-react"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const motivationalMessages = [
  "Every minute counts! 📚",
  "Success starts today! 💪",
  "Your future self will thank you! 🌟",
  "Champions study daily! 🏆",
  "Knowledge is power! 🧠",
  "Study hard, celebrate later! 🎉",
  "Consistency beats perfection! ⭐",
  "Make today count! 📝",
  "You've got this! 💯",
  "Turn dreams into plans! 🚀",
]

const getMotivationalMessage = (daysLeft: number): string => {
  if (daysLeft > 100) return "Build strong foundations! 🏗️"
  if (daysLeft > 50) return "Perfect time to master everything! 🎯"
  if (daysLeft > 30) return "Intensify your studies! 🔥"
  if (daysLeft > 14) return "Every session matters! ⚡"
  if (daysLeft > 7) return "Final stretch! 🏃‍♂️"
  if (daysLeft > 0) return "Give it everything! 💪"
  return "You're prepared! 🌟"
}

export default function ExamCountdownNotification() {
  const [isOpen, setIsOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  const calculateTimeLeft = (): TimeLeft => {
    const examDate = new Date("2025-06-29T00:00:00")
    const now = new Date()
    const difference = examDate.getTime() - now.getTime()

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatNumber = (num: number): string => num.toString().padStart(2, "0")

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <div className="relative">
          <AlarmClock className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
        </div>
      </button>

      {/* Minimal Modal - Light/Dark Mode */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl max-w-xs w-full border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <AlarmClock className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                <span className="font-semibold text-sm">Exam Countdown</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Exam Date */}
              <div className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Exam Date</div>
                <div className="text-sm font-medium">June 29, 2025</div>
              </div>

              {/* Countdown */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{timeLeft.days}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                    {formatNumber(timeLeft.hours)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                    {formatNumber(timeLeft.minutes)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Min</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400 animate-pulse">
                    {formatNumber(timeLeft.seconds)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Sec</div>
                </div>
              </div>

              {/* Motivational Message */}
              <div className="text-center p-3 rounded-lg bg-cyan-50 dark:bg-gray-900 ">
                <div className="text-sm font-medium text-cyan-700 dark:text-cyan-300 mb-1">
                  {getMotivationalMessage(timeLeft.days)}
                </div>
                <div className="text-xs text-cyan-600 dark:text-cyan-400">
                  {motivationalMessages[Math.floor(Date.now() / 10000) % motivationalMessages.length]}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
