import Link from "next/link"
import { deleteQuestion, getAllQuestions } from "@/app/actions/questions"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react"

export const dynamic = "force-dynamic"
export default async function AdminPage() {
 const questions = await getAllQuestions()
 return <main className="mx-auto min-h-svh max-w-5xl px-4 py-10"><Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4"/>Zpět domů</Link><div className="mt-5 flex items-end justify-between"><div><h1 className="text-3xl font-bold">Správa otázek</h1><p className="mt-1 text-muted-foreground">Upravujte obsah databáze pro cvičné testy.</p></div><Button asChild><Link href="/admin/add"><Plus/>Přidat otázku</Link></Button></div>
 <div className="mt-8 overflow-hidden rounded-xl border bg-card"><table className="w-full text-left"><thead className="bg-muted text-sm"><tr><th className="p-4">Otázka</th><th className="p-4">Kapitola</th><th className="p-4 text-right">Akce</th></tr></thead><tbody>{questions.map(q=><tr className="border-t" key={q.id}><td className="max-w-xl p-4">{q.questionText}</td><td className="whitespace-nowrap p-4 text-sm text-muted-foreground">{q.category}</td><td className="p-4"><div className="flex justify-end gap-2"><Button asChild variant="outline" size="sm"><Link href={`/admin/edit/${q.id}`}><Pencil/>Upravit</Link></Button><form action={deleteQuestion.bind(null,q.id)}><Button variant="outline" size="sm" className="text-destructive"><Trash2/>Smazat</Button></form></div></td></tr>)}</tbody></table></div></main>
}
