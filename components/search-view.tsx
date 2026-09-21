'use client'

import { Loader2, Music4, Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { TrackRow } from '@/components/track-row'
import type { Track } from '@/lib/types'

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<{ results: Track[] }>)

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

export function SearchView() {
  const [term, setTerm] = useState('')
  const debounced = useDebounced(term.trim(), 350)

  const { data, isLoading } = useSWR(
    debounced.length > 1 ? `/api/search?term=${encodeURIComponent(debounced)}` : null,
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: false },
  )

  const results = data?.results ?? []
  const showResults = debounced.length > 1

  return (
    <section aria-labelledby="buscar-titulo" className="w-full">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Busca lo que quieras</p>
          <h2 id="buscar-titulo" className="mt-1 font-serif text-2xl font-medium text-foreground sm:text-3xl">
            Toda la música, para ti
          </h2>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Busca una canción, un artista..."
          aria-label="Buscar canciones"
          className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-12 text-base text-foreground shadow-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 size-5 -translate-y-1/2 animate-spin text-primary" />
        )}
        {!isLoading && term && (
          <button
            type="button"
            onClick={() => setTerm('')}
            aria-label="Borrar búsqueda"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="mt-5">
        {!showResults && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
            <Music4 className="size-7 text-primary" />
            <p className="max-w-xs text-pretty text-sm text-muted-foreground">
              Escribe el nombre de una canción y suena al instante. Sin anuncios, solo nosotros.
            </p>
          </div>
        )}

        {showResults && results.length === 0 && !isLoading && (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">
            No encontré nada con &quot;{debounced}&quot;. Prueba con otras palabras.
          </p>
        )}

        {results.length > 0 && (
          <ul className="flex flex-col gap-0.5">
            {results.map((track) => (
              <li key={track.id}>
                <TrackRow track={track} queue={results} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
