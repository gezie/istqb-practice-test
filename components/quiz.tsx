"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, Flag, Lightbulb, LogOut, RotateCcw, Trophy, XCircle } from "lucide-react"
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
  const endTest = () => { if (window.confirm("Opravdu chcete ukončit test? Vaše odpovědi nebudou uloženy.")) window.location.href = "/" }

  useEffect(() => {
    if (mode !== "exam" || screen === "result") return
    const timer = window.setInterval(() => setSeconds(value => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [mode, screen])
  useEffect(() => { if (mode === "exam" && seconds === 0) submit() }, [mode, seconds, submit])

  const score = questions.filter(question => same(answers[question.id] || [], question.correctIndices)).length
  const percent = questions.length ? Math.round(score / questions.length * 100) : 0

  const question = questions[current]
  const selected = answers[question.id] || []
  const required = question.correctIndices.length
  const feedbackVisible = immediateFeedback && selected.length === required
  const correct = feedbackVisible && same(selected, question.correctIndices)
  const choose = (index: number) => {
    if (feedbackVisible) return
    setAnswers(value => ({ ...value, [question.id]: question.type !== "multiple" ? [index] : selected.includes(index) ? selected.filter(item => item !== index) : selected.length < required ? [...selected, index] : selected }))
  }
  const canContinue = selected.length === required
  const next = useCallback(() => {
    if (!canContinue) return
    if (current < questions.length - 1) { setCurrent(index => index + 1); window.scrollTo({ top: 0, behavior: "smooth" }) }
    else if (immediateFeedback) submit()
    else setScreen("review")
  }, [canContinue, current, immediateFeedback, questions.length, submit])

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (screen !== "quiz" || event.altKey || event.ctrlKey || event.metaKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      const keys = ["1", "2", "3", "4", "a", "b", "c", "d"]
      const keyIndex = keys.indexOf(event.key.toLowerCase())
      if (keyIndex >= 0) { event.preventDefault(); const displayIndex = keyIndex % 4; const option = shuffled[question.id]?.[displayIndex]; if (option) choose(option.originalIndex) }
      if (event.key === "Enter" && canContinue) { event.preventDefault(); next() }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [canContinue, next, question.id, screen, shuffled, selected, feedbackVisible])

  if (screen === "result") return <main className="mx-auto min-h-svh max-w-3xl px-4 py-12"><section className="text-center"><Trophy className={cn("mx-auto size-16", percent >= 65 ? "text-success" : "text-error")}/><p className="mt-5 text-sm font-semibold uppercase text-muted-foreground">Váš konečný výsledek</p><h1 className="mt-1 text-6xl font-bold">{percent} %</h1><p className={cn("mt-3 text-xl font-semibold", percent >= 65 ? "text-success" : "text-error")}>{percent >= 65 ? "Úspěšně splněno" : "Test nebyl splněn"}</p><p className="mt-2 text-muted-foreground">Správně {score} z {questions.length}. Hranice úspěšnosti je 65 %.</p></section><h2 className="mt-10 text-2xl font-bold">Kontrola všech odpovědí</h2><div className="mt-4 space-y-4">{questions.map((question, index) => <article key={question.id} className="rounded-xl border bg-card p-5"><p className="whitespace-pre-wrap font-semibold">{index + 1}. {question.text}</p><p className={cn("mt-2 text-sm font-medium", same(answers[question.id] || [], question.correctIndices) ? "text-success" : "text-error")}>{same(answers[question.id] || [], question.correctIndices) ? "Správná odpověď" : "Nesprávná odpověď"}</p><div className="mt-3 flex gap-2 text-sm text-muted-foreground"><Lightbulb className="size-4 shrink-0 text-primary"/><p>{question.explanation}</p></div></article>)}</div><div className="mt-8 flex gap-3"><Button onClick={() => location.reload()}><RotateCcw/>Zkusit znovu</Button><Button asChild variant="outline"><Link href="/">Zpět domů</Link></Button></div></main>

  if (screen === "review") return <main className="mx-auto min-h-svh max-w-3xl px-4 py-12"><h1 className="text-3xl font-bold">Kontrola před odevzdáním</h1><p className="mt-2 text-muted-foreground">Zkontrolujte zodpovězené, nezodpovězené a označené otázky. Správné odpovědi a vysvětlení se zobrazí až po odevzdání.</p><div className="mt-6 flex flex-wrap gap-4 text-sm"><span><i className="mr-2 inline-block size-3 bg-primary"/>Zodpovězeno</span><span><i className="mr-2 inline-block size-3 bg-muted"/>Nezodpovězeno</span><span><i className="mr-2 inline-block size-3 bg-yellow-400"/>Označeno k revizi</span></div><div className="mt-6 grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10">{questions.map((question, index) => <button key={question.id} onClick={() => { setCurrent(index); setScreen("quiz") }} className={cn("aspect-square rounded-md border text-sm font-bold", flags.includes(question.id) ? "border-yellow-500 bg-yellow-300 text-yellow-950" : answers[question.id]?.length ? "border-primary bg-primary text-primary-foreground" : "bg-muted")}>{index + 1}</button>)}</div><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button variant="outline" onClick={() => setScreen("quiz")}><ArrowLeft/>Vrátit se k otázkám</Button><Button onClick={submit}>Odevzdat test</Button></div></main>


  return <main className="mx-auto flex min-h-svh max-w-3xl flex-col px-4 py-6"><header className="sticky top-0 z-20 -mx-4 mb-6 border-b bg-background/95 px-4 py-3 backdrop-blur"><div className="mb-3 flex items-center justify-between gap-3"><Button variant="ghost" size="sm" className="min-h-11" onClick={endTest}><LogOut/>Ukončit test</Button>{mode === "exam" && <span className={cn("flex items-center gap-2 font-mono font-bold", seconds < 300 && "text-error")}><Clock3 className="size-4"/>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>}<span className="text-sm text-muted-foreground">Otázka {current + 1} z {questions.length}</span></div><Progress value={(current + 1) / questions.length * 100}/></header><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-primary">{getChapterName(question.categoryId)}</p><h1 className="mt-2 whitespace-pre-wrap text-xl font-semibold leading-relaxed sm:text-2xl">{question.text}</h1><p className="mt-2 text-sm text-muted-foreground">{question.type === "multiple" ? `Vyberte přesně ${required} správné odpovědi.` : question.type === "matching" ? "Vyberte správnou kombinaci přiřazení." : "Vyberte právě jednu správnou odpověď."}</p></div>{mode === "exam" && <Button variant={flags.includes(question.id) ? "default" : "outline"} size="sm" onClick={() => setFlags(value => value.includes(question.id) ? value.filter(id => id !== question.id) : [...value, question.id])}><Flag/><span className="hidden sm:inline">Označit k revizi</span></Button>}</div>
    <p className="mt-5 hidden text-xs text-muted-foreground sm:block">Tip: odpověď zvolíte klávesami 1–4 nebo A–D, klávesou Enter pokračujete.</p><div className="mt-3 space-y-3">{shuffled[question.id].map((option, displayIndex) => { const isSelected = selected.includes(option.originalIndex); const isCorrect = question.correctIndices.includes(option.originalIndex); return <label key={option.originalIndex} className={cn("flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border-2 bg-card p-4 transition-colors sm:p-5", !feedbackVisible && isSelected && "border-primary bg-accent", feedbackVisible && isCorrect && "border-success bg-success/10", feedbackVisible && isSelected && !isCorrect && "border-error bg-error/10", feedbackVisible && "cursor-default")}><input className="mt-0.5 size-5 shrink-0 accent-primary" type={question.type === "multiple" ? "checkbox" : "radio"} name={`otazka-${question.id}`} checked={isSelected} disabled={feedbackVisible} onChange={() => choose(option.originalIndex)}/><span className="flex size-7 shrink-0 items-center justify-center rounded bg-muted text-sm font-bold">{String.fromCharCode(65 + displayIndex)}</span><span className="min-w-0 whitespace-pre-wrap break-words leading-relaxed">{option.text}</span></label>})}</div>
    {feedbackVisible && <aside role="status" className={cn("mt-5 rounded-xl border p-4", correct ? "border-success bg-success/10" : "border-error bg-error/10")}><div className="flex items-center gap-2 font-bold">{correct ? <CheckCircle2 className="size-5 text-success"/> : <XCircle className="size-5 text-error"/>}{correct ? "Správně" : "Nesprávně"}</div><div className="mt-2 flex gap-2 text-sm"><Lightbulb className="size-4 shrink-0 text-primary"/><p>{question.explanation}</p></div></aside>}
    <footer className="mt-auto flex justify-between gap-3 pt-8"><Button className="min-h-11" variant="outline" disabled={!current || immediateFeedback} onClick={() => setCurrent(index => index - 1)}><ArrowLeft/>Předchozí</Button><Button className="min-h-11" disabled={!canContinue || (immediateFeedback && !feedbackVisible)} onClick={next}>{current < questions.length - 1 ? "Další otázka" : immediateFeedback ? "Zobrazit výsledek" : "Zkontrolovat test"}<ArrowRight/></Button></footer></main>
}
