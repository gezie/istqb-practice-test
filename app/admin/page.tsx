import Link from "next/link"
import { getAllQuestions } from "@/app/actions/questions"
import { AdminDashboard } from "@/components/admin-dashboard"
import { ArrowLeft } from "lucide-react"
export const dynamic="force-dynamic"
export default async function AdminPage(){const questions=await getAllQuestions();return <main className="mx-auto min-h-svh max-w-6xl px-4 py-10"><Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4"/>Zpět domů</Link><div className="mt-5"><h1 className="text-3xl font-bold">Správa otázek</h1><p className="mt-1 text-muted-foreground">Spravujte a importujte české otázky pro ISTQB Foundation Level v4.0.</p></div><AdminDashboard questions={questions}/></main>}
