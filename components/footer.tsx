"use client";
import Link from "next/link"
import { Github, Mail, MapPin } from "lucide-react"
import { usePathname } from "next/navigation"; // Import the hook


export default function Footer() {
  const pathname = usePathname(); // Get the current path

  // Check if the current path starts with /students/
  const isStudentPage = pathname.startsWith("/students/");

   if (isStudentPage) {
    return null;
  }
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h1 className="text-4xl font-semibold mb-4">MCA <span style={{ color: '#28cee3' }}>26</span></h1>
            <p className="text-sm text-muted-foreground">
              Official website for the CETMCA26 Open Source Community.
            </p>
             {/* User Stats Section */}
          <div className="mt-6 inline-flex items-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full px-6 py-3 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                <span className="text-1xl font-bold text-blue-600 dark:text-blue-400">406</span> Users 
              </span>
            </div>
          </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/projects" className="text-muted-foreground hover:text-primary transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/contributors" className="text-muted-foreground hover:text-primary transition-colors">
                  Contributors
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-muted-foreground hover:text-primary transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/admission" className="text-muted-foreground hover:text-primary transition-colors">
                  Admission
                </Link>
              </li>
              {/* <li>
                <Link href="/students" className="text-muted-foreground hover:text-primary transition-colors">
                  Students
                </Link>
              </li> */}
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span> Kerala, India</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:cetmca26@example.com" className="hover:text-primary transition-colors">
                  cetmca26@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Github className="h-4 w-4" />
                <a
                  href="https://github.com/cetmca26"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  github.com/cetmca26
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()}cetmca26. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
