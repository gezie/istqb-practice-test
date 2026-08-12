import { notFound } from "next/navigation"
import { getQuestion } from "@/app/actions/questions"
import { EditQuestionForm } from "@/components/edit-question-form"

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const question = await getQuestion(Number(id))
  if (!question) notFound()
  return <main className="mx-auto max-w-3xl px-4 py-10"><h1 className="mb-6 text-3xl font-bold">Upravit otázku</h1><EditQuestionForm question={question}/></main>
}
