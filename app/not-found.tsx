"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import logoNoBg from "@/public/logonobg.png"
import { BookOpen, GraduationCap, Users, Video } from "lucide-react"

export default function NotFound() {
  const router = useRouter()

  const icons = [
    { Icon: BookOpen, delay: 0, position: { top: "30%", left: "10%" } },
    { Icon: Video, delay: 0.2, position: { top: "10%", right: "10%" } },
    { Icon: Users, delay: 0.4, position: { bottom: "10%", left: "20%" } },
    { Icon: GraduationCap, delay: 0.6, position: { bottom: "20%", right: "20%" } },
  ]

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-40 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center w-full max-w-md text-center"
      >
        {/* Logo or central icon */}
        <div className="relative mb-6 flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40">
          <motion.div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#28cee3] flex items-center justify-center shadow-lg"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Image src={logoNoBg} alt="Logo" width={100} height={100} />
          </motion.div>

          {/* Floating icons */}
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
                delay,
                ease: "easeInOut",
              }}
            >
              <Icon className="w-4 h-4 text-[#28cee3]" />
            </motion.div>
          ))}
        </div>

        {/* 404 Text */}
        <motion.h1
          className="text-4xl font-bold mb-2 text-[#28cee3]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          404 - Page Not Found
        </motion.h1>

        <motion.p
          className="text-lg text-gray-600 dark:text-gray-300 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Oops! The page you are looking for does not exist.
        </motion.p>

        {/* Go Back Button */}
        <motion.button
          onClick={() => router.back()}
          className="px-5 py-2 rounded-lg bg-[#28cee3] text-white font-semibold shadow hover:bg-[#1db6ca] transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Go Back
        </motion.button>
      </motion.div>
    </div>
  )
}
