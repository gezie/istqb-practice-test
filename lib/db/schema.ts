import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core"

export type QuestionType = "single" | "multiple" | "matching"

// Use an application-specific table name. Some hosting databases already contain
// a generic `questions` table with an unrelated schema.
export const questions = pgTable("istqb_questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: text("type").$type<QuestionType>().notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctIndices: jsonb("correct_indices").$type<number[]>().notNull(),
  explanation: text("explanation").notNull(),
  categoryId: integer("category_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Question = typeof questions.$inferSelect
export type NewQuestion = typeof questions.$inferInsert
