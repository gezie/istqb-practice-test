"use server"

import type { Question, QuestionType } from "@/lib/db/schema"
import { revalidatePath } from "next/cache"
import { EXAM_WEIGHTS } from "@/lib/chapters"

const examples: Omit<Question, "id" | "createdAt">[] = [
  { text: "Které dva výroky správně popisují cíle testování?", type: "multiple", options: ["Vyhodnotit pracovní produkty", "Snížit úroveň produktového rizika", "Dokázat, že software nemá vady", "Nahradit ladění", "Zaručit termín vydání"], correctIndices: [0, 1], explanation: "Testování hodnotí pracovní produkty a poskytuje informace potřebné ke snížení rizik; úplnou bezchybnost dokázat nemůže.", categoryId: 1 },
  { text: "Který princip testování říká, že opakování stejných testů postupně přestává odhalovat nové vady?", type: "single", options: ["Paradox pesticidu", "Shlukování vad", "Absence chyb je klam", "Testování závisí na kontextu"], correctIndices: [0], explanation: "Podle paradoxu pesticidu je nutné testy pravidelně revidovat a doplňovat.", categoryId: 1 },
  { text: "Jaký přínos má zapojení testerů do revize uživatelských příběhů v rané fázi SDLC?", type: "single", options: ["Včasné odhalení nejednoznačných požadavků", "Odstranění potřeby systémového testování", "Automatické schválení akceptačních kritérií", "Přenesení odpovědnosti za kvalitu na testery"], correctIndices: [0], explanation: "Včasné zapojení testerů pomáhá předcházet vadám a odhalit nejasnosti dříve, než se promítnou do kódu.", categoryId: 2 },
  { text: "Které dvě činnosti podporují přístup DevOps?", type: "multiple", options: ["Průběžná integrace", "Průběžné doručování", "Oddělení vývoje a provozu", "Jednorázové testování před vydáním", "Ruční nasazení každé změny"], correctIndices: [0, 1], explanation: "DevOps typicky využívá průběžnou integraci a doručování se silnou automatizací.", categoryId: 2 },
  { text: "Jaký je hlavní rozdíl mezi statickým a dynamickým testováním?", type: "single", options: ["Statické testování nevyžaduje spuštění testovaného softwaru", "Statické testování provádí pouze vývojář", "Dynamické testování nepracuje s testovacími daty", "Dynamické testování nelze automatizovat"], correctIndices: [0], explanation: "Při statickém testování se pracovní produkt analyzuje bez spuštění jeho kódu.", categoryId: 3 },
  { text: "Které dvě role patří mezi obecné role formální revize?", type: "multiple", options: ["Moderátor", "Zapisovatel", "Provozovatel databáze", "Produktový auditor", "Správce sítě"], correctIndices: [0, 1], explanation: "Moderátor zajišťuje průběh revize a zapisovatel zaznamenává zjištění a rozhodnutí.", categoryId: 3 },
  { text: "Která technika černé skříňky rozděluje vstupy do skupin, jejichž hodnoty mají být zpracovány stejným způsobem?", type: "single", options: ["Rozdělení do tříd ekvivalence", "Testování větví", "Pokrytí příkazů", "Odhadování chyb"], correctIndices: [0], explanation: "Třídy ekvivalence reprezentují množiny hodnot, u kterých se očekává stejné chování systému.", categoryId: 4 },
  { text: "Které dvě hodnoty jsou typickými kandidáty při analýze hraničních hodnot pro platný interval 1 až 100?", type: "multiple", options: ["1", "100", "50", "60", "75"], correctIndices: [0, 1], explanation: "Technika se zaměřuje na hranice intervalů; zde jsou platnými hranicemi hodnoty 1 a 100.", categoryId: 4 },
  { text: "Co vyjadřuje produktové riziko?", type: "single", options: ["Možnost, že pracovní produkt nesplní oprávněné potřeby uživatelů", "Riziko překročení rozpočtu testovacího týmu", "Pravděpodobnost absence zápisu ze schůzky", "Počet testerů dostupných v projektu"], correctIndices: [0], explanation: "Produktové riziko souvisí s potenciálním selháním kvality produktu a jeho dopadem.", categoryId: 5 },
  { text: "Které dvě informace obvykle obsahuje hlášení o vadě?", type: "multiple", options: ["Kroky k reprodukci", "Očekávaný a skutečný výsledek", "Soukromé hodnocení vývojáře", "Mzdové údaje týmu", "Obchodní tajemství zákazníka"], correctIndices: [0, 1], explanation: "Reprodukovatelné kroky a porovnání očekávaného se skutečným výsledkem umožňují vadu analyzovat.", categoryId: 5 },
  { text: "Jaké je významné riziko automatizace testování?", type: "single", options: ["Nerealistická očekávání od přínosů nástroje", "Nástroj vždy zvýší počet ručních testů", "Automatizované testy nelze opakovat", "Nástroje znemožňují měření pokrytí"], correctIndices: [0], explanation: "Pořízení nástroje bez realistických očekávání, procesu a údržby může vést k nízké návratnosti.", categoryId: 6 },
  { text: "Které dva přínosy mohou poskytnout nástroje pro testování?", type: "multiple", options: ["Opakovatelné provádění testů", "Objektivní měření pokrytí", "Zaručení bezvadného produktu", "Úplné nahrazení lidského úsudku", "Odstranění potřeby údržby testů"], correctIndices: [0, 1], explanation: "Nástroje podporují opakovatelnost a měření, ale nezaručují bezvadnost ani nenahrazují úsudek testerů.", categoryId: 6 },
]

const store = globalThis as typeof globalThis & { istqbQuestionsV4?: Question[] }
if (!store.istqbQuestionsV4) store.istqbQuestionsV4 = Array.from({ length: 72 }, (_, index) => ({
  ...examples[index % examples.length],
  id: index + 1,
  createdAt: new Date(2026, 0, index + 1),
}))
const data = () => store.istqbQuestionsV4!
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - .5)
export async function getQuestionCount() { return data().length }
export async function getAllQuestions() { return [...data()].sort((a,b) => b.id-a.id) }
export async function getQuestionsByChapters(ids: number[]) { return shuffle(data().filter(q => ids.includes(q.categoryId))).slice(0,40) }
export async function getFullExamQuestions(total = 40) {
  const exact = EXAM_WEIGHTS.map(weight => weight * total)
  const counts = exact.map(Math.floor)
  let remainder = total - counts.reduce((sum, count) => sum + count, 0)
  exact.map((value, index) => ({ index, fraction: value - counts[index] }))
    .sort((a, b) => b.fraction - a.fraction)
    .slice(0, remainder)
    .forEach(({ index }) => counts[index]++)
  return shuffle(counts.flatMap((count, index) => shuffle(data().filter(q => q.categoryId === index + 1)).slice(0, count)))
}
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
export async function addQuestion(_s:AddQuestionState,formData:FormData):Promise<AddQuestionState>{try{const type=String(formData.get("type")||"single") as QuestionType;const optionCount=type==="single"?4:5;const options=Array.from({length:optionCount},(_,index)=>String(formData.get(`option-${index}`)||"").trim());const q=validate({text:String(formData.get("text")||""),type,options,correctIndices:formData.getAll("correctIndices").map(Number),explanation:String(formData.get("explanation")||""),categoryId:Number(formData.get("categoryId"))});data().unshift({...q,id:Math.max(...data().map(x=>x.id),0)+1,createdAt:new Date()});revalidatePath("/admin");return{success:true}}catch(e){return{error:e instanceof Error?e.message:"Otázku nelze uložit."}}}
export async function updateQuestion(){ return }
