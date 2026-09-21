'use client'

import { Pause, Play } from 'lucide-react'
import { usePlayer } from '@/components/player-provider'
import { Equalizer } from '@/components/equalizer'
import type { Track } from '@/lib/types'

export function TrackRow({ track, queue }: { track: Track; queue: Track[] }) {
  const { current, isPlaying, play } = usePlayer()
  const isCurrent = current?.id === track.id
  const isActive = isCurrent && isPlaying

  return (
    <button
      type="button"
      onClick={() => play(track, queue)}
      className={`group flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary ${
        isCurrent ? 'bg-secondary' : ''
      }`}
      aria-label={`Reproducir ${track.title} de ${track.artist}`}
    >
      <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        <img
          src={track.artwork || '/placeholder.svg'}
          alt=""
          className="size-12 rounded-lg object-cover"
          crossOrigin="anonymous"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
          {isActive ? (
            <Pause className="size-5 text-background" fill="currentColor" />
          ) : (
            <Play className="size-5 text-background" fill="currentColor" />
          )}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            isCurrent ? 'text-primary' : 'text-foreground'
          }`}
        >
          {track.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
      </div>

      {isActive ? (
        <Equalizer className="mr-2 text-primary" />
      ) : (
        <span className="mr-2 text-xs tabular-nums text-muted-foreground">
          {track.isPreview ? '0:30' : ''}
        </span>
      )}
    </button>
  )
}
