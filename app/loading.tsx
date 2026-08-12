import { LoaderCircle } from "lucide-react"

export default function Loading() {
  return <main role="status" aria-live="polite" className="flex min-h-svh items-center justify-center gap-3 px-4 text-muted-foreground"><LoaderCircle className="size-6 animate-spin"/><span className="font-medium">Načítání…</span></main>
}
