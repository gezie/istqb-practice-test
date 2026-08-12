"use server"

import type { Question, QuestionType } from "@/lib/db/schema"
import { revalidatePath } from "next/cache"

const CHAPTERS = ["Základy testování", "Testování v životním cyklu vývoje softwaru", "Statické testování", "Analýza a návrh testů", "Řízení testovacích činností", "Testovací nástroje"]
const distribution = [8, 5, 5, 11, 9, 2]
const store = globalThis as typeof globalThis & { istqbQuestionsV4?: Question[] }
if (!store.istqbQuestionsV4) store.istqbQuestionsV4 = Array.from({ length: 54 }, (_, i) => {
  const categoryId = (i % 6) + 1
  const multiple = i % 4 === 1
  return {
    id: i + 1, text: `${CHAPTERS[categoryId - 1]}: Které tvrzení odpovídá principům sylabu ISTQB?`, type: (multiple ? "multiple" : "single") as QuestionType,
    options: multiple ? ["Testování odhaluje vady.", "Testování snižuje riziko.", "Testování dokazuje bezchybnost.", "Testovat smí pouze vývojář.", "Automatizace nahrazuje všechny testery."] : ["Testování odhaluje vady a snižuje riziko.", "Testování dokazuje úplnou bezchybnost.", "Testování začíná až po implementaci.", "Všechny testy musí být automatizované."],
    correctIndices: multiple ? [0, 1] : [0], explanation: "Testování ukazuje přítomnost vad, nikoli jejich nepřítomnost, a pomáhá řídit produktová rizika.", categoryId, createdAt: new Date(2026, 0, i + 1),
  }
})
const data = () => store.istqbQuestionsV4!
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - .5)
export async function getQuestionCount() { return data().length }
export async function getAllQuestions() { return [...data()].sort((a,b) => b.id-a.id) }
export async function getQuestionsByChapters(ids: number[]) { return shuffle(data().filter(q => ids.includes(q.categoryId))).slice(0,40) }
export async function getFullExamQuestions() { return distribution.flatMap((count, i) => shuffle(data().filter(q => q.categoryId === i + 1)).slice(0,count)) }
export async function deleteQuestion(id:number) { store.istqbQuestionsV4=data().filter(q=>q.id!==id); revalidatePath("/admin") }
export type AddQuestionState={success?:boolean;error?:string}
function validate(value: unknown): Omit<Question,"id"|"createdAt"> {
  const q=value as Record<string,unknown>; const type=q.type as QuestionType
  const optionCount=Array.isArray(q.options)?q.options.length:0
  if(typeof q.text!=="string" || !["single","multiple"].includes(type) || !Array.isArray(q.options) || optionCount<4 || optionCount>5 || !q.options.every(x=>typeof x==="string") || !Array.isArray(q.correctIndices) || !q.correctIndices.every(x=>Number.isInteger(x)&&Number(x)>=0&&Number(x)<optionCount) || typeof q.explanation!=="string" || !Number.isInteger(q.categoryId)||Number(q.categoryId)<1||Number(q.categoryId)>6) throw new Error("Neplatná struktura otázky.")
  if(type==="single"&&q.correctIndices.length!==1) throw new Error("Otázka typu single musí mít právě jednu správnou odpověď.")
  if(type==="multiple"&&q.correctIndices.length<2) throw new Error("Otázka typu multiple musí mít alespoň dvě správné odpovědi.")
  return {text:q.text,type,options:q.options as string[],correctIndices:q.correctIndices as number[],explanation:q.explanation,categoryId:Number(q.categoryId)}
}
export async function bulkImportQuestions(json:string):Promise<AddQuestionState>{try{const parsed=JSON.parse(json);if(!Array.isArray(parsed))return{error:"JSON musí obsahovat pole otázek."};const valid=parsed.map(validate);let next=Math.max(...data().map(q=>q.id),0)+1;data().unshift(...valid.map(q=>({...q,id:next++,createdAt:new Date()})));revalidatePath("/admin");revalidatePath("/");return{success:true}}catch(e){return{error:e instanceof Error?e.message:"JSON se nepodařilo zpracovat."}}}
export async function addQuestion(_s:AddQuestionState,formData:FormData):Promise<AddQuestionState>{try{const options=String(formData.get("options")||"").split("\n").map(x=>x.trim()).filter(Boolean);const q=validate({text:String(formData.get("text")||""),type:String(formData.get("type")||"single"),options,correctIndices:String(formData.get("correctIndices")||"").split(",").map(Number),explanation:String(formData.get("explanation")||""),categoryId:Number(formData.get("categoryId"))});data().unshift({...q,id:Math.max(...data().map(x=>x.id),0)+1,createdAt:new Date()});revalidatePath("/admin");return{success:true}}catch(e){return{error:e instanceof Error?e.message:"Otázku nelze uložit."}}}
export async function updateQuestion(){ return }
