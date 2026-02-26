import { Suspense } from "react"
import { StudentsList } from "@/components/students-list"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Students | CETMCA26",
  description: "Browse through the portfolios of CETMCA26 students",
}

export default function StudentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Members</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Browse through the portfolios of members of this community and learn about their skills, projects, and experiences.
        </p>
        {/* Portfolio Creation Guidance */}
        <div className="mt-6 bg-cyan-50 dark:bg-zinc-800 rounded-xl p-4 max-w-xl mx-auto shadow flex flex-col items-center border border-cyan-200 dark:border-cyan-700">
          <span className="text-cyan-700 dark:text-cyan-400 font-semibold text-lg">
            Want your portfolio displayed here?
          </span>
          <ol className="list-decimal ml-5 mt-2 text-base text-zinc-700 dark:text-zinc-300 text-left">
            <li>
              <b>Create an account</b> at{" "}
              <a href="https://cetmca26.live/crash-course" className="underline text-cyan-600 dark:text-cyan-300" target="_blank" rel="noopener">
                cetmca26.live/register
              </a>
            </li>
            <li>
              Go to <b>Portfolio</b> in your dashboard.
            </li>
            <li>
              Click <b>Create</b> to build and publish your portfolio.
            </li>
          </ol>
        </div>
      </div>

      <Suspense fallback={<StudentsListSkeleton />}>
        <StudentsList />
      </Suspense>
    </div>
  )
}

function StudentsListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-32 w-32 rounded-full mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
    </div>
  )
}
