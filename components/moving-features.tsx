"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Video, GraduationCap, User, Code, PlayCircle, ArrowRight } from "lucide-react"
import Link from "next/link"

const movingBadges = [
  { text: "🎓 Quiz Platform", gradient: "from-blue-500 to-purple-600" },
  { text: "💻 Recorded Sessions", gradient: "from-green-500 to-blue-600" },
  { text: "🤝 Student Portfolios", gradient: "from-purple-500 to-pink-600" },
  { text: "🚀 Progress Tracking", gradient: "from-orange-500 to-red-600" },
  { text: "📚 Comprehensive Resources", gradient: "from-teal-500 to-green-600" },
  { text: "🤝 Jobs Posts", gradient: "from-purple-500 to-pink-600" },
  { text: "🌟 Course Platform", gradient: "from-indigo-500 to-purple-600" },
  { text: "🔬 Projects", gradient: "from-cyan-500 to-blue-600" },
]


export function MovingFeatures() {
  return (
    <section className="my-16 overflow-hidden mt-3 mb-3">
      {/* Moving Badges Section */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Platform Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
       Explore the comprehensive features that make CETMCA26 your ultimate learning companion
          </p>
        </div>

        <div className="relative h-16 bg-gradient-to-r from-background via-muted/20 to-background rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center">
            <div className="flex animate-scroll space-x-6 whitespace-nowrap">
              {/* First set of badges */}
              {movingBadges.map((badge, index) => (
                <div
                  key={`first-${index}`}
                  className={`inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r ${badge.gradient} text-white font-medium text-sm shadow-lg hover:scale-105 transition-transform duration-300 hover:shadow-xl`}
                >
                  {badge.text}
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {movingBadges.map((badge, index) => (
                <div
                  key={`second-${index}`}
                  className={`inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r ${badge.gradient} text-white font-medium text-sm shadow-lg hover:scale-105 transition-transform duration-300 hover:shadow-xl`}
                >
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

   

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
