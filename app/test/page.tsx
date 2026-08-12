import Link from "next/link"
import { getAllQuestions, getFullExamQuestions, getQuestionsByChapters } from "@/app/actions/questions"
import { Quiz } from "@/components/quiz"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Inbox } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function TestPage({ searchParams }: { searchParams: Promise<{mode?: string;chapters?: string}> }) {
  const params = await searchParams
  const mode=params.mode||"full"
  const questions = mode === "chapters" ? await getQuestionsByChapters((params.chapters||"1").split(",").map(Number)) : mode==="mistakes" ? await getAllQuestions() : await getFullExamQuestions()

  if (questions.length === 0) {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Inbox className="size-7" />
        </div>
        <div className="max-w-sm">
          <h1 className="text-xl font-semibold text-foreground">Nejsou dostupné žádné otázky</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Databáze je prázdná. Před spuštěním testu přidejte otázky.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Domů
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/add">Přidat otázku</Link>
          </Button>
        </div>
      </main>
    )
  }

  return <Quiz questions={questions} mode={mode} />
}
