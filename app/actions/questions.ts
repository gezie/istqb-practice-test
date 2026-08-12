"use server"

import { db } from "@/lib/db"
import { questions, type Question } from "@/lib/db/schema"
import { desc, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getQuestionCount(): Promise<number> {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(questions)
  return row?.count ?? 0
}

export async function getQuizQuestions(limit = 40): Promise<Question[]> {
  // Random order so each attempt differs; capped at `limit` questions.
  return db
    .select()
    .from(questions)
    .orderBy(sql`random()`)
    .limit(limit)
}

export async function getAllQuestions(): Promise<Question[]> {
  return db.select().from(questions).orderBy(desc(questions.createdAt))
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

  if (!questionText || !optionA || !optionB || !optionC || !optionD) {
    return { error: "Please fill in the question and all four options." }
  }
  if (!["A", "B", "C", "D"].includes(correctAnswer)) {
    return { error: "Please select which option is correct." }
  }

  try {
    await db.insert(questions).values({
      questionText,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      explanation: explanation || null,
    })
  } catch (err) {
    console.log("[v0] addQuestion error:", err)
    return { error: "Something went wrong while saving. Please try again." }
  }

  revalidatePath("/")
  revalidatePath("/admin/add")
  return { success: true }
}
