export interface DSAQuestion {
  id: number
  name: string
  difficulty: "Easy" | "Medium" | "Hard"
  lcLink: string
  youtubeLink?: string
  isCompleted: boolean
  topic: string
}

export interface DSAProgress {
  userId: string
  completedQuestions: number[]
  lastUpdated: string
}
