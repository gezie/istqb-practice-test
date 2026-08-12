export const CHAPTERS = [
  "Kapitola 1: Základy testování",
  "Kapitola 2: Testování v SDLC",
  "Kapitola 3: Statické testování",
  "Kapitola 4: Analýza a návrh testů",
  "Kapitola 5: Řízení testů",
  "Kapitola 6: Nástroje pro testování",
] as const

export const EXAM_WEIGHTS = [0.2, 0.125, 0.125, 0.275, 0.225, 0.05] as const

export function getChapterName(categoryId: number) {
  return CHAPTERS[categoryId - 1] ?? `Neznámá kapitola (${categoryId})`
}
