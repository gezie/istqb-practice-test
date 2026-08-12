import Link from "next/link"
import { getQuizQuestions } from "@/app/actions/questions"
import { Quiz } from "@/components/quiz"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Inbox } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function TestPage() {
  const questions = await getQuizQuestions(40)

  if (questions.length === 0) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Inbox className="size-7" />
        </div>
        <div className="max-w-sm">
          <h1 className="text-xl font-semibold text-foreground">No questions available</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The question bank is empty. Add some questions before starting a practice test.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Home
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/add">Add a question</Link>
          </Button>
        </div>
      </main>
    )
  }

  return <Quiz questions={questions} />
}
