// Add a note about preview environments
import { RegisterForm } from "@/components/crash-course/register-form"
import { CrashCourseAuthProvider } from "@/contexts/crash-course-auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function CrashCourseRegisterPage() {
  return (
    <CrashCourseAuthProvider>
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-center mb-2">CET MCA 26 Crash Course</h1>
        <p className="text-center text-gray-600 mb-8">Register to access crash course materials</p>

        <RegisterForm />
      </div>
    </CrashCourseAuthProvider>
  )
}
