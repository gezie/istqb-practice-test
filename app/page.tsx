import Link from "next/link"
import { getQuestionCount } from "@/app/actions/questions"
import { Button } from "@/components/ui/button"
import { GraduationCap, PlayCircle, PlusCircle, Database, CheckCircle2, Sparkles } from "lucide-react"

export default async function HomePage() {
  const count = await getQuestionCount()

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* subtle grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:44px_44px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="w-full max-w-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            Free ISTQB exam prep
          </div>

          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <GraduationCap className="size-8" />
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            ISTQB Foundation Level Practice
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Sharpen your knowledge with real exam-style questions. Get instant feedback and clear
            explanations, just like a driving-school practice test.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-14 flex-1 text-base">
            <Link href="/test">
              <PlayCircle className="size-5" />
              Start Practice Test
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 flex-1 bg-transparent text-base">
            <Link href="/admin/add">
              <PlusCircle className="size-5" />
              Add New Question
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Database className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none text-foreground">{count}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">Questions in database</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success-muted text-success">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold leading-none text-foreground">65%</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">Passing score</p>
            </div>
          </div>
        </div>

        {count === 0 && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No questions yet.{" "}
            <Link href="/admin/add" className="font-medium text-primary underline-offset-4 hover:underline">
              Add your first question
            </Link>{" "}
            to get started.
          </p>
        )}
      </div>
    </main>
  )
}
