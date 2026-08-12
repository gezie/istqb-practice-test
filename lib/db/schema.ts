import { pgTable, serial, text, char, timestamp } from "drizzle-orm/pg-core"

/**
 * Drizzle ORM schema for the ISTQB question bank.
 *
 * Equivalent SQL:
 *
 * CREATE TABLE questions (
 *   id serial PRIMARY KEY,
 *   question_text text NOT NULL,
 *   option_a text NOT NULL,
 *   option_b text NOT NULL,
 *   option_c text NOT NULL,
 *   option_d text NOT NULL,
 *   correct_answer char(1) NOT NULL, -- 'A' | 'B' | 'C' | 'D'
 *   explanation text,
 *   created_at timestamptz NOT NULL DEFAULT now()
 * );
 */
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: char("correct_answer", { length: 1 }).notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Question = typeof questions.$inferSelect
export type NewQuestion = typeof questions.$inferInsert
