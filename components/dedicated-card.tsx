'use client'

import { Heart, Pause, Pencil, Play, Trash2, Upload } from 'lucide-react'
import { useRef } from 'react'
import { usePlayer } from '@/components/player-provider'
import { Equalizer } from '@/components/equalizer'
import type { Track } from '@/lib/types'

export function DedicatedCard({ track, queue, isFavorite, onToggleFavorite, onEdit, onDelete, onAttachAudio }: { track: Track; queue: Track[]; isFavorite: boolean; onToggleFavorite: () => void; onEdit: () => void; onDelete: () => void; onAttachAudio: (file: File) => void }) {
  const { current, isPlaying, play } = usePlayer()
  const audioInput = useRef<HTMLInputElement>(null)
  const isCurrent = current?.id === track.id
  const isActive = isCurrent && isPlaying

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-2.5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 sm:p-3">
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-secondary">
        <img
          src={track.artwork || '/placeholder.svg'}
          alt={`Carátula de ${track.title}`}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          crossOrigin="anonymous"
        />
        <button
          type="button"
          onClick={() => play(track, queue)}
          aria-label={`Reproducir ${track.title}`}
          className="absolute bottom-2 right-2 flex size-10 translate-y-2 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
        >
          {isActive ? (
            <Pause className="size-5" fill="currentColor" />
          ) : (
            <Play className="ml-0.5 size-5" fill="currentColor" />
          )}
        </button>
        <button type="button" onClick={onToggleFavorite} aria-label={isFavorite ? `Quitar ${track.title} de favoritas` : `Añadir ${track.title} a favoritas`} className={`absolute left-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm transition-colors ${isFavorite ? 'text-primary' : 'text-white/85 hover:text-primary'}`}>
          <Heart className="size-4" fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold leading-tight text-foreground sm:text-base">
            {track.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">{track.artist}</p>
        </div>
        {isActive && <Equalizer className="mt-1.5 shrink-0 text-primary" />}
      </div>

      {track.dedication && (
        <p className="mt-2 hidden gap-2 text-xs italic leading-relaxed text-muted-foreground sm:flex">
          <Heart className="mt-0.5 size-3.5 shrink-0 text-primary" fill="currentColor" />
          <span className="text-pretty">{track.dedication}</span>
        </p>
      )}
      <div className="mt-3 flex items-center justify-end gap-1 border-t border-border/60 pt-2">
        <button type="button" onClick={() => audioInput.current?.click()} aria-label={`Añadir audio a ${track.title}`} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Upload className="size-3.5" /></button>
        <input ref={audioInput} type="file" accept="audio/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) onAttachAudio(file); event.currentTarget.value = '' }} />
        {track.id.startsWith('local-') && <button type="button" onClick={onEdit} aria-label={`Editar ${track.title}`} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Pencil className="size-3.5" /></button>}
        {track.id.startsWith('local-') && <button type="button" onClick={onDelete} aria-label={`Eliminar ${track.title}`} className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-3.5" /></button>}
      </div>
    </article>
  )
}
