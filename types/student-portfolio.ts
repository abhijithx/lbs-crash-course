export interface Experience {
  id: string
  company: string
  role: string
  duration: string
  description: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  duration: string
  description: string
}

export interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  link: string
}

export interface StudentPortfolioData {
  id: string // Firebase Auth UID
  name: string
  avatar: string
  cv: string
  role: string
  skills: string[]
  bio: string
  github: string
  linkedin: string
  email: string
  experience: Experience[]
  education: Education[]
  projects: Project[]
  updatedAt?: any // Firebase Timestamp
}
