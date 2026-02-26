export interface Job {
  id: string
  name: string
  description: string
  company: string
  lastDate: string // e.g., "2025-12-31"
  skills: string[] // e.g., ["React", "Node.js", "Firebase"]
  package: string // e.g., "5 LPA - 8 LPA"
  applyLink: string
  createdAt: any // Firebase Timestamp
}
