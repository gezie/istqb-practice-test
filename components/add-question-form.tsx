"use client"

import { useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { LoaderCircle, Save, X } from "lucide-react"
import { addQuestion, type AddQuestionState } from "@/app/actions/questions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CHAPTERS } from "@/lib/chapters"
import type { QuestionType } from "@/lib/db/schema"
import { cn } from "@/lib/utils"

const initial: AddQuestionState = {}

export function AddQuestionForm() {
  const [state, action, pending] = useActionState(addQuestion, initial)
  const [type, setType] = useState<QuestionType>("single")
  const [correct, setCorrect] = useState<number[]>([])
  const [attempted, setAttempted] = useState(false)
  const optionCount = type === "multiple" ? 5 : 4
  const selectionInvalid = correct.length === 0 || (type === "multiple" && correct.length < 2)

  useEffect(() => { if (state.success) setAttempted(false) }, [state.success])
  function changeType(next: QuestionType) { setType(next); setCorrect([]); setAttempted(false) }
  function toggleCorrect(index: number) { setCorrect(current => type !== "multiple" ? [index] : current.includes(index) ? current.filter(value => value !== index) : [...current, index]) }

  return <form action={action} onSubmit={event => { setAttempted(true); if (selectionInvalid) event.preventDefault() }} className="space-y-7 rounded-2xl bg-card p-5 shadow-sm sm:p-7">
    <fieldset>
      <legend className="text-sm font-semibold">Typ otázky</legend>
      <div className="mt-2 grid gap-2 rounded-xl bg-muted p-1 sm:grid-cols-3">
        {([ ["single", "Jedna odpověď"], ["multiple", "Více odpovědí"], ["matching", "Přiřazovací"] ] as const).map(([value, label]) =>
          <button key={value} type="button" onClick={() => changeType(value)} className={cn("min-h-11 rounded-lg px-3 py-2 text-sm font-semibold transition", type === value ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}>{label}</button>)}
      </div><input type="hidden" name="type" value={type} />
    </fieldset>
    <label className="block text-sm font-semibold">Text otázky<Textarea name="text" required rows={type === "matching" ? 6 : 3} className="mt-2" placeholder={type === "matching" ? "Uveďte položky 1, 2, 3 a definice A, B, C na samostatných řádcích…" : "Zadejte české znění otázky…"} /></label>
    <label className="block text-sm font-semibold">Kapitola<select name="categoryId" className="mt-2 block min-h-11 w-full rounded-md border bg-background px-3">{CHAPTERS.map((chapter, index) => <option key={chapter} value={index + 1}>{chapter}</option>)}</select></label>
    <fieldset aria-invalid={attempted && selectionInvalid} className={cn("rounded-xl p-1", attempted && selectionInvalid && "ring-2 ring-error/60")}>
      <legend className="px-1 text-sm font-semibold">Možnosti odpovědi</legend>
      <p className="mt-1 px-1 text-xs text-muted-foreground">Napište možnosti a označte {type === "multiple" ? "alespoň dvě správné odpovědi" : "jedinou správnou odpověď"}. {type === "matching" && "Každá možnost má obsahovat celé přiřazení, například „1A, 2B, 3C“."}</p>
      <div className="mt-3 space-y-3">{Array.from({ length: optionCount }, (_, index) => <label key={`${type}-${index}`} className="flex min-h-11 items-center gap-3"><input type={type === "multiple" ? "checkbox" : "radio"} name="correctIndices" value={index} checked={correct.includes(index)} onChange={() => toggleCorrect(index)} className="size-5 shrink-0 accent-primary" aria-label={`Možnost ${index + 1} je správná`} /><Input name={`option-${index}`} required placeholder={type === "matching" ? `${index + 1}. kombinace (např. 1A, 2B, 3C)` : `${index + 1}. možnost odpovědi`} /></label>)}</div>
      {attempted && selectionInvalid && <p role="alert" className="mt-3 px-1 text-sm font-semibold text-error">Vyberte prosím správnou odpověď.</p>}
    </fieldset>
    <label className="block text-sm font-semibold">Zdůvodnění<Textarea name="explanation" required className="mt-2" placeholder="Vysvětlete, proč je označená odpověď správná…" /></label>
    {state.error && <p role="alert" className="rounded-lg bg-error/10 p-3 text-sm text-error">{state.error}</p>}
    {state.success && <p role="status" className="rounded-lg bg-success/10 p-3 text-sm text-success">Otázka byla úspěšně uložena.</p>}
    <div className="flex flex-col-reverse gap-3 sm:flex-row"><Button asChild type="button" variant="outline" className="min-h-11"><Link href="/admin"><X />Zrušit</Link></Button><Button className="min-h-11" disabled={pending}>{pending ? <><LoaderCircle className="animate-spin" />Ukládání…</> : <><Save />Uložit otázku</>}</Button></div>
  </form>
}
