"use server"

import type { Question } from "@/lib/db/schema"
import { revalidatePath } from "next/cache"

const KAPITOLY = ["Kapitola 1", "Kapitola 2", "Kapitola 3", "Kapitola 4", "Kapitola 5", "Kapitola 6"]
const TEMATA = ["Základy testování", "Testování v životním cyklu", "Statické testování", "Techniky testování", "Řízení testování", "Nástroje pro testování"]
const store = globalThis as typeof globalThis & { istqbQuestions?: Question[] }
if (!store.istqbQuestions) {
  store.istqbQuestions = Array.from({ length: 40 }, (_, i) => {
    const chapter = i < 8 ? 0 : i < 13 ? 1 : i < 18 ? 2 : i < 29 ? 3 : i < 38 ? 4 : 5
    return {
      id: i + 1,
      questionText: `${TEMATA[chapter]}: Které tvrzení nejlépe odpovídá principům sylabu ISTQB? (${i + 1})`,
      optionA: "Testování snižuje pravděpodobnost výskytu neodhalených vad.",
      optionB: "Testování dokazuje, že software neobsahuje žádné vady.",
      optionC: "Každý test musí provést výhradně vývojář.",
      optionD: "Automatizace vždy nahrazuje ruční testování.",
      correctAnswer: "A", category: KAPITOLY[chapter],
      explanation: "Testování může prokázat přítomnost vad, nikoli jejich úplnou nepřítomnost.",
      createdAt: new Date(2026, 0, i + 1),
    }
  })
}
const data = () => store.istqbQuestions!

export async function getQuestionCount(): Promise<number> {
  return data().length
}

export async function getQuizQuestions(limit = 40): Promise<Question[]> {
  return [...data()].sort(() => Math.random() - 0.5).slice(0, limit)
}

export async function getFullExamQuestions(): Promise<Question[]> {
  const counts = [8, 5, 5, 11, 9, 2]
  return KAPITOLY.flatMap((category, index) => data().filter(q => q.category === category).sort(() => Math.random() - .5).slice(0, counts[index]))
}

export async function getAllQuestions(): Promise<Question[]> {
  return [...data()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export type AddQuestionState = {
  success?: boolean
  error?: string
}

export async function addQuestion(
  _prevState: AddQuestionState,
  formData: FormData,
): Promise<AddQuestionState> {
  const questionText = String(formData.get("questionText") ?? "").trim()
  const optionA = String(formData.get("optionA") ?? "").trim()
  const optionB = String(formData.get("optionB") ?? "").trim()
  const optionC = String(formData.get("optionC") ?? "").trim()
  const optionD = String(formData.get("optionD") ?? "").trim()
  const correctAnswer = String(formData.get("correctAnswer") ?? "").trim().toUpperCase()
  const explanation = String(formData.get("explanation") ?? "").trim()
  const category = String(formData.get("category") ?? "")

  if (!questionText || !optionA || !optionB || !optionC || !optionD) {
    return { error: "Vyplňte text otázky a všechny čtyři možnosti." }
  }
  if (!["A", "B", "C", "D"].includes(correctAnswer)) {
    return { error: "Vyberte správnou odpověď." }
  }
  if (!KAPITOLY.includes(category)) return { error: "Vyberte kapitolu." }
  data().unshift({ id: Math.max(0, ...data().map(q => q.id)) + 1, questionText, optionA, optionB, optionC, optionD, correctAnswer, category, explanation: explanation || null, createdAt: new Date() })

  revalidatePath("/")
  revalidatePath("/admin/add")
  revalidatePath("/admin")
  return { success: true }
}

export async function deleteQuestion(id: number) {
  store.istqbQuestions = data().filter(q => q.id !== id)
  revalidatePath("/admin")
}

export async function updateQuestion(id: number, formData: FormData) {
  const question = data().find(q => q.id === id)
  if (!question) return
  for (const key of ["questionText", "optionA", "optionB", "optionC", "optionD", "correctAnswer", "category", "explanation"] as const) {
    const value = String(formData.get(key) ?? "").trim()
    if (value) Object.assign(question, { [key]: value })
  }
  revalidatePath("/admin")
}
