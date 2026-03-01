"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, Code, Github, GraduationCapIcon as Graduation, Users, Heart } from "lucide-react"
import Link from "next/link"
import { HeroSection } from "@/components/hero-section"
import { MovingFeatures } from "@/components/moving-features"
import { useEffect, useState, useRef } from "react"
// import { FeedbackCarousel } from "@/components/feedback/feedback-carousel"
import { NewFeaturesDialog } from "@/components/new-features-dialog" // Import the new dialog
import Script from "next/script"


// Animated Counter Component
function AnimatedCounter({ target, duration = 2000, delay = 0 }: { target: number; duration?: number; delay?: number }) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const counterRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true)

          const startTime = Date.now() + delay
          const animate = () => {
            const now = Date.now()
            const elapsed = now - startTime

            if (elapsed < 0) {
              requestAnimationFrame(animate)
              return
            }

            const progress = Math.min(elapsed / duration, 1)
            const easeOutQuad = 1 - (1 - progress) * (1 - progress)
            const currentCount = Math.floor(easeOutQuad * target)

            setCount(currentCount)

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    const element = counterRef.current
    if (element) {
      observer.observe(element)
    }

    return () => {
      observer.disconnect()
    }
  }, [target, duration, delay, hasStarted])

  return (
    <span
      ref={counterRef}
      className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-[#28cee3] to-[#00ffff] bg-clip-text text-transparent"
    >
      {count.toLocaleString()}+
    </span>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Free & Open Source Badge */}
      <div className="fixed bottom-1 left-1 z-50">
        <div className="group bg-red-500/30 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg hover:bg-red-600/40 transition-all duration-300 flex items-center gap-1 border border-red-400/20 cursor-pointer">
          <Heart className="h-2.5 w-2.5 fill-current" />
          <span className="text-xs transition-all duration-300 ease-in-out">
            <span className="block group-hover:hidden">FOSS</span>
            <span className="hidden group-hover:block">Free & Open Source Software</span>
          </span>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <HeroSection />

        {/* Add feedback carousel section */}
        <section className="my-16">
          {/* <FeedbackCarousel /> */}
        </section>



        {/* About Section */}
        <section className="my-6 sm:my-12 mb-8 sm:mb-16" style={{ marginTop: "-20px" }}>
          <div className="text-center mb-8 sm:mb-1">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 sm:mb-4">About Us</h2>
            <div className="rounded-2xl p-4 sm:p-6 shadow-lg mx-2 sm:mx-auto max-w-4xl">
              <p className="text-sm sm:text-base leading-relaxed">
                Welcome to <span className="font-semibold text-[#28cee3]">CETMCA26</span>!
                We are a GitHub organization and open-source community of developers and tech enthusiasts.
                This is a collaborative space where we learn, build, and grow together.
              </p>
              <p className="text-sm sm:text-base leading-relaxed mt-3">
                Our website contains a wide range of resources to support your academic journey, including notes, syllabus materials, entrance preparation guides, project ideas, and much more.
              </p>

              <Link href="https://discord.gg/ujTeUsM4Nf">
                <Button size="lg" className="bg-gradient-to-r from-[#28cee3] to-[#20a8cc] hover:from-[#20a8cc] hover:to-[#28cee3] mt-6 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-medium px-6 py-2.5 rounded-xl">
                  🎮 Join Discord Community
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <MovingFeatures />


        {/* User Count Section */}
        <section className="my-12 sm:my-20">
          <div className="text-center">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#28cee3]/10 via-transparent to-[#00ffff]/5 p-8 sm:p-12 backdrop-blur-sm border border-[#28cee3]/20">
              {/* Background decoration */}
              <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                <div className="absolute top-4 left-4 w-20 h-20 bg-[#28cee3]/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 bg-[#00ffff]/20 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-[#28cee3]/10 to-[#00ffff]/10 rounded-full blur-2xl"></div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gradient-to-br from-[#28cee3]/20 to-[#00ffff]/20 rounded-2xl backdrop-blur-sm">
                    <Users className="h-12 w-12 sm:h-16 sm:w-16 text-[#28cee3]" />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                  Join Our Growing Community
                </h2>

                <div className="mb-6">
                  <AnimatedCounter target={420} duration={3000} />
                  <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mt-2">
                    Active Community Members
                  </p>
                </div>

                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  Be part of a thriving community of developers, learners, and innovators. Together, we&apos;re building the future of technology education.
                </p>
                <div className="powr-hit-counter mt-4 mb-4" id="ad37fde6_1754479257"></div>
                <Script src="https://www.powr.io/powr.js?platform=react" strategy="lazyOnload" />

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <Link href="/contact">
                    <Button size="lg" className="bg-gradient-to-r from-[#28cee3] to-[#00ffff] hover:from-[#20a8cc] hover:to-[#28cee3] shadow-lg hover:shadow-xl hover:shadow-[#28cee3]/25 transition-all duration-300 text-white font-medium px-8 py-3 rounded-xl">
                      Join Our Community
                      <Users className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>

                  <Link href="https://discord.gg/ujTeUsM4Nf">
                    <Button size="lg" variant="outline" className="border-[#28cee3]/30 hover:bg-[#28cee3]/10 shadow-lg transition-all duration-300 px-8 py-3 rounded-xl">
                      🎮 Discord Chat
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Section */}
        <section className="my-8 sm:my-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 sm:mb-4">
              Explore CETMCA <span className="text-[#00ffff]">26</span>
            </h2>
            <p className="max-w-2xl mx-auto text-sm sm:text-base px-4">
              Discover resources, projects, and connect with the members of community.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
            {/* Projects Card */}
            <Card className="group transition-all duration-300 bg-white/90 dark:bg-gray-800/90 border-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-[#00ffff] to-[#0080ff] h-2"></div>
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-gray-100">
                  <div className="p-2 bg-[#00ffff]/20 dark:bg-[#00ffff]/10 rounded-lg">
                    <Code className="h-4 w-4 text-[#00ffff] dark:text-[#00ffff]" />
                  </div>
                  <span className="text-base sm:text-lg">Projects</span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-gray-400 text-sm">Explore our GitHub projects</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  Browse through all the projects developed by CETMCA26 members, including web applications, mobile apps, and more.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/projects" className="w-full">
                  <Button className="w-full rounded-xl py-2.5 bg-gradient-to-r from-[#28cee3] to-[#20a8cc] hover:from-[#20a8cc] hover:to-[#28cee3]">
                    View Projects
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Lab Programs & Notes Card */}
            <Card className="group transition-all duration-300 bg-white/90 dark:bg-gray-800/90 border-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-[#00ffff] to-[#0080ff] h-2"></div>
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-gray-100">
                  <div className="p-2 bg-[#00ffff]/20 dark:bg-[#00ffff]/10 rounded-lg">
                    <BookOpen className="h-4 w-4 text-[#00ffff] dark:text-[#00ffff]" />
                  </div>
                  <span className="text-base sm:text-lg">Lab Programs & Notes</span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-gray-400 text-sm">Access academic resources</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  Find lab programs and notes for all semesters to help you excel in your academic journey.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/resources" className="w-full">
                  <Button className="w-full rounded-xl py-2.5 bg-gradient-to-r from-[#28cee3] to-[#20a8cc] hover:from-[#20a8cc] hover:to-[#28cee3]">
                    View Resources
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Students Card */}
            <Card className="group transition-all duration-300 bg-white/90 dark:bg-gray-800/90 border-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-[#00ffff] to-[#0080ff] h-2"></div>
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-gray-100">
                  <div className="p-2 bg-[#00ffff]/20 dark:bg-[#00ffff]/10 rounded-lg">
                    <Graduation className="h-4 w-4 text-[#00ffff] dark:text-[#00ffff]" />
                  </div>
                  <span className="text-base sm:text-lg">Students</span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-gray-400 text-sm">Explore student portfolios</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  Browse through the portfolios of CETMCA26 members and learn about their skills, projects, and experiences.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/students" className="w-full">
                  <Button className="bg-gradient-to-r from-[#28cee3] to-[#20a8cc] hover:from-[#20a8cc] hover:to-[#28cee3] w-full hover:shadow-lg hover:shadow-[#00ffff]/25 transition-all duration-300 rounded-xl py-2.5">
                    View Members
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* GitHub Card */}
            <Card className="group transition-all duration-300 bg-white/90 dark:bg-gray-800/90 border-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-[#00ffff] to-[#0080ff] h-2"></div>
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-gray-100">
                  <div className="p-2 bg-[#00ffff]/20 dark:bg-[#00ffff]/10 rounded-lg">
                    <Github className="h-4 w-4 text-[#00ffff] dark:text-[#00ffff]" />
                  </div>
                  <span className="text-base sm:text-lg">GitHub</span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-gray-400 text-sm">Visit our GitHub organization</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  Check out our GitHub organization to see all our repositories and contribute to our projects.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <a href="https://github.com/cetmca26" target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="bg-gradient-to-r from-[#28cee3] to-[#20a8cc] hover:from-[#20a8cc] hover:to-[#28cee3] w-full hover:shadow-lg hover:shadow-[#00ffff]/25 transition-all duration-300 rounded-xl py-2.5">
                    Visit GitHub
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardFooter>
            </Card>

            {/* Join Us Card */}
            <Card className="group transition-all duration-300 bg-white/90 dark:bg-gray-800/90 border-0 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-[#00ffff] to-[#0080ff] h-2"></div>
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-gray-100">
                  <div className="p-2 bg-[#00ffff]/20 dark:bg-[#00ffff]/10 rounded-lg">
                    <Users className="h-4 w-4 text-[#00ffff] dark:text-[#00ffff]" />
                  </div>
                  <span className="text-base sm:text-lg">Join Us</span>
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-gray-400 text-sm">Become a part of our community</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                  Interested in joining our community? Fill out the contact form and we&apos;ll get back to you.
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link href="/contact" className="w-full">
                  <Button className="bg-gradient-to-r from-[#28cee3] to-[#20a8cc] hover:from-[#20a8cc] hover:to-[#28cee3] w-full hover:shadow-lg hover:shadow-[#00ffff]/25 transition-all duration-300 rounded-xl py-2.5">
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </section>
        <NewFeaturesDialog />

      </div>
    </div>
  )
}
