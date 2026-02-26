"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { StudentPortfolioData } from '@/types/student-portfolio'
import { Loader2 } from "lucide-react"

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5)
}

export function StudentsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [studentsData, setStudentsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch Firebase student portfolios on component mount
  useEffect(() => {
    const fetchStudentPortfolios = async () => {
      setLoading(true)
      setError(null)
      try {
        const portfoliosRef = collection(db, 'studentPortfolios')
        const querySnapshot = await getDocs(portfoliosRef)
        const firebaseStudents: StudentPortfolioData[] = []
        querySnapshot.forEach((doc) => {
          firebaseStudents.push({
            id: doc.id,
            ...doc.data()
          } as StudentPortfolioData)
        })
        const shuffledData = shuffleArray(firebaseStudents)
        setStudentsData(shuffledData)
      } catch (err) {
        console.error('Error fetching student portfolios:', err)
        setError('Failed to fetch student portfolios')
        setStudentsData([]) // No fallback to local data
      } finally {
        setLoading(false)
      }
    }
    fetchStudentPortfolios()
  }, [])

  const filteredStudents = studentsData.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading students...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  // Show CTA if no students in Firebase
  if (studentsData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No portfolios found. <b>Create an account and make your portfolio like this!</b></p>
        <Button asChild>
          <Link href="/register">Create Account</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search by name, role, or skill..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No students found matching your search criteria.</p>
          <Button className="mt-4" onClick={() => setSearchTerm("")}>
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {filteredStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                      <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle>{student.name}</CardTitle>
                  <CardDescription className="text-cyan-400">{student.role}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ScrollArea className="h-24 mt-1 p-0 w-full">
                    <p className="text-sm text-muted-foreground text-center">
                      {student.bio}
                    </p>
                  </ScrollArea>
                  <ScrollArea className="h-12 mt-3 w-full">
                    <div className="flex flex-wrap justify-center gap-1.5 mt-2 w-full">
                      {student.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex justify-center gap-2 pt-2">
                  <Link href={`/students/${student.id}`} className="w-full">
                    <Button className="w-full bg-[#28cee3] hover:bg-[#28cee3]/90">View Portfolio</Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
