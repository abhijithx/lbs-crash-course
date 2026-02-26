"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Menu, User, LogOut, Home, BookOpen, FolderKanban, List } from "lucide-react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet"

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
  { name: "Blogs", path: "/blogs" },
  { name: "Members", path: "/students" },
  { name: "Contact", path: "/contact" },
  { name: "Feedbacks", path: "/ccfeedback" },
  { name: "Dashboard", path: "/crash-course/dashboard" },
]

const mobileTabs = [
  { name: "Home", path: "/", icon: <Home className="h-6 w-6" /> },
  { name: "Projects", path: "/projects", icon: <FolderKanban className="h-6 w-6" /> },
  { name: "Blogs", path: "/blogs", icon: <BookOpen className="h-6 w-6" /> },
]

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isStudentPage = pathname.startsWith("/students/");
  if (isStudentPage) return null;

  const handleLogout = async () => { try { await logout() } catch (error) { console.error("Error logging out:", error) } }

  return (
    <>
      {/* Top bar (desktop & mobile) */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-background"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold dark:text-white text-black">CETMCA <span style={{ color: '#28cee3' }}>26</span></span>
              </Link>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    "hover:text-[#28cee3]",
                    pathname === link.path ? "text-[#28cee3]" : "text-muted-foreground",
                  )}
                >{link.name}</Link>
              ))}
              <ThemeToggle />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.email && <p className="font-medium text-sm text-muted-foreground">{user.email}</p>}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/crash-course">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
              )}
            </nav>

            {/* Mobile: top-right (theme/avatar/hamburger) */}
            <div className="flex items-center md:hidden space-x-2">
              <ThemeToggle />
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full" aria-label="User menu">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.email && <p className="font-medium text-sm text-muted-foreground">{user.email}</p>}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/quiz" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Quizzes</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE: Sidebar Sheet from left */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 pt-6 sm:w-80 flex flex-col h-screen">
            <SheetHeader>
              <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col space-y-4 mt-4 mb-8">
              {navLinks.map((link) => (
                <SheetClose asChild key={link.path}>
                  <Link
                    href={link.path}
                    className={cn(
                      "text-base font-semibold transition-colors py-2 px-2 rounded hover:bg-accent",
                      pathname === link.path ? "text-primary bg-accent" : "text-muted-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                </SheetClose>
              ))}
              {!user && (
                <SheetClose asChild>
                  <Link href="/crash-course">
                    <Button className="w-full my-2">Sign In</Button>
                  </Link>
                </SheetClose>
              )}
              {user && (
                <Button
                  variant="destructive"
                  className="w-full flex items-center justify-center gap-2 mt-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              )}
            </nav>
            <ThemeToggle />
          </SheetContent>
        </Sheet>
      </header>

      {/* MOBILE: Bottom nav bar - always visible */}
      <nav className="fixed z-50 bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex md:hidden justify-around py-1 shadow-t-sm">
        {mobileTabs.map(tab => (
          <Link key={tab.path}
            href={tab.path}
            className={cn("flex flex-col items-center justify-center px-4 py-1 text-xs font-semibold",
              pathname === tab.path ? "text-primary" : "text-gray-700 dark:text-gray-100 hover:text-primary"
            )}>
            {tab.icon}
            <span className="mt-0.5">{tab.name}</span>
          </Link>
        ))}
        {/* Sidebar/Sheet trigger */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Menu"
          onClick={() => setSidebarOpen(true)}
          className="flex flex-col items-center justify-center px-4 py-1"
        >
          <List className="h-6 w-6" />
          <span className="mt-0.5 font-semibold">Menu</span>
        </Button>
      </nav>
      {/* Spacer for mobile nav */}
      <div className="md:hidden h-14" />
    </>
  )
}
