"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/crash-course/login-form"
import { RegisterForm } from "@/components/crash-course/register-form"
import { CrashCourseAuthProvider } from "@/contexts/crash-course-auth-context"

export default function CrashCoursePage() {
  const [activeTab, setActiveTab] = useState("login")

  return (
    <CrashCourseAuthProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Login</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Complete Course, Recorded Sessions, Quizzes, Mock Tests.
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-6">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="register" className="mt-6">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </CrashCourseAuthProvider>
  )
}