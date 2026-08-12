import Link from "next/link"
import { getQuestionCount } from "@/app/actions/questions"
import { TestConfiguration } from "@/components/test-configuration"
import { GraduationCap, Database, CheckCircle2, Settings } from "lucide-react"

export default async function HomePage() {
  const count = await getQuestionCount()
  return <main className="relative min-h-svh overflow-hidden px-4 py-12">
    <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--color-accent),transparent_45%)]" />
    <div className="mx-auto max-w-5xl">
      <header className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><GraduationCap /></span><span className="font-bold">ISTQB Trenažér</span></div><Link href="/admin" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><Settings className="size-4"/>Správa otázek</Link></header>
      <section className="mx-auto mt-16 max-w-2xl text-center"><h1 className="text-balance text-4xl font-bold sm:text-6xl">Příprava na certifikaci ISTQB</h1></section>
      <TestConfiguration />
      <div className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-4"><div className="rounded-xl border bg-card p-4"><Database className="mb-2 size-5 text-primary"/><strong className="text-2xl">{count}</strong><p className="text-sm text-muted-foreground">otázek v databázi</p></div><div className="rounded-xl border bg-card p-4"><CheckCircle2 className="mb-2 size-5 text-success"/><strong className="text-2xl">65 %</strong><p className="text-sm text-muted-foreground">hranice úspěšnosti</p></div></div>
    </div>
  </main>
}
