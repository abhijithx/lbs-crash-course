"use client"

import { motion } from "framer-motion"
import { BookOpen, GraduationCap, Users, Video } from "lucide-react"
import { useEffect, useState } from "react"
import Image from "next/image"
import logoNoBg from "@/public/icon-removebg-preview.svg"

export function GlobalLoader() {
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const icons = [
    { Icon: BookOpen, delay: 0, position: { top: "30%", left: "10%" } },
    { Icon: Video, delay: 0.2, position: { top: "10%", right: "10%" } },
    { Icon: Users, delay: 0.4, position: { bottom: "10%", left: "20%" } },
    { Icon: GraduationCap, delay: 0.6, position: { bottom: "20%", right: "20%" } },
  ]

  const decorativeElements = [
    { left: "10%", top: "15%" },
    { left: "85%", top: "25%" },
    { left: "15%", top: "75%" },
    { left: "80%", top: "80%" },
    { left: "50%", top: "10%" },
    { left: "90%", top: "60%" },
  ]

  useEffect(() => {
    setMounted(true)

    // Preload the image
    const preloadImage = () => {
      const img = new window.Image()
      img.src = logoNoBg.src || logoNoBg
      img.onload = () => setImageLoaded(true)
      img.onerror = () => setImageLoaded(true) // Still show loader even if image fails
    }

    preloadImage()

    // Handle page load
    const handleLoad = () => {
      // Wait for both page load and image load
      const checkBothLoaded = () => {
        if (imageLoaded) {
          setTimeout(() => {
            setIsLoading(false)
          }, 1500) // Reduced from 2000ms
        } else {
          setTimeout(checkBothLoaded, 100)
        }
      }
      checkBothLoaded()
    }

    // Check if page is already loaded
    if (document.readyState === "complete") {
      handleLoad()
    } else {
      window.addEventListener("load", handleLoad)
    }

    return () => {
      window.removeEventListener("load", handleLoad)
    }
  }, [imageLoaded])

  if (!mounted || !isLoading) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center w-full max-w-md px-4"
      >
        {/* Central Animated Icons */}
        <div className="relative mb-8 flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40">
          {/* Central Cap */}
          <motion.div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center shadow-lg"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Optimized Image with priority and placeholder */}
            <Image 
              src={logoNoBg} 
              alt="Logo" 
              width={100} 
              height={100}
              priority
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzI4Y2VlMyIgb3BhY2l0eT0iMC4yIi8+PC9zdmc+"
              style={{
                transition: 'opacity 0.3s ease-in-out',
                opacity: imageLoaded ? 1 : 0.5
              }}
              onLoad={() => setImageLoaded(true)}
            />
          </motion.div>
        
          {/* Floating Icons - Memoized to prevent unnecessary re-renders */}
          {icons.map(({ Icon, delay, position }, index) => (
            <motion.div
              key={index}
              className="absolute w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center"
              style={position}
              animate={{
                y: [0, -10, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut",
              }}
            >
              <Icon className="w-4 h-4 text-[#28cee3]" />
            </motion.div>
          ))}
        </div>

        {/* Title */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold mb-2 text-[#28cee3]">
            CET MCA 26
          </h1>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
            Easy Access, Deep Impact
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          className="w-full max-w-xs mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#28cee3] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-400"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Preparing your learning experience...
          </motion.p>
        </motion.div>

        {/* Decorative Bubbles - Only render when mounted */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {decorativeElements.map((position, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-[#28cee3] rounded-full opacity-30"
              style={position}
              animate={{
                y: [0, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
