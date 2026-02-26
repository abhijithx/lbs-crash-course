"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Github, Linkedin, Mail, Download, Calendar, GraduationCap, ExternalLink, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { StudentQRCodeDialog } from "@/components/student-qr-code-dialog"
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { StudentPortfolioData } from '@/types/student-portfolio'
import TextType from "@/components/TextType"

const defaultServices = [
  {
    icon: <CheckCircle className="h-6 w-6 text-cyan-400" />,
    title: "Full Stack Development",
    desc: "Building robust, scalable web/apps using modern technologies.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-fuchsia-400" />,
    title: "Database Operation",
    desc: "Designing usable databases for the real world.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-amber-400" />,
    title: "Problem Solving",
    desc: "Applying logic and code to solve real-life problems.",
  },
]

const skillColors = [
  "bg-gradient-to-r from-cyan-500 to-blue-400 text-white",
  "bg-gradient-to-r from-pink-500 to-fuchsia-400 text-white",
  "bg-gradient-to-r from-yellow-400 to-orange-500 text-white",
  "bg-gradient-to-r from-green-400 to-teal-500 text-white",
  "bg-gradient-to-r from-purple-600 to-indigo-400 text-white",
]

export default function StudentPortfolio() {
  const { id } = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("about")

  useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true)
      try {
        if (id) {
          const docRef = doc(db, 'studentPortfolios', id.toString())
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const s = { id: docSnap.id, ...docSnap.data() } as StudentPortfolioData
            setStudent({
              id: s.id,
              name: s.name || '',
              avatar: s.avatar || "/placeholder.svg",
              role: s.role || '',
              skills: s.skills || [],
              bio: s.bio || '',
              github: s.github || '',
              linkedin: s.linkedin || '',
              email: s.email || '',
              cv: s.cv || `http://cetmca26.live/students/${s.id}`,
              experience: s.experience || [],
              education: s.education || [],
              projects: s.projects || [],
              services: s.services,
              phone: s.phone,
              location: s.location,
              birthday: s.birthday,
            })
          } else {
            setStudent(null)
          }
        }
      } catch (err) {
        console.error('Error fetching student portfolio:', err)
        setStudent(null)
      } finally {
        setLoading(false)
      }
    }
    fetchStudent()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center bg-gradient-to-br from-[#0e0e10] via-[#1b2432] to-[#18191a]">
        <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mb-4" />
        <span className="text-lg text-white/80 animate-pulse">Loading portfolio…</span>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center mt-10 bg-gradient-to-br from-[#0e0e10] via-[#1b2432] to-[#18191a]">
        <h1 className="text-4xl font-extrabold bg-gradient-to-br from-blue-500 to-cyan-400 text-transparent bg-clip-text mb-3 animate-pulse">
          Student Not Found
        </h1>
        <p className="text-lg text-white/70 mb-3">
          The portfolio you are looking for does not exist.<br />
          <span className="text-cyan-400 font-semibold">Create an account and make your portfolio like this!</span>
        </p>
        <Button>
          <a href="https://cetmca26.live/register">
            <ArrowLeft className="mr-2 h-4 w-4" />Create Account
          </a>
        </Button>
      </div>
    )
  }

  const skills = Array.isArray(student.skills) ? student.skills : []
  const experience = Array.isArray(student.experience) ? student.experience : []
  const education = Array.isArray(student.education) ? student.education : []
  const projects = Array.isArray(student.projects) ? student.projects : []
  const services = Array.isArray(student.services) ? student.services : defaultServices

  const contactInfo = [
    student.phone ? { label: "Phone", value: student.phone } : null,
    student.email ? { label: "Email", value: student.email } : null,
    student.location ? { label: "Location", value: student.location } : null,
    student.birthday ? { label: "Birthday", value: student.birthday } : null,
  ].filter(Boolean)

  return (
    <div className="relative w-full min-h-screen pt-5 bg-gradient-to-br from-[#0e0e10] via-[#1b2432] to-[#18191a] text-white overflow-x-hidden">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-3 left-2 sm:top-6 sm:left-8 z-50 bg-black/60 hover:bg-black/80 text-white font-medium px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-white/10 transition-colors backdrop-blur"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> <a href="https://cetmca26.live">Go Back</a>
      </button>

      {/* Glowing BG */}
      <div className="absolute left-0 right-0 -z-10 top-[-120px] w-full h-[540px] opacity-35 blur-2xl pointer-events-none"
        style={{
          background: "radial-gradient(circle at 60% 50%, #06b6d4 0%, #f472b6 38%, transparent 80%)"
        }}
      />

      <main className="w-full min-h-screen flex flex-col justify-center items-center md:pt-12 md:pb-10 px-0 mt-4 pt-5">
        <div className="flex flex-col lg:flex-row w-full max-w-7xl items-start gap-0 pt-5">
          {/* Sidebar */}
          <section className="flex flex-col items-center w-full lg:max-w-[340px] text-center mr-4 p-3">
            <Avatar
              className="ring-4 ring-cyan-400 shadow-2xl mb-5 mx-auto"
              style={{
                width: "12.25rem",
                height: "12.25rem",
                boxShadow: "0 8px 48px #06b6d4aa"
              }}
            >
              <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
              <AvatarFallback>{student.name?.substring(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h2 className="mt-1 text-3xl font-bold text-gray-100 text-center">{student.name}</h2>
            <div className="text-cyan-300 font-medium text-lg mb-3 text-center">
              <TextType 
                text={[student.role, student.role]}
                typingSpeed={100}
                pauseDuration={2500}
                showCursor={true}
                className="text-white font-medium text-lg mb-3 text-center"
                cursorCharacter=" | "
              />
            </div>
            <div className="flex gap-4 mt-3 mb-5 justify-center text-white">
              {student.github && (
                <a href={student.github} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700 border-none shadow-md" aria-label="GitHub"><Github /></Button>
                </a>
              )}
              {student.linkedin && (
                <a href={student.linkedin} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700 border-none shadow-md" aria-label="LinkedIn"><Linkedin /></Button>
                </a>
              )}
              {student.email && (
                <a href={`mailto:${student.email}`}>
                  <Button size="icon" variant="secondary" className="bg-zinc-800 text-white hover:bg-zinc-700 border-none shadow-md" aria-label="Mail"><Mail /></Button>
                </a>
              )}
              <StudentQRCodeDialog studentId={student.id?.toString() ?? ""} studentName={student.name} />
            </div>
            {contactInfo.length > 0 && (
              <div className="text-zinc-400 mt-4 space-y-1 text-xs break-all w-full text-center">
                {contactInfo.map((info) => (
                  <div key={info.label}>
                    <span className="font-bold text-cyan-400">{info.label}:</span>{" "}
                    <span>{info.value}</span>
                  </div>
                ))}
              </div>
            )}
            <Button
              asChild
              className="bg-gradient-to-r from-cyan-400 via-blue-400 to-fuchsia-500 shadow-lg text-zinc-900 mt-8 font-bold hover:from-blue-500 hover:to-cyan-400 duration-200 w-full mx-auto"
              size="lg"
            >
              <a href={student.cv || `http://cetmca26.live/students/${student.id}`} target="_blank" rel="noopener noreferrer">
                <Download className="mr-2 h-5 w-5" />Download CV
              </a>
            </Button>
          </section>

          {/* Main Content */}
          <section
            className="
              w-full
              flex flex-col
              relative
              min-w-0
              lg:flex-[2.5]
              xl:flex-[3.5]
              max-w-4xl
              mx-auto
              lg:max-h-[calc(100vh-6rem)]
              lg:overflow-y-auto
              scrollbar-hide
              pr-2
              p-3
            "
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex gap-5 justify-end mb-6 bg-transparent px-0 shadow-none mt-1.5">
                <TabsTrigger value="about"
                  className="font-bold px-4 py-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white transition">
                  About
                </TabsTrigger>
                <TabsTrigger value="experience"
                  className="font-bold px-4 py-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white transition">
                  Experience
                </TabsTrigger>
                <TabsTrigger value="education"
                  className="font-bold px-4 py-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white transition">
                  Education
                </TabsTrigger>
                <TabsTrigger value="projects"
                  className="font-bold px-4 py-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-fuchsia-500 data-[state=active]:text-white transition">
                  Projects
                </TabsTrigger>
              </TabsList>
              <hr className="mb-4" />
              
              <TabsContent value="about" className="p-3">
                <h2 className="text-2xl font-extrabold mb-2 text-gradient bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-600 text-transparent bg-clip-text flex items-center gap-2">
                  <CheckCircle className="inline-block text-cyan-400" />About Me
                </h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg text-zinc-100/90 mb-5"
                >
                  {student.bio || "No bio provided."}
                </motion.p>
                <div>
                  <h3 className="font-bold text-xl text-gray-300 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.length === 0 && (
                      <Badge className="bg-zinc-600 text-white px-4">No skills listed</Badge>
                    )}
                    {skills.map((skill, i) => (
                      <Badge
                        key={skill}
                        className={`px-4 py-1 font-semibold rounded-full text-sm shadow hover:scale-105 transition-all ${skillColors[i % skillColors.length]}`}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {!!services.length && (
                    <>
                      <h3 className="font-bold text-xl text-gray-300 mt-10 mb-4">What I do</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {services.map((srv, i) => (
                          <motion.div
                            key={srv.title + i}
                            whileHover={{ scale: 1.035, y: -5 }}
                            className="rounded-2xl bg-zinc-800/85 shadow-xl flex flex-col items-start p-6 gap-3 min-h-[140px] w-full border-none"
                          >
                            <div>{srv.icon}</div>
                            <div className="font-bold text-cyan-300 text-lg">{srv.title}</div>
                            <div className="text-zinc-400 text-sm">{srv.desc}</div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="experience">
                <h2 className="text-2xl font-bold text-gray-200 mb-4">Experience</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  {experience.length === 0 && (
                    <div className="text-zinc-400 text-base">No experience listed.</div>
                  )}
                  {experience.map((exp, i) => (
                    <motion.div
                      key={exp.id || i}
                      className="rounded-xl bg-zinc-800/70 border-l-4 border-cyan-400/80 shadow flex flex-col p-5 h-full space-y-3 scrollbar-hide"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-cyan-300">{exp.role}</h3>
                          <div className="text-base text-blue-400 font-semibold">{exp.company}</div>
                        </div>
                        <div className="flex items-center text-sm text-emerald-400">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{exp.duration}</span>
                        </div>
                      </div>
                      <div className="text-zinc-400 max-h-24 overflow-y-auto scrollbar-hide">{exp.description}</div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="education">
                <h2 className="text-2xl font-bold text-gray-200 mb-4">Education</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  {education.length === 0 && (
                    <div className="text-zinc-400 text-base">No education listed.</div>
                  )}
                  {education.map((edu, i) => (
                    <motion.div
                      key={edu.id || i}
                      className="rounded-xl bg-zinc-800/70 border-l-4 border-blue-400/80 shadow flex flex-col p-5 h-full space-y-3 scrollbar-hide"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-300">{edu.degree}</h3>
                          <div className="text-base text-purple-400 font-semibold">{edu.institution}</div>
                        </div>
                        <div className="flex items-center text-sm text-emerald-400">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          <span>{edu.duration}</span>
                        </div>
                      </div>
                      <div className="text-zinc-400 max-h-24 overflow-y-auto scrollbar-hide">{edu.description}</div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="projects">
                <h2 className="text-2xl font-bold text-gray-200 mb-4">Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  {projects.length === 0 && (
                    <div className="text-zinc-400 text-base">No projects listed.</div>
                  )}
                  {projects.map((proj, i) => (
                    <motion.div
                      key={proj.id || i}
                      className="flex flex-col h-full rounded-xl bg-zinc-800/80 border-l-4 border-blue-400/80 shadow p-5 space-y-3 scrollbar-hide"
                    >
                      <h3 className="text-lg font-semibold text-blue-400/80">{proj.title}</h3>
                      <div className="text-zinc-400 mb-3 max-h-24 overflow-y-auto scrollbar-hide">{proj.description}</div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {Array.isArray(proj.technologies) && proj.technologies.map((tech, idx) => (
                          <Badge key={tech} variant="outline" className="px-2 bg-gradient-to-r from-fuchsia-400 to-pink-300 text-xs font-bold">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      {!!proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" className="w-full flex items-center gap-2 font-semibold border-blue-400/80 mt-auto">
                            <ExternalLink className="h-4 w-4" />
                            <span>View Project</span>
                          </Button>
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center py-6 mt-8">
          <p className="text-zinc-500 text-center text-sm">
            © {new Date().getFullYear()} {student.name} — Portfolio
          </p>
        </div>
      </main>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {display: none;}
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none;}
      `}</style>
    </div>
  )
}
