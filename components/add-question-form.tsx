"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { addQuestion, type AddQuestionState } from "@/app/actions/questions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { Loader2, Save } from "lucide-react"

const OPTIONS = [
  { letter: "A", name: "optionA", label: "Možnost A" },
  { letter: "B", name: "optionB", label: "Možnost B" },
  { letter: "C", name: "optionC", label: "Možnost C" },
  { letter: "D", name: "optionD", label: "Možnost D" },
] as const

const initialState: AddQuestionState = {}

export function AddQuestionForm() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [correct, setCorrect] = useState("A")
  const [state, formAction, pending] = useActionState(addQuestion, initialState)

  useEffect(() => {
    if (state.success) {
      toast.success("Otázka byla přidána", { description: "Nyní je součástí databáze." })
      formRef.current?.reset()
      setCorrect("A")
      router.refresh()
    } else if (state.error) {
      toast.error(state.error)
    }
  }, [state, router])

  return (
    <Card>
      <CardContent className="pt-6">
        <form ref={formRef} action={formAction} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="questionText">Text otázky</Label>
            <Textarea
              id="questionText"
              name="questionText"
              placeholder="Např. Které tvrzení popisuje platný cíl testování?"
              rows={3}
              required
              className="resize-y"
            />
          </div>

          <div className="flex flex-col gap-4">
            <Label>4 možnosti odpovědí a správná odpověď</Label>
            <RadioGroup value={correct} onValueChange={setCorrect} className="gap-3">
              {OPTIONS.map((opt) => {
                const isCorrect = correct === opt.letter
                return (
                  <div
                    key={opt.letter}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border-2 p-2 transition-colors",
                      isCorrect ? "border-success/60 bg-success-muted/40" : "border-border",
                    )}
                  >
                    <label
                      htmlFor={`correct-${opt.letter}`}
                      className="flex cursor-pointer items-center gap-2 pl-1"
                      title="Označit jako správnou odpověď"
                    >
                      <RadioGroupItem value={opt.letter} id={`correct-${opt.letter}`} />
                      <span className="w-4 text-sm font-semibold text-muted-foreground">{opt.letter}</span>
                    </label>
                    <Input
                      name={opt.name}
                      aria-label={opt.label}
                      placeholder={`${opt.label}`}
                      required
                      className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                    />
                  </div>
                )
              })}
            </RadioGroup>
            {/* Hidden field carries the selected correct letter to the server action */}
            <input type="hidden" name="correctAnswer" value={correct} />
            <p className="text-xs text-muted-foreground">
              Přepínačem označte právě jednu správnou odpověď.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Kapitola</Label>
            <select id="category" name="category" className="rounded-md border bg-background px-3 py-2" required>{[1,2,3,4,5,6].map(i=><option key={i}>Kapitola {i}</option>)}</select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="explanation">
              Vysvětlení <span className="font-normal text-muted-foreground">(nepovinné)</span>
            </Label>
            <Textarea
              id="explanation"
              name="explanation"
              placeholder="Vysvětlete, proč je označená odpověď správná."
              rows={3}
              className="resize-y"
            />
          </div>

          <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto sm:self-end">
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Ukládání…
              </>
            ) : (
              <>
                <Save className="size-4" />
                Uložit otázku
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
