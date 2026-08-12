"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import type { Question, QuestionType } from "@/lib/db/schema"
import { updateQuestion } from "@/app/actions/questions"
import { CHAPTERS } from "@/lib/chapters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function EditQuestionForm({ question }: { question: Question }) {
  const [type, setType] = useState<QuestionType>(question.type)
  const [correct, setCorrect] = useState(question.correctIndices)
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const optionCount = type === "single" ? 4 : 5

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await updateQuestion(question.id, formData)
      if (result.error) setError(result.error)
      else router.push("/admin")
    })
  }

  return <form action={submit} className="space-y-6 rounded-xl border bg-card p-6">
    <fieldset><legend className="text-sm font-semibold">Typ otázky</legend><div className="mt-2 flex gap-6">
      {([["single", "Jedna správná odpověď"], ["multiple", "Více správných odpovědí"]] as const).map(([value,label]) => <label key={value} className="flex items-center gap-2"><input type="radio" checked={type===value} onChange={()=>{setType(value);setCorrect(value==="single"?[0]:[])}} />{label}</label>)}
    </div><input type="hidden" name="type" value={type}/></fieldset>
    <label className="block text-sm font-semibold">Text otázky<Textarea name="text" required rows={6} defaultValue={question.text} className="mt-2"/></label>
    <label className="block text-sm font-semibold">Kapitola<select name="categoryId" defaultValue={question.categoryId} className="mt-2 block w-full rounded-md border bg-background p-2">{CHAPTERS.map((chapter,index)=><option key={chapter} value={index+1}>{chapter}</option>)}</select></label>
    <fieldset><legend className="text-sm font-semibold">Možnosti odpovědi</legend><div className="mt-3 space-y-3">{Array.from({length:optionCount},(_,index)=><label key={`${type}-${index}`} className="flex items-center gap-3"><input type={type==="single"?"radio":"checkbox"} name="correctIndices" value={index} checked={correct.includes(index)} onChange={()=>setCorrect(current=>type==="single"?[index]:current.includes(index)?current.filter(item=>item!==index):[...current,index])} className="size-4 accent-primary"/><Input name={`option-${index}`} required defaultValue={question.options[index] ?? ""}/></label>)}</div></fieldset>
    <label className="block text-sm font-semibold">Zdůvodnění<Textarea name="explanation" required defaultValue={question.explanation} className="mt-2"/></label>
    {error&&<p className="text-sm text-error">{error}</p>}
    <div className="flex gap-3"><Button disabled={pending||correct.length===0}>{pending?"Ukládám…":"Uložit změny"}</Button><Button type="button" variant="outline" onClick={()=>router.push("/admin")}>Zrušit</Button></div>
  </form>
}
