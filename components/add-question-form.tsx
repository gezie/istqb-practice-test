"use client"

import { useActionState, useState } from "react"
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
  const [type, setType] = useState<QuestionType | "matching">("single")
  const [correct, setCorrect] = useState<number[]>([0])
  const optionCount = type === "multiple" ? 5 : 4

  function changeType(next: QuestionType | "matching") {
    setType(next)
    setCorrect(next === "multiple" ? [] : [0])
  }

  function toggleCorrect(index: number) {
    setCorrect((current) => type !== "multiple"
      ? [index]
      : current.includes(index) ? current.filter((value) => value !== index) : [...current, index])
  }

  return <form action={action} className="space-y-6 rounded-xl border bg-card p-6">
    <fieldset>
      <legend className="text-sm font-semibold">Typ otázky</legend>
      <div className="mt-2 grid gap-1 rounded-lg bg-muted p-1 sm:grid-cols-3">
        {([["single", "Jedna správná (Single)"], ["multiple", "Více správných (Multiple)"], ["matching", "Přiřazovací (Matching)"]] as const).map(([value, label]) =>
          <button key={value} type="button" onClick={() => changeType(value)} className={cn("rounded-md px-3 py-2 text-sm font-semibold transition", type === value ? "bg-background shadow-sm" : "text-muted-foreground")}>{label}</button>)}
      </div>
      <input type="hidden" name="type" value={type === "matching" ? "single" : type} />
    </fieldset>

    <label className="block text-sm font-semibold">Text otázky<Textarea name="text" required rows={type === "matching" ? 6 : 3} className="mt-2" placeholder={type === "matching" ? "Uveďte položky 1, 2, 3 a definice A, B, C na samostatných řádcích…" : "Zadejte české znění otázky…"} /></label>
    <label className="block text-sm font-semibold">Kapitola<select name="categoryId" className="mt-2 block w-full rounded-md border bg-background p-2">{CHAPTERS.map((chapter, index) => <option key={chapter} value={index + 1}>{chapter}</option>)}</select></label>

    <fieldset>
      <legend className="text-sm font-semibold">Možnosti odpovědi</legend>
      <p className="mt-1 text-xs text-muted-foreground">Napište možnosti a vlevo označte {type === "multiple" ? "všechny správné odpovědi" : "jedinou správnou odpověď"}. {type === "matching" && "Každá možnost má obsahovat celé přiřazení, například „1A, 2B, 3C“."}</p>
      <div className="mt-3 space-y-3">{Array.from({ length: optionCount }, (_, index) =>
        <label key={`${type}-${index}`} className="flex items-center gap-3">
          <input type={type === "multiple" ? "checkbox" : "radio"} name="correctIndices" value={index} checked={correct.includes(index)} onChange={() => toggleCorrect(index)} className="size-4 shrink-0 accent-primary" aria-label={`Možnost ${index + 1} je správná`} />
          <Input name={`option-${index}`} required placeholder={type === "matching" ? `${index + 1}. kombinace (např. 1A, 2B, 3C)` : `${index + 1}. možnost odpovědi`} />
        </label>)}</div>
    </fieldset>

    <label className="block text-sm font-semibold">Zdůvodnění<Textarea name="explanation" required className="mt-2" placeholder="Vysvětlete, proč je označená odpověď správná…" /></label>
    {state.error && <p className="text-sm text-error">{state.error}</p>}
    {state.success && <p className="text-sm text-success">Otázka byla úspěšně uložena.</p>}
    <Button disabled={pending || (type === "multiple" && correct.length < 2)}>{pending ? "Ukládám…" : "Uložit otázku"}</Button>
  </form>
}
