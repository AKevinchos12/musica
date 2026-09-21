'use client'

import {
  Download,
  ExternalLink,
  Pause,
  Play,
  Repeat2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { usePlayer } from '@/components/player-provider'

function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export function PlayerBar() {
  const {
    current,
    isPlaying,
    currentTime,
    duration,
    loadError,
    volume,
    isMuted,
    shuffle,
    repeat,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer()

  if (!current) return null

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-[0_-12px_35px_rgba(0,0,0,.22)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:gap-5">
        {/* Info de la canción */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <img
            src={current.artwork || '/placeholder.svg'}
            alt=""
            className="size-12 shrink-0 rounded-lg object-cover sm:size-14"
            crossOrigin="anonymous"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{current.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {loadError
                ? 'No se pudo cargar este audio'
                : current.artist}
            </p>
          </div>
          {current.isPreview && (
            <span className="ml-1 hidden shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-foreground sm:inline">
              30s
            </span>
          )}
        </div>

        {/* Controles */}
        <div className="order-3 flex w-full items-center justify-center gap-1 sm:order-2 sm:w-auto sm:gap-2">
          <button type="button" onClick={toggleShuffle} aria-label="Aleatorio" aria-pressed={shuffle} className={`rounded-full p-2 transition-colors ${shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <Shuffle className="size-4" />
          </button>
          <button
            type="button"
            onClick={prev}
            aria-label="Anterior"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <SkipBack className="size-5" fill="currentColor" />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="size-5" fill="currentColor" />
            ) : (
              <Play className="ml-0.5 size-5" fill="currentColor" />
            )}
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <SkipForward className="size-5" fill="currentColor" />
          </button>
          <button type="button" onClick={toggleRepeat} aria-label="Repetir canción" aria-pressed={repeat} className={`rounded-full p-2 transition-colors ${repeat ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            <Repeat2 className="size-4" />
          </button>
        </div>

        <div className="order-2 ml-auto flex items-center gap-0.5 sm:gap-1">
          <button type="button" onClick={toggleMute} aria-label={isMuted ? 'Activar volumen' : 'Silenciar'} className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground">
            {isMuted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volumen" className="h-1 w-14 cursor-pointer accent-primary sm:w-20" />
          <a href={current.audioUrl} download target="_blank" rel="noreferrer" aria-label="Descargar canción" className="hidden rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
            <Download className="size-4" />
          </a>
          <a href={current.audioUrl} target="_blank" rel="noreferrer" aria-label="Abrir canción" className="hidden rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground sm:block">
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-3">
        <span className="w-9 text-right text-[11px] tabular-nums text-muted-foreground">
          {fmt(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Progreso de la canción"
          className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          style={{
            background: `linear-gradient(to right, var(--primary) ${pct}%, var(--border) ${pct}%)`,
          }}
        />
        <span className="w-9 text-[11px] tabular-nums text-muted-foreground">{fmt(duration)}</span>
      </div>
    </div>
  )
}
