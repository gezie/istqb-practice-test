"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Flag, Lightbulb, RotateCcw, Trophy, XCircle } from "lucide-react"
import type { Question } from "@/lib/db/schema"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getChapterName } from "@/lib/chapters"
import { cn } from "@/lib/utils"

type Answer = number[]
type ShuffledOption = { text: string; originalIndex: number }
const same = (first: Answer, second: Answer) => [...first].sort((a, b) => a - b).join(",") === [...second].sort((a, b) => a - b).join(",")

function shuffleOptions(question: Question): ShuffledOption[] {
  const options = question.options.map((text, originalIndex) => ({ text, originalIndex }))
  for (let index = options.length - 1; index > 0; index--) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[options[index], options[target]] = [options[target], options[index]]
  }
  return options
}

export function Quiz({ questions, mode, immediateFeedback }: { questions: Question[]; mode: string; immediateFeedback: boolean }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [flags, setFlags] = useState<number[]>([])
  const [screen, setScreen] = useState<"quiz" | "review" | "result">("quiz")
  const [seconds, setSeconds] = useState(3600)
  const [shuffled] = useState<Record<number, ShuffledOption[]>>(() => Object.fromEntries(questions.map(question => [question.id, shuffleOptions(question)])))
  const submit = useCallback(() => setScreen("result"), [])

  useEffect(() => {
    if (mode !== "exam" || screen === "result") return
    const timer = window.setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [mode, screen])
  useEffect(() => { if (mode === "exam" && seconds === 0) submit() }, [mode, seconds, submit])

  const score = questions.filter(question => same(answers[question.id] || [], question.correctIndices)).length
  const percent = questions.length ? Math.round(score / questions.length * 100) : 0

  if (screen === "result") return <main className="mx-auto min-h-svh max-w-3xl px-4 py-12"><section className="text-center"><Trophy className={cn("mx-auto size-16", percent >= 65 ? "text-success" : "text-error")}/><p className="mt-5 text-sm font-semibold uppercase text-muted-foreground">Váš konečný výsledek</p><h1 className="mt-1 text-6xl font-bold">{percent} %</h1><p className={cn("mt-3 text-xl font-semibold", percent >= 65 ? "text-success" : "text-error")}>{percent >= 65 ? "Úspěšně splněno" : "Test nebyl splněn"}</p><p className="mt-2 text-muted-foreground">Správně {score} z {questions.length}. Hranice úspěšnosti je 65 %.</p></section><h2 className="mt-10 text-2xl font-bold">Kontrola všech odpovědí</h2><div className="mt-4 space-y-4">{questions.map((question, index) => <article key={question.id} className="rounded-xl border bg-card p-5"><p className="whitespace-pre-wrap font-semibold">{index + 1}. {question.text}</p><p className={cn("mt-2 text-sm font-medium", same(answers[question.id] || [], question.correctIndices) ? "text-success" : "text-error")}>{same(answers[question.id] || [], question.correctIndices) ? "Správná odpověď" : "Nesprávná odpověď"}</p><div className="mt-3 flex gap-2 text-sm text-muted-foreground"><Lightbulb className="size-4 shrink-0 text-primary"/><p>{question.explanation}</p></div></article>)}</div><div className="mt-8 flex gap-3"><Button onClick={() => location.reload()}><RotateCcw/>Zkusit znovu</Button><Button asChild variant="outline"><Link href="/">Zpět domů</Link></Button></div></main>

  if (screen === "review") return <main className="mx-auto min-h-svh max-w-3xl px-4 py-12"><h1 className="text-3xl font-bold">Kontrola před odevzdáním</h1><p className="mt-2 text-muted-foreground">Zkontrolujte zodpovězené, nezodpovězené a označené otázky. Správné odpovědi a vysvětlení se zobrazí až po odevzdání.</p><div className="mt-6 flex flex-wrap gap-4 text-sm"><span><i className="mr-2 inline-block size-3 bg-primary"/>Zodpovězeno</span><span><i className="mr-2 inline-block size-3 bg-muted"/>Nezodpovězeno</span><span><i className="mr-2 inline-block size-3 bg-yellow-400"/>Označeno k revizi</span></div><div className="mt-6 grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10">{questions.map((question, index) => <button key={question.id} onClick={() => { setCurrent(index); setScreen("quiz") }} className={cn("aspect-square rounded-md border text-sm font-bold", flags.includes(question.id) ? "border-yellow-500 bg-yellow-300 text-yellow-950" : answers[question.id]?.length ? "border-primary bg-primary text-primary-foreground" : "bg-muted")}>{index + 1}</button>)}</div><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button variant="outline" onClick={() => setScreen("quiz")}><ArrowLeft/>Vrátit se k otázkám</Button><Button onClick={submit}>Odevzdat test</Button></div></main>

  const question = questions[current]
  const selected = answers[question.id] || []
  const required = question.correctIndices.length
  const feedbackVisible = immediateFeedback && selected.length === required
  const correct = feedbackVisible && same(selected, question.correctIndices)
  const choose = (index: number) => {
    if (feedbackVisible) return
    setAnswers(value => ({ ...value, [question.id]: question.type === "single" ? [index] : selected.includes(index) ? selected.filter(item => item !== index) : selected.length < required ? [...selected, index] : selected }))
  }
  const next = () => current < questions.length - 1 ? setCurrent(index => index + 1) : immediateFeedback ? submit() : setScreen("review")

  return <main className="mx-auto flex min-h-svh max-w-3xl flex-col px-4 py-6"><header className="mb-6"><div className="mb-3 flex items-center justify-between gap-3"><Button asChild variant="ghost" size="sm"><Link href="/"><ArrowLeft/>Ukončit</Link></Button>{mode === "exam" && <span className={cn("flex items-center gap-2 font-mono font-bold", seconds < 300 && "text-error")}><Clock3 className="size-4"/>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>}<span className="text-sm text-muted-foreground">Otázka {current + 1} z {questions.length}</span></div><Progress value={(current + 1) / questions.length * 100}/></header><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-primary">{getChapterName(question.categoryId)}</p><h1 className="mt-2 whitespace-pre-wrap text-xl font-semibold leading-relaxed sm:text-2xl">{question.text}</h1><p className="mt-2 text-sm text-muted-foreground">{question.type === "multiple" ? `Vyberte přesně ${required} správné odpovědi.` : "Vyberte právě jednu správnou odpověď."}</p></div>{mode === "exam" && <Button variant={flags.includes(question.id) ? "default" : "outline"} size="sm" onClick={() => setFlags(value => value.includes(question.id) ? value.filter(id => id !== question.id) : [...value, question.id])}><Flag/><span className="hidden sm:inline">Označit k revizi</span></Button>}</div>
    <div className="mt-6 space-y-3">{shuffled[question.id].map((option, displayIndex) => { const isSelected = selected.includes(option.originalIndex); const isCorrect = question.correctIndices.includes(option.originalIndex); return <label key={option.originalIndex} className={cn("flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border-2 bg-card p-4 transition-colors", !feedbackVisible && isSelected && "border-primary bg-accent", feedbackVisible && isCorrect && "border-success bg-success/10", feedbackVisible && isSelected && !isCorrect && "border-error bg-error/10", feedbackVisible && "cursor-default")}><input className="mt-1 size-4 shrink-0 accent-primary" type={question.type === "single" ? "radio" : "checkbox"} name={`otazka-${question.id}`} checked={isSelected} disabled={feedbackVisible} onChange={() => choose(option.originalIndex)}/><span className="flex size-7 shrink-0 items-center justify-center rounded bg-muted text-sm font-bold">{String.fromCharCode(65 + displayIndex)}</span><span className="min-w-0 whitespace-pre-wrap break-words leading-relaxed">{option.text}</span></label>})}</div>
    {feedbackVisible && <aside role="status" className={cn("mt-5 rounded-xl border p-4", correct ? "border-success bg-success/10" : "border-error bg-error/10")}><div className="flex items-center gap-2 font-bold">{correct ? <CheckCircle2 className="size-5 text-success"/> : <XCircle className="size-5 text-error"/>}{correct ? "Správně" : "Nesprávně"}</div><div className="mt-2 flex gap-2 text-sm"><Lightbulb className="size-4 shrink-0 text-primary"/><p>{question.explanation}</p></div></aside>}
    <footer className="mt-auto flex justify-between gap-3 pt-8"><Button variant="outline" disabled={!current || immediateFeedback} onClick={() => setCurrent(index => index - 1)}><ArrowLeft/>Předchozí</Button><Button disabled={immediateFeedback && !feedbackVisible} onClick={next}>{current < questions.length - 1 ? "Další otázka" : immediateFeedback ? "Zobrazit výsledek" : "Zkontrolovat test"}<ArrowRight/></Button></footer></main>
}
