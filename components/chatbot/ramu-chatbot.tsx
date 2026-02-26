"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Send, Bot, User, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Image from "next/image"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

// Simple markdown renderer for basic formatting
const renderMarkdown = (text: string) => {
  // Replace **bold** with <strong>
  let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

  // Replace *italic* with <em>
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>")

  // Replace `code` with <code>
  formatted = formatted.replace(
    /`(.*?)`/g,
    '<code class="bg-purple-100 dark:bg-slate-700 px-1 py-0.5 rounded text-sm">$1</code>',
  )

  // Replace line breaks with <br>
  formatted = formatted.replace(/\n/g, "<br>")

  return formatted
}
export function RamuChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isWaving, setIsWaving] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

    // Disable chatbot on quiz pages - more comprehensive check
  const isQuizPage = pathname
    ? (pathname.includes("/quiz/groups/") && pathname.includes("/quizzes/")) ||
      (pathname.includes("/quiz/groups/") && pathname.includes("/edit")) ||
      pathname.match(/\/quiz\/groups\/[^/]+\/quizzes\/[^/]+/)
    : false


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Add welcome message when chatbot opens
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        content:
          "Hi! I'm Noro,  I'm here to help you with quick doubts and questions.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])

      // Show waving animation
      setIsWaving(true)
      setTimeout(() => {
        setIsWaving(false)
        // Add "How can I help you?" message after waving
        const helpMessage: Message = {
          id: "help-offer",
          content: "How can I help you ? ",
          isUser: false,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, helpMessage])
      }, 2000)
    }
  }, [isOpen, messages.length])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment! ",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    // Re-add welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      content:
        "Hi! I'm Noro, I'm here to help you with quick doubts and questions.",
      isUser: false,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])

    // Show waving animation again
    setIsWaving(true)
    setTimeout(() => {
      setIsWaving(false)
      // Add "How can I help you?" message after waving
      const helpMessage: Message = {
        id: "help-offer",
        content: "How can I help you today? 😊",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, helpMessage])
    }, 2000)
  }

  // Don't render on quiz pages
  if (isQuizPage) {
    return null
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className={cn(
            "rounded-full h-35 w-35 shadow-lg transition-all duration-300 hover:scale-110 p-0 overflow-hidden",
            isOpen
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-transparent hover:bg-transparent border-none shadow-none",
          )}
        >
          {isOpen ? (
            <X className="h-18 w-18 text-white" />
          ) : (
            <div className="h-32 w-32 relative">
              <Image
                src="https://th.bing.com/th/id/R.4733eb0ca9278d4f0af1c81a735fdcab?rik=rASlKMEDCuhDVQ&riu=http%3a%2f%2fwww.naomi-survey.com%2ftheme%2fimg%2fchatbot1.gif&ehk=7VR7VJi3R%2b%2fc3My%2bllwW560VB1YOtn5eauRiVfI8SdA%3d&risl=&pid=ImgRaw&r=0"
                alt="Chat with Noro"
                fill
                className="object-cover"
              />
            </div>
          )}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-40 w-80 sm:w-96 max-w-[calc(100vw-2rem)]">
          <Card className="shadow-2xl border-2 overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-primary/90 to-primary text-primary-foreground rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 border-2 border-primary-foreground/20 ring-2 ring-primary-foreground/10">
                    <AvatarImage
                      src="https://raw.githubusercontent.com/yadhx/images/refs/heads/main/noro.jpg"
                      alt="Noro"
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary-foreground text-primary font-bold">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg font-bold">Noro</CardTitle>
                    <p className="text-xs text-primary-foreground/80">CETMCA26 Assistant</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearChat}
                    className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
                    title="Clear chat"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Privacy Notice */}
              <div className="px-4 py-2 bg-muted/50 border-b">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Private chat - No conversations are stored
                </p>
              </div>

              {/* Messages */}
              <ScrollArea className="h-80 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex gap-3 max-w-full", message.isUser ? "justify-end" : "justify-start")}
                    >
                      {!message.isUser && (
                        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                          <AvatarImage
                            src="https://raw.githubusercontent.com/yadhx/images/refs/heads/main/noro.jpg"
                            alt="Noro"
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div
                        className={cn(
                          "rounded-lg px-3 py-2 max-w-[85%] break-words",
                          message.isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted",
                        )}
                      >
                           <div
                          className="text-sm"
                          dangerouslySetInnerHTML={{
                            __html: message.isUser ? message.content : renderMarkdown(message.content),
                          }}
                        />
                        <p
                          className={cn(
                            "text-xs mt-1 opacity-70",
                            message.isUser ? "text-primary-foreground/70" : "text-muted-foreground",
                          )}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {message.isUser && (
                        <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                          <AvatarFallback className="bg-secondary">
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}

                 

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage
                          src="https://raw.githubusercontent.com/yadhx/images/refs/heads/main/noro.jpg"
                          alt="Noro"
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">Thinking</span>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Noro anything..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="flex-shrink-0 bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Conversations are not saved</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
