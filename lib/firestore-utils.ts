import { collection, getDocs } from "firebase/firestore"
import { db } from "./firebase"

export async function getAllProjects(): Promise<ProjectData[]> {
  const usersRef = collection(db, "studentProjects")
  const snapshot = await getDocs(usersRef)
  const projects: ProjectData[] = []

  snapshot.forEach(docSnap => {
    const data = docSnap.data()
    if (data.projects?.length) {
      const user = data.user || {} // If you save user info here
      data.projects.forEach((proj: any) => {
        projects.push({
          ...proj,
          userAvatar: user.avatar || null,
          userId: docSnap.id,
        })
      })
    }
  })
  return projects
}
