"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import type { Question } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Check, X, ArrowLeft, ArrowRight, RotateCcw, Lightbulb, Trophy } from "lucide-react"

const PASS_THRESHOLD = 65
type Letter = "A" | "B" | "C" | "D"

export function Quiz({ questions }: { questions: Question[] }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<Letter | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const total = questions.length
  const question = questions[current]

  const options = useMemo(
    () => {
      const shuffled = [
        { letter: "A" as Letter, text: question.optionA },
        { letter: "B" as Letter, text: question.optionB },
        { letter: "C" as Letter, text: question.optionC },
        { letter: "D" as Letter, text: question.optionD },
      ]
      for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]] }
      return shuffled
    },
    [question],
  )

  const answered = selected !== null
  const correctLetter = question.correctAnswer.toUpperCase() as Letter

  function handleSelect(letter: Letter) {
    if (answered) return
    setSelected(letter)
    if (letter === correctLetter) setCorrectCount((c) => c + 1)
  }

  function handleNext() {
    if (current + 1 >= total) {
      setFinished(true)
      return
    }
    setCurrent((i) => i + 1)
    setSelected(null)
  }

  function handleRestart() {
    setCurrent(0)
    setSelected(null)
    setCorrectCount(0)
    setFinished(false)
  }

  if (finished) {
    const percentage = Math.round((correctCount / total) * 100)
    const passed = percentage >= PASS_THRESHOLD

    return (
      <main className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div
            className={cn(
              "mx-auto mb-6 flex size-20 items-center justify-center rounded-full",
              passed ? "bg-success-muted text-success" : "bg-error-muted text-error",
            )}
          >
            <Trophy className="size-10" />
          </div>

          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Váš výsledek</p>
          <p className="mt-1 text-6xl font-bold tracking-tight text-foreground">{percentage}%</p>
          <p
            className={cn(
              "mt-3 text-lg font-semibold",
              passed ? "text-success" : "text-error",
            )}
          >
            {passed ? "Úspěšně splněno" : "Test nesplněn"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Správně jste odpověděli na <span className="font-semibold text-foreground">{correctCount}</span> z{" "}
            <span className="font-semibold text-foreground">{total}</span> otázek.
            {!passed && ` Pro úspěch potřebujete ${PASS_THRESHOLD} %.`}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleRestart} size="lg" className="flex-1">
              <RotateCcw className="size-4" />
              Zkusit znovu
            </Button>
            <Button asChild size="lg" variant="outline" className="flex-1 bg-transparent">
              <Link href="/">
                <ArrowLeft className="size-4" />
                Zpět domů
              </Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const progress = (current / total) * 100

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-4 py-6 sm:py-10">
      {/* Header / progress */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="-ml-2 h-8 text-muted-foreground">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Ukončit
            </Link>
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Otázka {current + 1} z {total}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <p className="mb-2 text-sm font-semibold text-primary">{question.category}</p>
      <div className="flex flex-1 flex-col">
        <h1 className="text-balance text-xl font-semibold leading-snug text-foreground sm:text-2xl">
          {question.questionText}
        </h1>

        <div className="mt-6 flex flex-col gap-3" role="radiogroup" aria-label="Možnosti odpovědi">
          {options.map((opt, index) => {
            const isCorrect = opt.letter === correctLetter
            const isSelected = opt.letter === selected

            const state = !answered
              ? "idle"
              : isCorrect
                ? "correct"
                : isSelected
                  ? "wrong"
                  : "dim"

            return (
              <button
                key={opt.letter}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={answered}
                onClick={() => handleSelect(opt.letter)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  state === "idle" &&
                    "border-border bg-card hover:border-primary/50 hover:bg-accent/50 cursor-pointer",
                  state === "correct" && "border-success bg-success-muted",
                  state === "wrong" && "border-error bg-error-muted",
                  state === "dim" && "border-border bg-card opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
                    state === "idle" && "bg-secondary text-secondary-foreground",
                    state === "correct" && "bg-success text-success-foreground",
                    state === "wrong" && "bg-error text-error-foreground",
                    state === "dim" && "bg-secondary text-secondary-foreground",
                  )}
                >
                  {state === "correct" ? (
                    <Check className="size-4" />
                  ) : state === "wrong" ? (
                    <X className="size-4" />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </span>
                <span
                  className={cn(
                    "text-pretty text-sm sm:text-base",
                    state === "correct" && "font-medium text-success",
                    state === "wrong" && "font-medium text-error",
                    (state === "idle" || state === "dim") && "text-foreground",
                  )}
                >
                  {opt.text}
                </span>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <div className="mt-5 rounded-xl border border-border bg-accent/40 p-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {selected === correctLetter ? "Správně!" : "Vysvětlení"}
              </span>
            </div>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
              {question.explanation
                ? question.explanation
                : "Tato možnost odpovídá principům sylabu ISTQB."}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 mt-6 bg-gradient-to-t from-background via-background to-transparent pt-4">
        <Button onClick={handleNext} disabled={!answered} size="lg" className="w-full">
          {current + 1 >= total ? "Dokončit test" : "Další otázka"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </main>
  )
}
