"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, XCircle, ChevronLeft, ChevronRight, Clock, AlertCircle } from "lucide-react"
import { db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import type { Quiz, Question, QuizAttempt } from "@/types/quiz"
import { format, differenceInSeconds, addMinutes, isPast, isFuture } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

import { GroupLeaderboard } from "@/components/quiz/quiz-wise-leaderboard"
import jsPDF from "jspdf"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function QuizPage() {
  const { id, quizId } = useParams() as { id: string; quizId: string }
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [quizStarted, setQuizStarted] = useState(false)
  const [quizEnded, setQuizEnded] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer: "A" | "B" | "C" | "D" | null }[]>([])
  const [score, setScore] = useState<number | null>(null)
  const [previousAttempt, setPreviousAttempt] = useState<QuizAttempt | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [quizExpired, setQuizExpired] = useState(false)
  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false)

    // Prevent copying and other security measures
  useEffect(() => {
    const preventCopy = (e: Event) => {
      e.preventDefault()
      return false
    }

    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Prevent Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+S, Ctrl+P, F12, Ctrl+Shift+I, Ctrl+U
      if (
        (e.ctrlKey &&
          (e.key === "a" ||
            e.key === "c" ||
            e.key === "v" ||
            e.key === "x" ||
            e.key === "s" ||
            e.key === "p" ||
            e.key === "u")) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault()
        return false
      }
    }

    const preventDragStart = (e: DragEvent) => {
      e.preventDefault()
      return false
    }

    const preventSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Add event listeners
    document.addEventListener("copy", preventCopy)
    document.addEventListener("cut", preventCopy)
    document.addEventListener("paste", preventCopy)
    document.addEventListener("contextmenu", preventRightClick)
    document.addEventListener("keydown", preventKeyboardShortcuts)
    document.addEventListener("dragstart", preventDragStart)
    document.addEventListener("selectstart", preventSelectStart)

    // Add CSS to prevent text selection
    const style = document.createElement("style")
    style.textContent = `
      .quiz-content {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      .quiz-content * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    `
    document.head.appendChild(style)

    // Cleanup
    return () => {
      document.removeEventListener("copy", preventCopy)
      document.removeEventListener("cut", preventCopy)
      document.removeEventListener("paste", preventCopy)
      document.removeEventListener("contextmenu", preventRightClick)
      document.removeEventListener("keydown", preventKeyboardShortcuts)
      document.removeEventListener("dragstart", preventDragStart)
      document.removeEventListener("selectstart", preventSelectStart)
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    async function fetchQuizAndQuestions() {
      if (!quizId) return

      try {
        setLoading(true)

        // Fetch quiz
        const quizDoc = await getDoc(doc(db, "quizzes", quizId))

        if (!quizDoc.exists()) {
          setError("Quiz not found")
          setLoading(false)
          return
        }

        const quizData = {
          id: quizDoc.id,
          ...quizDoc.data(),
        } as Quiz

        setQuiz(quizData)

        // Check if quiz is active
        const now = new Date()
        const startTime = new Date(quizData.startTime)
        const endTime = new Date(quizData.endTime)

        if (isFuture(startTime)) {
          setError("This quiz is not available yet.")
          setLoading(false)
          return
        }

        // Fetch questions regardless of quiz status to show them in the results
        const questionsQuery = query(collection(db, "questions"), where("quizId", "==", quizId))
        const questionsSnapshot = await getDocs(questionsQuery)
        const questionsData = questionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Question[]
        setQuestions(questionsData)

        // Check if user is logged in
        if (user) {
          // Check if user is an admin
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists() && userDoc.data().role === "admin") {
            setIsAdmin(true)
          }

          // Check if user has attempted this quiz
          const attemptsQuery = query(
            collection(db, "quizAttempts"),
            where("quizId", "==", quizId),
            where("userId", "==", user.uid),
          )

          const attemptsSnapshot = await getDocs(attemptsQuery)

          if (!attemptsSnapshot.empty) {
            const attemptData = {
              id: attemptsSnapshot.docs[0].id,
              ...attemptsSnapshot.docs[0].data(),
            } as QuizAttempt

            setPreviousAttempt(attemptData)
          }
        }

        // Check if quiz has ended
        if (isPast(endTime)) {
          setQuizExpired(true)
          setLoading(false)
          return
        }

        // Initialize answers array
        setAnswers(
          questionsData.map((q) => ({
            questionId: q.id,
            selectedAnswer: null,
          })),
        )
      } catch (err: any) {
        console.error("Error fetching quiz:", err)
        setError("Failed to load quiz. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchQuizAndQuestions()
    }
  }, [quizId, user, authLoading, router])

  // Timer effect
  useEffect(() => {
    if (!quizStarted || !quiz || !startTime || quizEnded) return

    const timerInterval = setInterval(() => {
      const now = new Date()
      const quizEndTime = endTime || addMinutes(startTime, quiz.duration)
      const remainingSeconds = Math.max(0, differenceInSeconds(quizEndTime, now))

      setTimeRemaining(remainingSeconds)

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval)
        handleEndQuiz()
      }
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [quizStarted, quiz, startTime, endTime, quizEnded])

  // Full screen 
  // Replace the existing fullscreen useEffect with this simple version:
const onFullscreenChange = () => {
  if (!document.fullscreenElement && quizStarted && !quizEnded) {
    const confirmEnd = confirm("You exited fullscreen mode. Do you want to end the quiz?");
    if (confirmEnd) {
      handleEndQuiz();
    } else {
      enterFullscreen();
    }
  }
};

const enterFullscreen = () => {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
  } else if ((elem as any).webkitRequestFullscreen) {
    (elem as any).webkitRequestFullscreen();
  } else if ((elem as any).msRequestFullscreen) {
    (elem as any).msRequestFullscreen();
  }
};

const exitFullscreen = () => {
  if (document.exitFullscreen) {
    return document.exitFullscreen().catch(err => console.error("Exit fullscreen error:", err));
  } else if ((document as any).webkitExitFullscreen) {
    return (document as any).webkitExitFullscreen();
  } else if ((document as any).msExitFullscreen) {
    return (document as any).msExitFullscreen();
  }
};

  // End full screen
  const handleStartQuiz = () => {
    // Check if user is logged in before starting the quiz
    if (!user) {
      setError("Please log in to take the quiz")
      return
    }

    // Enter fullscreen mode
  enterFullscreen();
  document.addEventListener('fullscreenchange', onFullscreenChange);

    const now = new Date()
    setStartTime(now)
    setEndTime(addMinutes(now, quiz?.duration || 0))
    setTimeRemaining((quiz?.duration || 0) * 60)
    setQuizStarted(true)
  }

  const handleSelectAnswer = (answer: "A" | "B" | "C" | "D") => {
    const updatedAnswers = [...answers]
    updatedAnswers[currentQuestionIndex].selectedAnswer = answer
    setAnswers(updatedAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleEndQuiz = async () => {
    if (!quiz || !user || submitting) return

    try {
      setSubmitting(true)
      setQuizEnded(true)

       // Remove fullscreen change listener
  document.removeEventListener('fullscreenchange', onFullscreenChange);

       // Exit fullscreen when quiz ends
    await exitFullscreen();

      // Calculate score
      let totalScore = 0

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]
        const answer = answers[i]

        if (answer.selectedAnswer === question.correctAnswer) {
          totalScore += 1
        }
      }

      setScore(totalScore)

      // Save attempt to database
      await addDoc(collection(db, "quizAttempts"), {
        quizId,
        userId: user.uid,
        startTime: startTime?.toISOString(),
        endTime: new Date().toISOString(),
        score: totalScore,
        answers,
        createdAt: serverTimestamp(),
      })

      setSubmitting(false)
    } catch (err) {
      console.error("Error ending quiz:", err)
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const getQuestionStatus = (index: number) => {
    if (quizEnded || previousAttempt) {
      const answer = previousAttempt
        ? previousAttempt.answers.find((a) => a.questionId === questions[index].id)?.selectedAnswer
        : answers[index].selectedAnswer

      const correctAnswer = questions[index].correctAnswer

      if (!answer) return "unanswered"
      return answer === correctAnswer ? "correct" : "incorrect"
    }

    // return answers[index].selectedAnswer ? "answered" : "unanswered"
  }

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
    // Update active section when jumping to a question
    const newSection = Math.floor(index / 20) // Using 20 as questionsPerSection
    // This will be handled by the useEffect in QuestionNavigationCard
  }

  const QuestionNavigationCard = () => {
    const answeredCount = answers.filter((a) => a.selectedAnswer !== null).length
    const questionsPerSection = 20
    const questionsPerRow = 5
    const totalSections = Math.ceil(questions.length / questionsPerSection)

    // Calculate which section the current question is in
    const currentQuestionSection = Math.floor(currentQuestionIndex / questionsPerSection)
    const [activeSection, setActiveSection] = useState(currentQuestionSection)

    // Update active section when current question changes
    useEffect(() => {
      const newSection = Math.floor(currentQuestionIndex / questionsPerSection)
      setActiveSection(newSection)
    }, [currentQuestionIndex, questionsPerSection])

    // Get questions for the active section
    const sectionStartIndex = activeSection * questionsPerSection
    const sectionEndIndex = Math.min(sectionStartIndex + questionsPerSection, questions.length)
    const sectionQuestions = questions.slice(sectionStartIndex, sectionEndIndex)
    const questionsInSection = sectionQuestions.length
    const rowsInSection = Math.ceil(questionsInSection / questionsPerRow)

    // Calculate answered questions in current section
    const answeredInSection = answers
      .slice(sectionStartIndex, sectionEndIndex)
      .filter((a) => a.selectedAnswer !== null).length

    // Get section statistics
    const getSectionStats = (sectionIndex: number) => {
      const start = sectionIndex * questionsPerSection
      const end = Math.min(start + questionsPerSection, questions.length)
      const sectionAnswers = answers.slice(start, end)
      const answered = sectionAnswers.filter((a) => a.selectedAnswer !== null).length
      const total = end - start
      return { answered, total, start: start + 1, end }
    }

    // Handle section change
    const handleSectionChange = (sectionIndex: number) => {
      setActiveSection(sectionIndex)
      // If quiz is active, also jump to first question of that section
      if (quizStarted && !quizEnded) {
        const firstQuestionInSection = sectionIndex * questionsPerSection
        handleJumpToQuestion(firstQuestionInSection)
      }
    }

    return (
      <Card className="h-fit">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Question Navigation</CardTitle>
          <CardDescription>
            {answeredCount} of {questions.length} questions answered
          </CardDescription>

         
        </CardHeader>

        <CardContent className="space-y-4">
          

          {/* Section Navigation */}
          {totalSections > 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Sections</h4>
                <span className="text-xs text-muted-foreground">{totalSections} sections</span>
              </div>

              <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                {Array.from({ length: totalSections }, (_, sectionIndex) => {
                  const stats = getSectionStats(sectionIndex)
                  const isActive = sectionIndex === activeSection
                  const hasCurrentQuestion = Math.floor(currentQuestionIndex / questionsPerSection) === sectionIndex

                  return (
                    <TooltipProvider key={sectionIndex}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant={isActive ? "default" : "outline"}
                            className={cn(
                              "h-12 flex flex-col items-center justify-center text-xs transition-all duration-200",
                              stats.answered === stats.total &&
                                !isActive &&
                                "bg-green-100 border-green-500 text-green-700",
                              stats.answered > 0 &&
                                stats.answered < stats.total &&
                                !isActive &&
                                "bg-blue-100 border-blue-500 text-blue-700",
                              hasCurrentQuestion && "ring-2 ring-offset-1 ring-primary",
                            )}
                            onClick={() => handleSectionChange(sectionIndex)}
                          >
                            <span className="font-medium">{sectionIndex + 1}</span>
                            <span className="text-[10px] opacity-75">
                              {stats.answered}/{stats.total}
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <div className="text-xs">
                            <p className="font-medium">Section {sectionIndex + 1}</p>
                            <p>
                              Questions {stats.start}-{stats.end}
                            </p>
                            <p>
                              {stats.answered} of {stats.total} answered
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            </div>
          )}

          {/* Question Grid for Active Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {totalSections > 1 ? `Section ${activeSection + 1} Questions` : "Questions"}
              </h4>
              <span className="text-xs text-muted-foreground">
                {answeredInSection}/{questionsInSection} answered
              </span>
            </div>

            <div className="space-y-2">
              {Array.from({ length: rowsInSection }, (_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-5 gap-2">
                  {sectionQuestions
                    .slice(rowIndex * questionsPerRow, (rowIndex + 1) * questionsPerRow)
                    .map((_, colIndex) => {
                      const sectionQuestionIndex = rowIndex * questionsPerRow + colIndex
                      const globalQuestionIndex = sectionStartIndex + sectionQuestionIndex

                      if (sectionQuestionIndex >= questionsInSection) return null

                      const status = getQuestionStatus(globalQuestionIndex)
                      const isActive = currentQuestionIndex === globalQuestionIndex

                      return (
                        <TooltipProvider key={globalQuestionIndex}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={isActive ? "default" : "outline"}
                                className={cn(
                                  "h-10 w-full font-medium transition-all duration-200",
                                  status === "correct" &&
                                    !isActive &&
                                    "bg-green-100 border-green-500 text-green-700 hover:bg-green-200",
                                  status === "incorrect" &&
                                    !isActive &&
                                    "bg-red-100 border-red-500 text-red-700 hover:bg-red-200",
                                  status === "answered" &&
                                    !isActive &&
                                    "bg-blue-100 border-blue-500 text-blue-700 hover:bg-blue-200",
                                  status === "unanswered" && !isActive && "hover:bg-muted",
                                  isActive && "ring-2 ring-offset-2 ring-primary shadow-md",
                                )}
                                onClick={() => handleJumpToQuestion(globalQuestionIndex)}
                              >
                                {globalQuestionIndex + 1}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                              <div className="text-xs">
                                <p className="font-medium">Question {globalQuestionIndex + 1}</p>
                                <p className="text-muted-foreground">
                                  {status === "correct" && "Answered correctly"}
                                  {status === "incorrect" && "Answered incorrectly"}
                                  {status === "answered" && "Answered"}
                                  {status === "unanswered" && "Not answered yet"}
                                </p>
                                {questions[globalQuestionIndex]?.answerDescription && (
                                  <p className="text-blue-600 text-xs mt-1">📝 Has explanation</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                </div>
              ))}
            </div>
          </div>

        

        
      {/* Info Message */}
<div className="bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-md p-3 text-sm">
  <strong>Important:</strong> Please navigate to the <b>last question</b> to submit the quiz. The <b>Next</b> button will then become the <b>Submit</b> button.
</div>

        </CardContent>
      </Card>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="ml-2">Loading quiz...</p>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Error</h1>
        <p className="text-muted-foreground mb-8">{error || "Quiz not found"}</p>
        <Button onClick={() => router.push(`/quiz/groups/${id}`)}>Go Back</Button>
      </div>
    )
  }

  // Show previous attempt or expired quiz results
  if (previousAttempt || (quizExpired && !isAdmin) || (quizExpired && isAdmin)) {
   const generatePDF = async () => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - margin * 2
    let yPosition = margin

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage()
        yPosition = margin
        return true
      }
      return false
    }

    // Header with gradient-like effect
    pdf.setFillColor(41, 128, 185) // Blue background
    pdf.rect(0, 0, pageWidth, 50, "F")

    // Title
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(24)
    pdf.setFont("helvetica", "bold")
    pdf.text("QUIZ RESULTS", pageWidth / 2, 25, { align: "center" })

    // Subtitle
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "normal")
    pdf.text("Comprehensive Performance Report", pageWidth / 2, 35, { align: "center" })

    yPosition = 65

    // Credits section with styled box
    pdf.setFillColor(248, 249, 250) // Light gray background
    pdf.setDrawColor(200, 200, 200) // Border color
    pdf.rect(margin, yPosition, contentWidth, 25, "FD")

    yPosition += 8
    pdf.setTextColor(108, 117, 125) // Gray text
    pdf.setFontSize(10)
    pdf.text("Generated by cetmca26.live", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 6
    // Happlle credits with colors
    pdf.setTextColor(255, 165, 0) // Orange
    const happText = "Cetmca"
    const happWidth = pdf.getTextWidth(happText)
    const totalWidth = pdf.getTextWidth("Cetmca26 Community")
    const startX = (pageWidth - totalWidth) / 2
    pdf.text(happText, startX, yPosition)

    pdf.setTextColor(0, 100, 200) // Blue
    pdf.text("26", startX + happWidth, yPosition)

    pdf.setTextColor(108, 117, 125) // Gray
    pdf.text("Community", startX + happWidth + pdf.getTextWidth("lle"), yPosition)

    yPosition += 20

    // Quiz Information Section
    checkPageBreak(40)
    pdf.setFillColor(52, 152, 219) // Blue header
    pdf.rect(margin, yPosition, contentWidth, 8, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("QUIZ INFORMATION", margin + 5, yPosition + 6)

    yPosition += 15
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text(`Quiz: ${quiz.name}`, margin, yPosition)

    yPosition += 8
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    if (previousAttempt) {
      pdf.text(
        `Score: ${previousAttempt.score}/${questions.length} (${Math.round((previousAttempt.score / questions.length) * 100)}%)`,
        margin,
        yPosition,
      )
      yPosition += 6
      pdf.text(`Completed: ${format(new Date(previousAttempt.endTime), "MMMM d, yyyy 'at' h:mm a")}`, margin, yPosition)
    } else if (score !== null) {
      pdf.text(
        `Score: ${score}/${questions.length} (${Math.round((score / questions.length) * 100)}%)`,
        margin,
        yPosition,
      )
      yPosition += 6
      pdf.text(`Completed: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, margin, yPosition)
    }

    yPosition += 6
    pdf.text(`Total Questions: ${questions.length}`, margin, yPosition)
    yPosition += 6
    pdf.text(`Duration: ${quiz.duration} minutes`, margin, yPosition)

    yPosition += 20

    // Performance Summary
    if (previousAttempt || score !== null) {
      checkPageBreak(40)
      const currentScore = previousAttempt ? previousAttempt.score : score!
      const correctAnswers = currentScore
      const incorrectAnswers = questions.length - correctAnswers
      const percentage = Math.round((correctAnswers / questions.length) * 100)

      pdf.setFillColor(40, 167, 69) // Green header
      pdf.rect(margin, yPosition, contentWidth, 8, "F")
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "bold")
      pdf.text("PERFORMANCE SUMMARY", margin + 5, yPosition + 6)

      yPosition += 20

      // Performance bars
      const barWidth = 100
      const barHeight = 6

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.text(`Correct Answers: ${correctAnswers}`, margin, yPosition)
      pdf.setFillColor(40, 167, 69) // Green
      pdf.rect(margin + 80, yPosition - 4, (correctAnswers / questions.length) * barWidth, barHeight, "F")
      pdf.setDrawColor(200, 200, 200)
      pdf.rect(margin + 80, yPosition - 4, barWidth, barHeight, "D")

      yPosition += 10
      pdf.text(`Incorrect Answers: ${incorrectAnswers}`, margin, yPosition)
      pdf.setFillColor(220, 53, 69) // Red
      pdf.rect(margin + 80, yPosition - 4, (incorrectAnswers / questions.length) * barWidth, barHeight, "F")
      pdf.rect(margin + 80, yPosition - 4, barWidth, barHeight, "D")

      yPosition += 10
      pdf.setFont("helvetica", "bold")
      pdf.text(`Overall Performance: ${percentage}%`, margin, yPosition)

      yPosition += 20
    }

    // Questions and Answers Section
    checkPageBreak(20)
    pdf.setFillColor(108, 117, 125) // Gray header
    pdf.rect(margin, yPosition, contentWidth, 8, "F")
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(12)
    pdf.setFont("helvetica", "bold")
    pdf.text("DETAILED ANSWERS", margin + 5, yPosition + 6)

    yPosition += 20

    // Questions
    questions.forEach((question, index) => {
      checkPageBreak(60)

      const answer =
        previousAttempt?.answers.find((a) => a.questionId === question.id) || (answers[index] ? answers[index] : null)
      const isCorrect = answer?.selectedAnswer === question.correctAnswer
      const hasAnswer = answer?.selectedAnswer !== null

      // Question header
      pdf.setFillColor(248, 249, 250) // Light background
      pdf.setDrawColor(200, 200, 200)
      pdf.rect(margin, yPosition, contentWidth, 12, "FD")

      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(11)
      pdf.setFont("helvetica", "bold")
      pdf.text(`Question ${index + 1}`, margin + 5, yPosition + 8)

      // Status indicator
      if (hasAnswer) {
        if (isCorrect) {
          pdf.setFillColor(40, 167, 69) // Green
          pdf.setTextColor(255, 255, 255)
          pdf.rect(contentWidth - 25, yPosition + 2, 20, 8, "F")
          pdf.setFontSize(8)
          pdf.text("CORRECT", contentWidth - 15, yPosition + 7, { align: "center" })
        } else {
          pdf.setFillColor(220, 53, 69) // Red
          pdf.setTextColor(255, 255, 255)
          pdf.rect(contentWidth - 25, yPosition + 2, 20, 8, "F")
          pdf.setFontSize(8)
          pdf.text("WRONG", contentWidth - 15, yPosition + 7, { align: "center" })
        }
      }

      yPosition += 18

      // Question text
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      const questionLines = pdf.splitTextToSize(question.question, contentWidth - 10)
      pdf.text(questionLines, margin + 5, yPosition)
      yPosition += questionLines.length * 5 + 8

      // Options
      const options = [
        { letter: "A", text: question.optionA },
        { letter: "B", text: question.optionB },
        { letter: "C", text: question.optionC },
        { letter: "D", text: question.optionD },
      ]

      options.forEach((option) => {
        const isCorrectAnswer = question.correctAnswer === option.letter
        const isUserAnswer = answer?.selectedAnswer === option.letter

        // Option background
        if (isCorrectAnswer) {
          pdf.setFillColor(212, 237, 218) // Light green
        } else if (isUserAnswer && !isCorrectAnswer) {
          pdf.setFillColor(248, 215, 218) // Light red
        } else {
          pdf.setFillColor(255, 255, 255) // White
        }

        const optionHeight = 8
        pdf.rect(margin + 10, yPosition - 2, contentWidth - 20, optionHeight, "F")

        // Option text
        if (isCorrectAnswer) {
          pdf.setTextColor(21, 87, 36) // Dark green
          pdf.setFont("helvetica", "bold")
        } else if (isUserAnswer && !isCorrectAnswer) {
          pdf.setTextColor(132, 32, 41) // Dark red
          pdf.setFont("helvetica", "normal")
        } else {
          pdf.setTextColor(0, 0, 0)
          pdf.setFont("helvetica", "normal")
        }

        const optionText = `${option.letter}. ${option.text}${isCorrectAnswer ? " ✓" : ""}`
        const optionLines = pdf.splitTextToSize(optionText, contentWidth - 30)
        pdf.text(optionLines, margin + 15, yPosition + 2)
        yPosition += Math.max(optionLines.length * 4, 6) + 2
      })

      // Add answer description after options
      if (question.answerDescription) {
        yPosition += 5
        pdf.setFillColor(240, 248, 255) // Light blue background
        pdf.rect(margin + 10, yPosition - 2, contentWidth - 20, 20, "F")
        
        pdf.setTextColor(0, 0, 0)
        pdf.setFontSize(9)
        pdf.setFont("helvetica", "bold")
        pdf.text("Explanation:", margin + 15, yPosition + 2)
        
        yPosition += 6
        pdf.setFont("helvetica", "normal")
        const explanationLines = pdf.splitTextToSize(question.answerDescription, contentWidth - 30)
        pdf.text(explanationLines, margin + 15, yPosition)
        yPosition += explanationLines.length * 4 + 5
      }

      // User's answer if wrong
      if (hasAnswer && answer?.selectedAnswer && !isCorrect) {
        yPosition += 3
        pdf.setFillColor(248, 215, 218) // Light red background
        pdf.rect(margin + 10, yPosition - 2, contentWidth - 20, 8, "F")
        pdf.setTextColor(132, 32, 41) // Dark red
        pdf.setFontSize(9)
        pdf.setFont("helvetica", "bold")
        pdf.text(`Your Answer: ${answer.selectedAnswer}`, margin + 15, yPosition + 2)
        yPosition += 8
      }

      yPosition += 10
    })

    // Footer
    const totalPages = pdf.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i)
      pdf.setTextColor(108, 117, 125)
      pdf.setFontSize(8)
      pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" })
      pdf.text(`Generated on ${format(new Date(), "MMMM d, yyyy")}`, margin, pageHeight - 10)
    }

    // Save the PDF
    const fileName = `${quiz.name.replace(/[^a-z0-9]/gi, "_")}_Results.pdf`
    pdf.save(fileName)
  }

    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Navigation Card - 30% on desktop */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <QuestionNavigationCard />
          </div>

          {/* Results Card - 70% on desktop */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>{quiz.name}</CardTitle>
                    <CardDescription>
                      {isAdmin && !previousAttempt
                        ? "Admin View - Quiz Results"
                        : previousAttempt
                          ? "You have already completed this quiz."
                          : "This quiz has ended."}
                    </CardDescription>
                    {isAdmin && !previousAttempt && (
                      <p className="text-xs text-muted-foreground mt-1">You are viewing this as an administrator</p>
                    )}
                  </div>
                  <Button onClick={generatePDF} variant="outline" className="w-full sm:w-auto">
                    Download PDF Results
                  </Button>
                  
                </div>
                <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 mt-4" />
              </CardHeader>
              <CardContent className="space-y-4">
                {previousAttempt ? (
                  <div className="flex items-center justify-center p-6 bg-primary/5 rounded-md mb-6">
                    <div className="text-center">
                      <p className="text-lg font-medium mb-2">Your Score</p>
                      <p className="text-4xl font-bold text-primary">
                        {previousAttempt.score} / {questions.length}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Completed on {format(new Date(previousAttempt.endTime), "MMMM d, yyyy h:mm a")}
                      </p>
                        <a
    href="https://chat.whatsapp.com/LLbHG4YBtl74mqokJyhxdl?mode=ac_t"
    target="_blank"
    rel="noopener noreferrer"
    className="inline-block px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition"
  >
    Join Quiz Support Group
  </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 bg-primary/5 rounded-md mb-6">
                    <div className="text-center">
                      <p className="text-lg font-medium mb-2">Quiz Ended</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        This quiz ended on {format(new Date(quiz.endTime), "MMMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                )}

                {questions.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </h3>
                    </div>

                    {(() => {
                      const question = questions[currentQuestionIndex]
                      const answer = previousAttempt?.answers.find((a) => a.questionId === question.id)
                      const isCorrect = answer?.selectedAnswer === question.correctAnswer

                      return (
                        <div className="border rounded-md p-6">
                          <div className="flex items-start gap-3">
                            {previousAttempt &&
                              (isCorrect ? (
                                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                              ))}
                            <div className="flex-1">
                              <p className="font-medium mb-4 text-lg leading-relaxed">{question.question}</p>
                              <div className="space-y-3">
                                <div
                                  className={cn(
                                    "p-3 rounded-lg border",
                                    question.correctAnswer === "A" && "bg-green-50 border-green-200",
                                    answer?.selectedAnswer === "A" &&
                                      answer.selectedAnswer !== question.correctAnswer &&
                                      "bg-red-50 border-red-200",
                                  )}
                                >
                                  <p
                                    className={cn(
                                      "text-sm",
                                      question.correctAnswer === "A" && "text-green-700 font-medium",
                                      answer?.selectedAnswer === "A" &&
                                        answer.selectedAnswer !== question.correctAnswer &&
                                        "text-red-700",
                                    )}
                                  >
                                    <span className="font-medium text-primary mr-2">A.</span>
                                    {question.optionA}
                                    {question.correctAnswer === "A" && " ✓ (Correct Answer)"}
                                  </p>
                                </div>
                                <div
                                  className={cn(
                                    "p-3 rounded-lg border",
                                    question.correctAnswer === "B" && "bg-green-50 border-green-200",
                                    answer?.selectedAnswer === "B" &&
                                      answer.selectedAnswer !== question.correctAnswer &&
                                      "bg-red-50 border-red-200",
                                  )}
                                >
                                  <p
                                    className={cn(
                                      "text-sm",
                                      question.correctAnswer === "B" && "text-green-700 font-medium",
                                      answer?.selectedAnswer === "B" &&
                                        answer.selectedAnswer !== question.correctAnswer &&
                                        "text-red-700",
                                    )}
                                  >
                                    <span className="font-medium text-primary mr-2">B.</span>
                                    {question.optionB}
                                    {question.correctAnswer === "B" && " ✓ (Correct Answer)"}
                                  </p>
                                </div>
                                <div
                                  className={cn(
                                    "p-3 rounded-lg border",
                                    question.correctAnswer === "C" && "bg-green-50 border-green-200",
                                    answer?.selectedAnswer === "C" &&
                                      answer.selectedAnswer !== question.correctAnswer &&
                                      "bg-red-50 border-red-200",
                                  )}
                                >
                                  <p
                                    className={cn(
                                      "text-sm",
                                      question.correctAnswer === "C" && "text-green-700 font-medium",
                                      answer?.selectedAnswer === "C" &&
                                        answer.selectedAnswer !== question.correctAnswer &&
                                        "text-red-700",
                                    )}
                                  >
                                    <span className="font-medium text-primary mr-2">C.</span>
                                    {question.optionC}
                                    {question.correctAnswer === "C" && " ✓ (Correct Answer)"}
                                  </p>
                                </div>
                                <div
                                  className={cn(
                                    "p-3 rounded-lg border",
                                    question.correctAnswer === "D" && "bg-green-50 border-green-200",
                                    answer?.selectedAnswer === "D" &&
                                      answer.selectedAnswer !== question.correctAnswer &&
                                      "bg-red-50 border-red-200",
                                  )}
                                >
                                  <p
                                    className={cn(
                                      "text-sm",
                                      question.correctAnswer === "D" && "text-green-700 font-medium",
                                      answer?.selectedAnswer === "D" &&
                                        answer.selectedAnswer !== question.correctAnswer &&
                                        "text-red-700",
                                    )}
                                  >
                                    <span className="font-medium text-primary mr-2">D.</span>
                                    {question.optionD}
                                    {question.correctAnswer === "D" && " ✓ (Correct Answer)"}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Add answer description after the options */}
                              {question.answerDescription && (
                                <div className="mt-6 p-4border border-blue-200 rounded-lg">
                                  <h4 className="font-medium mb-2">Explanation:</h4>
                                  <p className=" leading-relaxed">
                                    {question.answerDescription}
                                  </p>
                                </div>
                              )}
                              
                              {previousAttempt &&
                                answer?.selectedAnswer &&
                                answer.selectedAnswer !== question.correctAnswer && (
                                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm font-medium">
                                      Your answer: {answer.selectedAnswer}
                                    </p>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="w-full sm:w-auto"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Question
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="w-full sm:w-auto"
                >
                  Next Question
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Render leaderboard for logged in users and admins */}
        {/* <div className="mt-8">
          {user || isAdmin ? (
            <GroupLeaderboard quizId={quizId} />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Please login to view the leaderboard</h2>
              <p className="text-muted-foreground">You must be logged in to see quiz rankings.</p>
            </div>
          )}
        </div> */}
      </div>
    )
  }

  // Also update the quizEnded section similarly
  if (quizEnded) {
    const generatePDF = async () => {
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let yPosition = 20

      // Add header with credits
      pdf.setFontSize(16)
      pdf.setFont("helvetica", "bold")
      pdf.text("Quiz Results", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 15

      // Add credits
      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      pdf.text("Generated by cetmca26.live", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 8

      // Add Happlle credits with colors
      pdf.setTextColor(255, 165, 0) // Orange
      const happText = "Cetmca"
      const happWidth = pdf.getTextWidth(happText)
      const startX = (pageWidth - pdf.getTextWidth("Cetmca26 Community")) / 2
      pdf.text(happText, startX, yPosition)

      pdf.setTextColor(0, 0, 255) // Blue
      pdf.text("26", startX + happWidth, yPosition)

      pdf.setTextColor(0, 0, 0) // Black
      pdf.text("Community", startX + happWidth + pdf.getTextWidth("lle"), yPosition)
      yPosition += 15

      // Quiz info
      pdf.setFontSize(14)
      pdf.setFont("helvetica", "bold")
      pdf.text(quiz.name, 20, yPosition)
      yPosition += 10

      pdf.setFontSize(12)
      pdf.setFont("helvetica", "normal")
      pdf.text(`Score: ${score}/${questions.length}`, 20, yPosition)
      yPosition += 8
      pdf.text(`Completed: ${format(new Date(), "MMMM d, yyyy h:mm a")}`, 20, yPosition)
      yPosition += 15

      // Questions and answers
      questions.forEach((question, index) => {
        if (yPosition > pageHeight - 60) {
          pdf.addPage()
          yPosition = 20
        }

        const answer = answers[index]
        const isCorrect = answer.selectedAnswer === question.correctAnswer

        // Question number and text
        pdf.setFontSize(11)
        pdf.setFont("helvetica", "bold")
        const questionText = `${index + 1}. ${question.question}`
        const questionLines = pdf.splitTextToSize(questionText, pageWidth - 40)
        pdf.text(questionLines, 20, yPosition)
        yPosition += questionLines.length * 5 + 5

        // Options
        pdf.setFont("helvetica", "normal")
        const options = [
          { letter: "A", text: question.optionA },
          { letter: "B", text: question.optionB },
          { letter: "C", text: question.optionC },
          { letter: "D", text: question.optionD },
        ]

        options.forEach((option) => {
          const isCorrectAnswer = question.correctAnswer === option.letter
          const isUserAnswer = answer.selectedAnswer === option.letter

          if (isCorrectAnswer) {
            pdf.setTextColor(0, 128, 0) // Green for correct
            pdf.setFont("helvetica", "bold")
          } else if (isUserAnswer && !isCorrectAnswer) {
            pdf.setTextColor(255, 0, 0) // Red for wrong user answer
            pdf.setFont("helvetica", "normal")
          } else {
            pdf.setTextColor(0, 0, 0) // Black for normal
            pdf.setFont("helvetica", "normal")
          }

          const optionText = `${option.letter}: ${option.text}${isCorrectAnswer ? " (Correct)" : ""}`
          const optionLines = pdf.splitTextToSize(optionText, pageWidth - 50)
          pdf.text(optionLines, 30, yPosition)
          yPosition += optionLines.length * 4 + 2
        })

        // Add answer description
        if (question.answerDescription) {
          pdf.setTextColor(0, 100, 200) // Blue color
          pdf.setFont("helvetica", "bold")
          pdf.text("Explanation:", 30, yPosition)
          yPosition += 5
          
          pdf.setTextColor(0, 0, 0)
          pdf.setFont("helvetica", "normal")
          const explanationLines = pdf.splitTextToSize(question.answerDescription, pageWidth - 50)
          pdf.text(explanationLines, 30, yPosition)
          yPosition += explanationLines.length * 4 + 5
        }

        pdf.setTextColor(0, 0, 0) // Reset color
        yPosition += 8
      })

      // Save the PDF
      pdf.save(`${quiz.name}_Results.pdf`)
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Navigation Card - 30% on desktop */}
          <div className="lg:col-span-4 order-2 lg:order-1">
            <QuestionNavigationCard />
          </div>

          {/* Results Card - 70% on desktop */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>{quiz.name}</CardTitle>
                    <CardDescription>Quiz completed</CardDescription>
                  </div>
                  <Button onClick={generatePDF} variant="outline" className="w-full sm:w-auto">
                    Download PDF Results
                  </Button>
                </div>
                <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 mt-4" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center p-6 bg-primary/5 rounded-md">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">Your Score</p>
                    <p className="text-4xl font-bold text-primary">
                      {score} / {questions.length}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {Math.round(((score || 0) / questions.length) * 100)}% correct
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </h3>
                  </div>

                  {(() => {
                    const question = questions[currentQuestionIndex]
                    const answer = answers[currentQuestionIndex]
                    const isCorrect = answer.selectedAnswer === question.correctAnswer

                    return (
                      <div className="border rounded-md p-6">
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium mb-4 text-lg leading-relaxed">{question.question}</p>
                            <div className="space-y-3">
                              <div
                                className={cn(
                                  "p-3 rounded-lg border",
                                  question.correctAnswer === "A" && "bg-green-50 border-green-200",
                                  answer.selectedAnswer === "A" &&
                                    answer.selectedAnswer !== question.correctAnswer &&
                                    "bg-red-50 border-red-200",
                                )}
                              >
                                <p
                                  className={cn(
                                    "text-sm",
                                    question.correctAnswer === "A" && "text-green-700 font-medium",
                                    answer.selectedAnswer === "A" &&
                                      answer.selectedAnswer !== question.correctAnswer &&
                                      "text-red-700",
                                  )}
                                >
                                  <span className="font-medium text-primary mr-2">A.</span>
                                  {question.optionA}
                                  {question.correctAnswer === "A" && " ✓ (Correct Answer)"}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  "p-3 rounded-lg border",
                                  question.correctAnswer === "B" && "bg-green-50 border-green-200",
                                  answer.selectedAnswer === "B" &&
                                    answer.selectedAnswer !== question.correctAnswer &&
                                    "bg-red-50 border-red-200",
                                )}
                              >
                                <p
                                  className={cn(
                                    "text-sm",
                                    question.correctAnswer === "B" && "text-green-700 font-medium",
                                    answer.selectedAnswer === "B" &&
                                      answer.selectedAnswer !== question.correctAnswer &&
                                      "text-red-700",
                                  )}
                                >
                                  <span className="font-medium text-primary mr-2">B.</span>
                                  {question.optionB}
                                  {question.correctAnswer === "B" && " ✓ (Correct Answer)"}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  "p-3 rounded-lg border",
                                  question.correctAnswer === "C" && "bg-green-50 border-green-200",
                                  answer.selectedAnswer === "C" &&
                                    answer.selectedAnswer !== question.correctAnswer &&
                                    "bg-red-50 border-red-200",
                                )}
                              >
                                <p
                                  className={cn(
                                    "text-sm",
                                    question.correctAnswer === "C" && "text-green-700 font-medium",
                                    answer.selectedAnswer === "C" &&
                                      answer.selectedAnswer !== question.correctAnswer &&
                                      "text-red-700",
                                  )}
                                >
                                  <span className="font-medium text-primary mr-2">C.</span>
                                  {question.optionC}
                                  {question.correctAnswer === "C" && " ✓ (Correct Answer)"}
                                </p>
                              </div>
                              <div
                                className={cn(
                                  "p-3 rounded-lg border",
                                  question.correctAnswer === "D" && "bg-green-50 border-green-200",
                                  answer.selectedAnswer === "D" &&
                                    answer.selectedAnswer !== question.correctAnswer &&
                                    "bg-red-50 border-red-200",
                                )}
                              >
                                <p
                                  className={cn(
                                    "text-sm",
                                    question.correctAnswer === "D" && "text-green-700 font-medium",
                                    answer.selectedAnswer === "D" &&
                                      answer.selectedAnswer !== question.correctAnswer &&
                                      "text-red-700",
                                  )}
                                >
                                  <span className="font-medium text-primary mr-2">D.</span>
                                  {question.optionD}
                                  {question.correctAnswer === "D" && " ✓ (Correct Answer)"}
                                </p>
                              </div>
                            </div>
                            
                            {/* Add answer description after the options */}
                            {question.answerDescription && (
                              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                                <p className="text-blue-800 text-sm leading-relaxed">
                                  {question.answerDescription}
                                </p>
                              </div>
                            )}
                            
                            {answer.selectedAnswer && answer.selectedAnswer !== question.correctAnswer && (
                              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm font-medium">Your answer: {answer.selectedAnswer}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="w-full sm:w-auto"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous Question
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="w-full sm:w-auto"
                >
                  Next Question
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Render leaderboard for logged in users and admins */}
        {/* <div className="mt-8">
          {user || isAdmin ? (
            <GroupLeaderboard quizId={quizId} />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Please login to view the leaderboard</h2>
              <p className="text-muted-foreground">You must be logged in to see quiz rankings.</p>
            </div>
          )}
        </div> */}
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{quiz.name}</CardTitle>
            <CardDescription>{quiz.description}</CardDescription>
            {isAdmin && <p className="text-xs text-muted-foreground mt-1">You are viewing this as an administrator</p>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Duration: {quiz.duration} minutes</p>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Questions: {questions.length}</p>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Once you start the quiz, you will have {quiz.duration} minutes to complete it. You cannot pause or
                restart the quiz once it has begun.
              </AlertDescription>
            </Alert>

            {/* Show login message if user is not logged in and not admin */}
            {!user && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  Please log in to take this quiz and view the leaderboard.
                </AlertDescription>
              </Alert>
            )}

            {/* Special message for admins */}
            {isAdmin && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  As an administrator, you can view the quiz questions and leaderboard without taking the quiz.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button onClick={handleStartQuiz} className="w-full" disabled={questions.length === 0 || !user}>
              {user ? "Start Quiz" : "Login Required to Start"}
            </Button>

            {/* Special button for admins to view results without taking the quiz */}
            {isAdmin && (
              <Button onClick={() => setQuizExpired(true)} variant="outline" className="w-full">
                View Quiz Results (Admin)
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Show leaderboard for admins even before taking the quiz */}
        {isAdmin && (
          <div className="mt-8">
            <GroupLeaderboard quizId={quizId} />
          </div>
        )}
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = answers[currentQuestionIndex]

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Go Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Card - 30% on desktop, full width on mobile (below question) */}
        <div className="lg:col-span-4 order-1 lg:order-1">
          <QuestionNavigationCard />
        </div>

        {/* Question Card - 70% on desktop, full width on mobile (above navigation) */}
        <div className="lg:col-span-8 order-2 lg:order-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl">{quiz.name}</CardTitle>
                  <CardDescription>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </CardDescription>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-2xl font-mono font-bold text-primary">{formatTime(timeRemaining)}</div>
                  <p className="text-xs text-muted-foreground">Time Remaining</p>
                </div>
              </div>
              <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 mt-4" />
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-medium leading-relaxed">{currentQuestion.question}</h3>

                <RadioGroup
                  value={currentAnswer.selectedAnswer || ""}
                  onValueChange={(value) => handleSelectAnswer(value as "A" | "B" | "C" | "D")}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="A" id="option-a" className="mt-1" />
                    <Label htmlFor="option-a" className="flex-1 cursor-pointer leading-relaxed">
                      <span className="font-medium text-primary mr-2">A.</span>
                      {currentQuestion.optionA}
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="B" id="option-b" className="mt-1" />
                    <Label htmlFor="option-b" className="flex-1 cursor-pointer leading-relaxed">
                      <span className="font-medium text-primary mr-2">B.</span>
                      {currentQuestion.optionB}
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="C" id="option-c" className="mt-1" />
                    <Label htmlFor="option-c" className="flex-1 cursor-pointer leading-relaxed">
                      <span className="font-medium text-primary mr-2">C.</span>
                      {currentQuestion.optionC}
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <RadioGroupItem value="D" id="option-d" className="mt-1" />
                    <Label htmlFor="option-d" className="flex-1 cursor-pointer leading-relaxed">
                      <span className="font-medium text-primary mr-2">D.</span>
                      {currentQuestion.optionD}
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2 w-full sm:w-auto">
                {currentQuestionIndex === questions.length - 1 ? (
                     <Button
                    onClick={() => setShowSubmitConfirmation(true)}
                    disabled={submitting}
                    className="w-full sm:w-auto"
                  >
                    {submitting ? "Submitting..." : "Submit Quiz"}
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} className="w-full sm:w-auto">
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      
      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitConfirmation} onOpenChange={setShowSubmitConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quiz</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your quiz? Once submitted, you cannot make any changes to your answers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Questions answered:</strong> {answers.filter((a) => a.selectedAnswer !== null).length} of{" "}
                {questions.length}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Time remaining:</strong> {formatTime(timeRemaining)}
              </p>
              {answers.filter((a) => a.selectedAnswer === null).length > 0 && (
                <p className="text-sm text-yellow-600">
                  ⚠️ You have {answers.filter((a) => a.selectedAnswer === null).length} unanswered questions.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitConfirmation(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowSubmitConfirmation(false)
                handleEndQuiz()
              }}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
