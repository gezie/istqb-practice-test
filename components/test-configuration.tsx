"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ClipboardCheck, BookOpenCheck, History, PlayCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const chapters=["Základy testování","Testování v životním cyklu vývoje softwaru","Statické testování","Analýza a návrh testů","Řízení testovacích činností","Testovací nástroje"]
export function TestConfiguration(){const router=useRouter();const[mode,setMode]=useState("full");const[selected,setSelected]=useState<number[]>([1]);
 const start=()=>router.push(mode==="chapters"?`/test?mode=chapters&chapters=${selected.join(",")}`:`/test?mode=${mode}`)
 return <section className="mx-auto mt-10 max-w-3xl rounded-2xl border bg-card p-5 shadow-sm sm:p-7"><h2 className="text-xl font-bold">Nastavení testu</h2><p className="mt-1 text-sm text-muted-foreground">Vyberte způsob přípravy, který vám právě nejvíce pomůže.</p>
 <div className="mt-5 grid gap-3 sm:grid-cols-3">{[
  ["full","Plný ISTQB test (40 otázek)","Přesně 40 otázek podle vah kapitol.",ClipboardCheck],
  ["chapters","Procvičování podle kapitol","Zaměřte se na vybraná témata.",BookOpenCheck],
  ["mistakes","Procvičovat mé chyby","Zopakujte chybně zodpovězené otázky.",History]
 ].map(([id,title,desc,Icon])=><button key={id as string} onClick={()=>setMode(id as string)} className={cn("rounded-xl border-2 p-4 text-left transition",mode===id?"border-primary bg-accent":"hover:border-primary/40")}><Icon className="mb-3 size-5 text-primary"/><strong className="block text-sm">{title as string}</strong><span className="mt-1 block text-xs text-muted-foreground">{desc as string}</span></button>)}</div>
 {mode==="chapters"&&<fieldset className="mt-5 rounded-xl bg-muted/60 p-4"><legend className="px-1 text-sm font-semibold">Vyberte kapitoly</legend><div className="mt-2 grid gap-3 sm:grid-cols-2">{chapters.map((name,i)=><label key={name} className="flex cursor-pointer items-start gap-3 text-sm"><input type="checkbox" className="mt-0.5 size-4 accent-primary" checked={selected.includes(i+1)} onChange={()=>setSelected(s=>s.includes(i+1)?s.filter(x=>x!==i+1):[...s,i+1])}/><span><b>Kapitola {i+1}:</b> {name}</span></label>)}</div></fieldset>}
 <Button size="lg" className="mt-6 w-full" disabled={mode==="chapters"&&!selected.length} onClick={start}><PlayCircle/>Spustit procvičování</Button></section>}
