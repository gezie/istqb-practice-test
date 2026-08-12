"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { LoaderCircle, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Question, QuestionType } from "@/lib/db/schema"
import { updateQuestion } from "@/app/actions/questions"
import { CHAPTERS } from "@/lib/chapters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export function EditQuestionForm({ question }: { question: Question }) {
  const [type, setType] = useState<QuestionType>(question.type)
  const [correct, setCorrect] = useState(question.correctIndices)
  const [error, setError] = useState("")
  const [attempted, setAttempted] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const optionCount = type === "multiple" ? 5 : 4
  const selectionInvalid = correct.length === 0 || (type === "multiple" && correct.length < 2)
  function submit(formData: FormData) { setAttempted(true); if (selectionInvalid) return; startTransition(async () => { const result = await updateQuestion(question.id, formData); if (result.error) setError(result.error); else router.push("/admin") }) }

  return <form action={submit} className="space-y-7 rounded-2xl bg-card p-5 shadow-sm sm:p-7">
    <fieldset><legend className="text-sm font-semibold">Typ otázky</legend><div className="mt-2 grid gap-2 rounded-xl bg-muted p-1 sm:grid-cols-3">{([ ["single", "Jedna odpověď"], ["multiple", "Více odpovědí"], ["matching", "Přiřazovací"] ] as const).map(([value,label]) => <button type="button" key={value} onClick={() => { setType(value); setCorrect([]); setAttempted(false) }} className={cn("min-h-11 rounded-lg px-3 text-sm font-semibold", type === value ? "bg-background shadow-sm" : "text-muted-foreground")}>{label}</button>)}</div><input type="hidden" name="type" value={type}/></fieldset>
    <label className="block text-sm font-semibold">Text otázky<Textarea name="text" required rows={6} defaultValue={question.text} className="mt-2"/></label>
    <label className="block text-sm font-semibold">Kapitola<select name="categoryId" defaultValue={question.categoryId} className="mt-2 block min-h-11 w-full rounded-md border bg-background px-3">{CHAPTERS.map((chapter,index)=><option key={chapter} value={index+1}>{chapter}</option>)}</select></label>
    <fieldset aria-invalid={attempted && selectionInvalid} className={cn("rounded-xl p-1", attempted && selectionInvalid && "ring-2 ring-error/60")}><legend className="px-1 text-sm font-semibold">Možnosti odpovědi</legend><div className="mt-3 space-y-3">{Array.from({length:optionCount},(_,index)=><label key={`${type}-${index}`} className="flex min-h-11 items-center gap-3"><input type={type==="multiple"?"checkbox":"radio"} name="correctIndices" value={index} checked={correct.includes(index)} onChange={()=>setCorrect(current=>type!=="multiple"?[index]:current.includes(index)?current.filter(item=>item!==index):[...current,index])} className="size-5 shrink-0 accent-primary"/><Input name={`option-${index}`} required defaultValue={question.options[index] ?? ""}/></label>)}</div>{attempted && selectionInvalid && <p role="alert" className="mt-3 px-1 text-sm font-semibold text-error">Vyberte prosím správnou odpověď.</p>}</fieldset>
    <label className="block text-sm font-semibold">Zdůvodnění<Textarea name="explanation" required defaultValue={question.explanation} className="mt-2"/></label>
    {error&&<p role="alert" className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</p>}
    <div className="flex flex-col-reverse gap-3 sm:flex-row"><Button asChild type="button" variant="outline" className="min-h-11"><Link href="/admin"><X/>Zrušit</Link></Button><Button className="min-h-11" disabled={pending}>{pending?<><LoaderCircle className="animate-spin"/>Ukládání…</>:<><Save/>Uložit změny</>}</Button></div>
  </form>
}
