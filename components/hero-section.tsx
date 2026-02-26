"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
// import { HallOfFame } from "@/components/hall-of-fame"
import { Card, CardContent } from "@/components/ui/card"
import { Play, FileText, Brain, BookOpen, Users, Trophy } from "lucide-react"
import  TextType  from "@/components/TextType"

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
        <div className="h-auto lg:h-[70vh] flex items-center justify-center relative">
          {/* Background Text - CETMCA26 with border effect */}
          {/* Background Text - CETMCA26 with border effect - Full Width */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden w-full">
            <div
              className="text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[12rem] xl:text-[16rem] 2xl:text-[20rem] font-black leading-none whitespace-nowrap w-full text-center"
              style={{
                width: "100vw",
                transform: "translateX(-50%)",
                left: "50%",
                position: "relative",
              }}
            >
              <span
                className="select-none"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "2px rgba(156, 163, 175, 0.3)",
                  textStroke: "2px rgba(156, 163, 175, 0.3)",
                }}
              >
                &nbsp;&nbsp;CETMCA
              </span>
              <span
                className="select-none"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "1px #00ffff",
                  textStroke: "1px #00ffff",
                
                }}
              >
                26
              </span>
            </div>
          </div>

          {/* Decorative Bubbles */}
          {mounted && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {decorativeElements.map((position, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full opacity-30"
                  style={{ ...position, backgroundColor: "#ff324f" }}
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
              className="text-sm md:text-lg lg:text-xl text-muted-foreground mb-4 md:mb-6 max-w-2xl mx-auto dark:text-white text-black"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
                <TextType 
  text={["The official website of CETMCA26 Community", "Place Where Learning , growing happens", "A hub for learning, collaboration, finding jobs and growth",
  "Empowering minds, inspiring innovation","Happy coding!"]}
  typingSpeed={75}
  pauseDuration={1500}
  showCursor={true}
  cursorCharacter="|"
/>
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
                <Button size="lg" className="bg-gradient-to-br from-pink-300 to-[#00ffff]-800 dark:from-pink-800">
                  Explore Projects
                </Button>
              </Link>
              <Link href="/crash-course">
                <Button size="lg" variant="outline">
                 Preparing for Placements ?
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          
        </div>


        {/* Main Action Buttons */}
      <h3 className="text-lg font-semibold mb-6 mt-8 text-center text-gray-900 dark:text-gray-100">
  Top Sections
</h3>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
  {/* Placement Course Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.5 }}
    className="flex items-center justify-center"
  >
    <Link href="/crash-course/dashboard" className="block w-full">
      <Card className="w-full shadow-md hover:shadow-xl transition-all duration-150 flex items-center justify-center py-6 bg-white dark:bg-gray-900">
        <CardContent className="flex items-center justify-between w-full px-2 py-1">
          <div className="flex items-center gap-4">
            <BookOpen className="h-7 w-7 text-[#28cee3] dark:text-[#00cccc]" />
            <div className="text-left">
              <div className="font-semibold text-base md:text-lg">Placement Course</div>
              <div className="text-xs md:text-sm opacity-90 text-gray-600 dark:text-gray-400">Start Learning</div>
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full ml-3">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">New</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>

  {/* Job Portal Card */}
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.7 }}
    className="flex items-center justify-center"
  >
    <Link href="/crash-course/dashboard/jobs" className="block w-full">
      <Card className="w-full shadow-md hover:shadow-xl transition-all duration-150 flex items-center justify-center py-6 bg-white dark:bg-gray-900">
        <CardContent className="flex items-center gap-4 w-full px-2 py-1">
          <div className="flex items-center gap-4">
            <Brain className="h-7 w-7 text-[#a933e9] dark:text-pink-400" />
            <div className="text-left">
              <div className="font-semibold text-base md:text-lg truncate">
                Job Portal
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                Find your job
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
</div>

      <section className="w-full mt-16 mb-10 px-2">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {/* Portfolio */}
    <Card className="flex flex-col items-center justify-center p-6 rounded-xl shadow bg-white dark:bg-gray-900">
      <CardContent className="flex flex-col items-center justify-center text-center gap-2 p-0">
        <Trophy className="h-10 w-10 text-violet-500 mb-2" />
        <div className="text-lg font-bold">Create Portfolio</div>
        <div className="text-xs text-gray-500">Get a unique shareable link</div>
        <Link href="/crash-course/dashboard/portfolio">
          <Button size="sm" className="mt-3">Create/Update</Button>
        </Link>
      </CardContent>
    </Card>
    {/* DSA Sheet */}
    <Card className="flex flex-col items-center justify-center p-6 rounded-xl shadow bg-white dark:bg-gray-900">
      <CardContent className="flex flex-col items-center justify-center text-center gap-2 p-0">
        <Brain className="h-10 w-10 text-pink-500 mb-2" />
        <div className="text-lg font-bold">Free DSA Sheet</div>
        <div className="text-xs text-gray-500">Sheets + Video Solutions</div>
        <Link href="/crash-course/dashboard/dsa">
          <Button size="sm" className="mt-3">Start Solving</Button>
        </Link>
      </CardContent>
    </Card>
    {/* Jobs */}
    <Card className="flex flex-col items-center justify-center p-6 rounded-xl shadow bg-white dark:bg-gray-900">
      <CardContent className="flex flex-col items-center justify-center text-center gap-2 p-0">
        <FileText className="h-10 w-10 text-blue-500 mb-2" />
        <div className="text-lg font-bold">Find Jobs</div>
        <div className="text-xs text-gray-500">Placement ready opportunities</div>
        <Link href="/crash-course/dashboard/jobs">
          <Button size="sm" className="mt-3">Explore</Button>
        </Link>
      </CardContent>
    </Card>
    {/* Quizzes */}
    <Card className="flex flex-col items-center justify-center p-6 rounded-xl shadow bg-white dark:bg-gray-900">
      <CardContent className="flex flex-col items-center justify-center text-center gap-2 p-0">
        <Users className="h-10 w-10 text-green-500 mb-2" />
        <div className="text-lg font-bold">Conduct Quiz</div>
        <div className="text-xs text-gray-500">Practice, Create, Compete</div>
        <Link href="/crash-course/dashboard/quiz">
          <Button size="sm" className="mt-3">Get Started</Button>
        </Link>
      </CardContent>
    </Card>
  </div>
</section>

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
                      <div className="font-medium text-xs md:text-sm text-gray-900 dark:text-gray-100">
                        Video Classes
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 hidden md:block">Recorded Lectures</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/crash-course/dashboard/jobs">
              <Card className="hover:shadow-md dark:hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-3 md:p-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 md:h-6 md:w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <div className="font-medium text-xs md:text-sm text-gray-900 dark:text-gray-100">Job Portal</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 hidden md:block">Find your perfect job</div>
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
                      <div className="text-xs text-gray-600 dark:text-gray-400 hidden md:block">Student Work</div>
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
                      <div className="text-xs text-gray-600 dark:text-gray-400 hidden md:block">Class Directory</div>
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

          <Link href="https://chat.whatsapp.com/CVD1kDQE9Ld187C3gyEUwz">
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
