"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PlayCircle, Zap, ClipboardCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export function TestConfiguration() {
 const router = useRouter(); const [mode,setMode]=useState("full"); const [size,setSize]=useState("10")
 return <section className="mx-auto mt-10 max-w-2xl rounded-2xl border bg-card p-6 shadow-sm"><h2 className="text-xl font-bold">Nastavení testu</h2><p className="mt-1 text-sm text-muted-foreground">Zvolte délku procvičování.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">
  <button onClick={()=>setMode("quick")} className={cn("rounded-xl border-2 p-4 text-left",mode==="quick"?"border-primary bg-accent":"border-border")}><Zap className="mb-3 text-primary"/><strong>Rychlý test</strong><p className="mt-1 text-sm text-muted-foreground">Náhodný výběr z celé databáze.</p></button>
  <button onClick={()=>setMode("full")} className={cn("rounded-xl border-2 p-4 text-left",mode==="full"?"border-primary bg-accent":"border-border")}><ClipboardCheck className="mb-3 text-primary"/><strong>Plný ISTQB test (40 otázek)</strong><p className="mt-1 text-sm text-muted-foreground">Reálné zastoupení všech šesti kapitol.</p></button></div>
  {mode==="quick"&&<div className="mt-4"><label className="text-sm font-medium" htmlFor="size">Počet otázek</label><select id="size" value={size} onChange={e=>setSize(e.target.value)} className="mt-2 w-full rounded-lg border bg-background p-3"><option value="10">10 otázek</option><option value="20">20 otázek</option></select></div>}
  <Button size="lg" className="mt-6 w-full" onClick={()=>router.push(`/test?mode=${mode}&size=${size}`)}><PlayCircle/>Spustit test</Button></section>
}
