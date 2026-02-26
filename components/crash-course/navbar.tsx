"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCrashCourseAuth } from "@/contexts/crash-course-auth-context"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  User,
  Home,
  FileText,
  Briefcase,
  Code2,
  Menu,
  BookOpen,
  FolderKanban,
  LayoutDashboard,
  Grid,
  ChevronUp,
  ChevronDown,
  List,
} from "lucide-react"
import { cn } from "@/lib/utils"
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
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

// Navigation links for all platforms
const navLinks = [
  { name: "Home", path: "/crash-course/dashboard", icon: <Home className="h-5 w-5" /> },
  { name: "Profile", path: "/crash-course/dashboard/profile", icon: <User className="h-5 w-5" /> },
  { name: "Quiz", path: "/crash-course/dashboard/quiz", icon: <BookOpen className="h-5 w-5" /> },
  { name: "DSA Sheet", path: "/crash-course/dashboard/dsa", icon: <Code2 className="h-5 w-5" /> },
  { name: "Study Materials", path: "/crash-course/dashboard/materials", icon: <FileText className="h-5 w-5" /> },
  { name: "Jobs", path: "/crash-course/dashboard/jobs", icon: <Briefcase className="h-5 w-5" /> },
  { name: "Portfolio", path: "/crash-course/dashboard/portfolio/edit", icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: "Projects", path: "/crash-course/dashboard/projects", icon: <FolderKanban className="h-5 w-5" /> },
  { name: "Blogs", path: "/crash-course/dashboard/blog", icon: <BookOpen className="h-5 w-5" /> },
]

// Mobile bottom bar links (short + sidebar trigger)
const mobileNavLinks = [
  { name: "Home", path: "/crash-course/dashboard", icon: <Home className="h-6 w-6" /> },
  { name: "Quiz", path: "/crash-course/dashboard/quiz", icon: <BookOpen className="h-6 w-6" /> },
  { name: "DSA", path: "/crash-course/dashboard/dsa", icon: <Code2 className="h-6 w-6" /> },
]

export function SidebarNav({ isMobile = false }) {
  const pathname = usePathname()
  const LinkComponent = isMobile ? SheetClose : "div"

  return (
    <nav className="flex flex-col space-y-1 px-2 pt-1">
      {navLinks.map((link) => (
        <LinkComponent key={link.path} asChild={isMobile}>
          <Link
            href={link.path}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-3 transition-all group",
              pathname === link.path
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isMobile
                ? "text-[1.1rem] font-medium"
                : "h-12 justify-center lg:group-hover:w-full"
            )}
          >
            <span className="flex-shrink-0">{link.icon}</span>
            <span
              className={cn(
                isMobile ? "block" : "hidden lg:group-hover:block whitespace-nowrap"
              )}
            >{link.name}</span>
          </Link>
        </LinkComponent>
      ))}
    </nav>
  )
}

export function CrashCourseNavbar() {
  const { user, logOut } = useCrashCourseAuth()
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleLogout = async () => {
    try { await logOut() } catch (error) { console.error("Error logging out:", error) }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-20 lg:flex-col lg:border-r lg:bg-background lg:transition-all lg:duration-300 lg:hover:w-56 group">
        <div className="flex h-16 flex-shrink-0 items-center justify-center">
          <span className="hidden text-xl font-bold text-primary group-hover:block">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold dark:text-white text-black">CETMCA <span style={{ color: "#28cee3" }}>26</span></span>
            </Link>
          </span>
          <span className="block group-hover:hidden"><span style={{ color: "#28cee3" }}>26</span></span>
        </div>
        <div className="mt-4 flex-grow">
          <SidebarNav />
        </div>
        <div className="mt-auto p-4 flex justify-center group-hover:justify-start">
          <ThemeToggle />
        </div>
      </aside>

      {/* Top Navbar/Bar with hamburger menu */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur px-4 sm:px-6 lg:pl-20 lg:pr-8">
        {/* Hamburger: mobile only */}
        <div className="lg:hidden flex items-center">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle Menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:w-80 flex flex-col">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-bold">
                          <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold dark:text-white text-black">CETMCA <span style={{ color: "#28cee3" }}>26</span></span>
            </Link>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex-grow">
                <SidebarNav isMobile={true} />
              </div>
              <div className="mt-auto pb-4">
                <ThemeToggle />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Page Title */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-xl font-bold whitespace-nowrap ml-2 lg:ml-0 p-3">
            Dashboard
          </h1>
        </div>

        {/* Right: Avatar & Logout */}
        <div className="flex-shrink-0">
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
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed z-50 bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-t flex md:hidden justify-around py-1">
        {/* Tabs: Home, Quiz, DSA, More */}
        {mobileNavLinks.map(link => (
          <Link key={link.path}
                href={link.path}
                className={cn("flex flex-col items-center justify-center px-4 py-1", "text-xs text-gray-700 dark:text-gray-100 hover:text-primary")}>
            {link.icon}
            <span className="mt-0.5 font-semibold">{link.name}</span>
          </Link>
        ))}
        {/* Sheet/Sidebar trigger */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="More"
          onClick={() => setSheetOpen(true)}
          className="flex flex-col items-center justify-center px-3 py-1"
        >
          <Grid className="h-6 w-6" />
          <span className="mt-0.5 font-semibold">More</span>
        </Button>
      </nav>
      {/* Bottom padding/spacer for mobile nav */}
      <div className="md:hidden h-14" />
    </>
  )
}
