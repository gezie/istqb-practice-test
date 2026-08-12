"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpenCheck, ClipboardCheck, PlayCircle, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CHAPTERS } from "@/lib/chapters"
import { cn } from "@/lib/utils"

type TestMode = "exam" | "practice" | "chapters"

const MODES = [
  { id: "exam", title: "Ostrý test", subtitle: "Simulace zkoušky", description: "40 otázek, 60 minut a vyhodnocení až na konci.", icon: ClipboardCheck },
  { id: "practice", title: "Rychlé procvičování", subtitle: "S okamžitou zpětnou vazbou", description: "Vlastní počet otázek podle oficiálních vah, bez časového limitu.", icon: Zap },
  { id: "chapters", title: "Učení podle kapitol", subtitle: "Vybraná témata", description: "Otázky pouze z vybraných kapitol, bez časového limitu.", icon: BookOpenCheck },
] as const

export function TestConfiguration() {
  const router = useRouter()
  const [mode, setMode] = useState<TestMode>("exam")
  const [count, setCount] = useState(10)
  const [selected, setSelected] = useState<number[]>([1])

  const start = () => {
    if (mode === "practice") router.push(`/test?mode=practice&count=${count}`)
    else if (mode === "chapters") router.push(`/test?mode=chapters&chapters=${selected.join(",")}`)
    else router.push("/test?mode=exam")
  }

  return <section className="mx-auto mt-10 max-w-4xl rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
    <h2 className="text-xl font-bold">Nastavení testu</h2>
    <p className="mt-1 text-sm text-muted-foreground">Zvolte jeden ze tří způsobů přípravy.</p>
    <div role="radiogroup" aria-label="Režim testu" className="mt-5 grid gap-3 md:grid-cols-3">
      {MODES.map(({ id, title, subtitle, description, icon: Icon }) => <button type="button" role="radio" aria-checked={mode === id} key={id} onClick={() => setMode(id)} className={cn("rounded-xl border-2 p-4 text-left transition", mode === id ? "border-primary bg-accent" : "hover:border-primary/40")}>
        <Icon className="mb-3 size-5 text-primary"/><strong className="block">{title}</strong><span className="block text-xs font-semibold text-primary">{subtitle}</span><span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{description}</span>
      </button>)}
    </div>
    {mode === "practice" && <div className="mt-5 rounded-xl bg-muted/60 p-4"><label htmlFor="question-count" className="text-sm font-semibold">Počet otázek</label><Input id="question-count" type="number" min={1} max={100} value={count} onChange={event => setCount(Math.min(100, Math.max(1, Number(event.target.value) || 1)))} className="mt-2 max-w-40"/><p className="mt-2 text-xs text-muted-foreground">Otázky budou rozděleny poměrně podle vah kapitol ISTQB.</p></div>}
    {mode === "chapters" && <fieldset className="mt-5 rounded-xl bg-muted/60 p-4"><legend className="px-1 text-sm font-semibold">Vyberte jednu nebo více kapitol</legend><div className="mt-2 grid gap-3 sm:grid-cols-2">{CHAPTERS.map((name, index) => <label key={name} className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" className="mt-0.5 size-4 accent-primary" checked={selected.includes(index + 1)} onChange={() => setSelected(value => value.includes(index + 1) ? value.filter(item => item !== index + 1) : [...value, index + 1])}/><span>{name}</span></label>)}</div></fieldset>}
    <Button size="lg" className="mt-6 w-full" disabled={mode === "chapters" && !selected.length} onClick={start}><PlayCircle/>Spustit {mode === "exam" ? "ostrý test" : "procvičování"}</Button>
  </section>
}
