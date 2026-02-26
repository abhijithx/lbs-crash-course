"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, Users, AlertCircle, LogOut } from "lucide-react"
import { GroupsList } from "@/components/quiz/crash-course-quiz-groups-list"
import { CreateGroupDialog } from "@/components/quiz/create-group-dialog"
import { JoinGroupDialog } from "@/components/quiz/join-group-dialog"
import { LoginForm } from "@/components/quiz/login-form"
import { RegisterForm } from "@/components/quiz/register-form"

import { Alert, AlertDescription } from "@/components/ui/alert"

export function QuizDashboard() {
  const { user, loading, error, logout } = useAuth()
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [isJoinGroupOpen, setIsJoinGroupOpen] = useState(false)
  const [authTab, setAuthTab] = useState<string>("login")

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto my-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <div className="mt-2">
              <p className="text-sm">
                Please make sure you have set up Firebase correctly and added the required environment variables.
              </p>
            </div>
          </AlertDescription>
        </Alert>
       
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="ml-2">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto">
        <Tabs value={authTab} onValueChange={setAuthTab}>
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
    )
  }

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Welcome back!</h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <Tabs defaultValue="my-groups">

        <TabsContent value="my-groups">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Groups</h2>
            <div className="flex gap-2">
              <Button onClick={() => setIsJoinGroupOpen(true)} variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Join Group
              </Button>
           
            </div>
          </div>

          <GroupsList />

          <CreateGroupDialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen} />

          <JoinGroupDialog open={isJoinGroupOpen} onOpenChange={setIsJoinGroupOpen} />
        </TabsContent>

      </Tabs>
    </div>
  )
}
