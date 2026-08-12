import Link from "next/link"
import { AddQuestionForm } from "@/components/add-question-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AddQuestionPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-4 py-6 sm:py-10">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-8 text-muted-foreground">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </Button>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Add a new question
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new multiple-choice question for the ISTQB practice bank.
        </p>
      </div>

      <AddQuestionForm />
    </main>
  )
}
