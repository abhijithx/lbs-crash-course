"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
// import { HallOfFame } from "@/components/hall-of-fame"
import { Card, CardContent } from "@/components/ui/card"
import {
  Play,
  FileText,
  Brain,
  BookOpen,
  Users,
  Trophy,
} from "lucide-react"

export function HeroSection() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [decorativeElements, setDecorativeElements] = useState([])

  useEffect(() => {
    setMounted(true)
    // Generate random positions for decorative elements
    const elements = Array.from({ length: 15 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }))
    setDecorativeElements(elements)
  }, [])

  return (
    <section className="py-8 md:py-20">
      <div className="container px-4 md:px-6">
        {/* Welcome Section with 70% Height on Large Screens */}
        <div className="h-auto lg:h-[70vh] flex items-center justify-center px-4 relative">
          {/* Decorative Bubbles */}
          {mounted && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {decorativeElements.map((position, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full opacity-30"
                  style={{ ...position, backgroundColor: "#00ffff" }}
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
          )}

          <motion.div
            className="text-center mb-8 md:mb-12 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            
           <motion.h1
                className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter mb-2 md:mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Welcome to{" "}
                <span className="inline-block">
                  {/* CETMCA with duck walking animation */}
                  <motion.span
                    className="inline-block"
                    animate={{
                      x: [0, 3, -3, 3, -3, 0],
                      y: [0, -2, 0, -2, 0, 0],
                      rotate: [0, 1, -1, 1, -1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      repeatDelay: 1,
                    }}
                  >
                    CETMCA
                  </motion.span>
                  {/* 26 with special duck-themed animation */}
                  <motion.span
                    style={{ color: "#00ffff" }}
                    className="inline-block ml-1"
                    animate={{
                      y: [0, -4, 0, -4, 0],
                      rotate: [0, -2, 2, -2, 0],
                      scale: [1, 1.05, 1, 1.05, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      repeatDelay: 1,
                      delay: 0.3,
                    }}
                  >
                    26
                  </motion.span>
                </span>
               
              </motion.h1>
            {/* Official Website Text */}
            <motion.p
              className="text-sm md:text-lg lg:text-xl text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              The official website of CETMCA26 Community
            </motion.p>

            {/* Batch Info & Location (Visible only on large screens) */}
            <motion.div
              className="hidden lg:block text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.p
                className="text-lg lg:text-3xl text-[#00ffff] dark:text-[#00ffff] font-semibold mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                GitHub Organization
              </motion.p>
              <motion.div
                className="text-lg text-gray-800 dark:text-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                <div> Open-Source Community</div>
              </motion.div>
            </motion.div>

            {/* Buttons (Visible only on large screens) */}
            <motion.div
              className="hidden lg:flex flex-row gap-3 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              
              <Link href="/projects">
                <Button size="lg" className="bg-[#00ffff] hover:bg-[#00ffff]/90">
                  Explore Projects
                </Button>
              </Link>
              <Link href="/admission">
                <Button size="lg" variant="outline">
                 Preparing for LBS MCA 2025 ?
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>


        {/* Main Action Buttons */}
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Top Sections</h3>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-8">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 1.0 }}
  >
    
    <Link href="/crash-course/dashboard" className="block">
      <Button variant="outline" className="w-full h-12 md:h-14 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <div className="text-left">
              <div className="font-semibold text-sm md:text-base">Crash Course</div>
              <div className="text-xs opacity-90 text-gray-600 dark:text-gray-400">Start Learning</div>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">New</span>
          </div>
        </div>
      </Button>
    </Link>
  </motion.div>

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 1.2 }}
  >
    <Link href="/crash-course/dashboard/quiz" className="block">
      <Button variant="outline" className="w-full h-12 md:h-14 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-900 dark:text-gray-100">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <div className="text-left">
              <div className="font-semibold text-sm md:text-base">Quiz Portal</div>
              <div className="text-xs text-muted-foreground">Test Your Skills</div>
            </div>
          </div>
        </div>
      </Button>
    </Link>
  </motion.div>
</div>

        {/* Quick Access Grid */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/crash-course/dashboard/">
              <Card className="hover:shadow-md dark:hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                      <Play className="h-5 w-5 md:h-6 md:w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <div className="font-medium text-xs md:text-sm text-gray-900 dark:text-gray-100">Video Classes</div>
                      <div className="text-xs text-muted-foreground hidden md:block">Recorded Lectures</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/crash-course/dashboard/materials">
              <Card className="hover:shadow-md dark:hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 md:h-6 md:w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="font-medium text-xs md:text-sm text-gray-900 dark:text-gray-100">Materials</div>
                      <div className="text-xs text-muted-foreground hidden md:block">Study Resources</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/projects">
              <Card className="hover:shadow-md dark:hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Trophy className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <div className="font-medium text-xs md:text-sm text-gray-900 dark:text-gray-100">Projects</div>
                      <div className="text-xs text-muted-foreground hidden md:block">Student Work</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/students">
              <Card className="hover:shadow-md dark:hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-medium text-xs md:text-sm text-gray-900 dark:text-gray-100">Students</div>
                      <div className="text-xs text-muted-foreground hidden md:block">Class Directory</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Groups Overview */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          {/* <HallOfFame /> */}
        </motion.div>

        {/* Admission Section - Moved to Bottom */}
        <motion.div
          className="text-center mt-9 py-8 px-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
        >
          <motion.h3
            className="text-lg md:text-xl mt-4 font-semibold text-green-800 dark:text-green-300 mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.8 }}
          >
            Need Help with Admissions?
          </motion.h3>
          
          <motion.p
            className="text-sm md:text-base text-green-700 dark:text-green-400 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 2.0 }}
          >
            Get guidance for MCA admissions 2025
          </motion.p>

          <Link href="/admission">
            <motion.button
              className="px-6 py-3 bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 text-white text-sm md:text-base font-semibold rounded-full shadow-lg transition duration-300 w-full sm:w-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Admission Helpdesk 2025 – Join Now
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}