'use client'

import { ImagePlus, Music2, Plus, X } from 'lucide-react'
import { useState } from 'react'
import type { Track } from '@/lib/types'

type CardCreatorProps = {
  onCreate: (track: Track, files: { audio: File; artwork?: File }) => void | Promise<void>
}

export function CardCreator({ onCreate }: CardCreatorProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [dedication, setDedication] = useState('')
  const [lyrics, setLyrics] = useState('')
  const [moment, setMoment] = useState('')
  const [audio, setAudio] = useState<File | null>(null)
  const [artwork, setArtwork] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setTitle('')
    setArtist('')
    setDedication('')
    setLyrics('')
    setMoment('')
    setAudio(null)
    setArtwork(null)
    setError('')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!audio) {
      setError('Elige un archivo de audio para crear la card.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await onCreate({
        id: `local-${Date.now()}`,
        title: title.trim(),
        artist: artist.trim() || 'Nuestra playlist',
        artwork: artwork ? URL.createObjectURL(artwork) : '/images/cover-1.png',
        audioUrl: URL.createObjectURL(audio),
        isDedicated: true,
        dedication: dedication.trim() || undefined,
        lyrics: lyrics.trim() || undefined,
        moment: moment.trim() || undefined,
      }, { audio, artwork: artwork || undefined })
      reset()
      setOpen(false)
    } catch {
      setError('No pude leer los archivos. Prueba con otro audio o imagen.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
      >
        <Plus className="size-4" />
        Nueva card
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="creator-title" className="w-full max-w-lg rounded-t-3xl border border-border bg-card p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Tu biblioteca</p>
                <h2 id="creator-title" className="mt-1 text-2xl font-bold text-foreground">Crea una card</h2>
                <p className="mt-1 text-sm text-muted-foreground">Sube una canción y conviértela en un recuerdo.</p>
              </div>
              <button type="button" onClick={() => { reset(); setOpen(false) }} aria-label="Cerrar formulario" className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium text-foreground">
                  Título *
                  <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nuestra canción" className="h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-foreground">
                  Artista o momento
                  <input value={artist} onChange={(event) => setArtist(event.target.value)} placeholder="Para cantar juntos" className="h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </label>
              </div>
              <label className="space-y-1.5 text-sm font-medium text-foreground">
                Dedicatoria
                <textarea value={dedication} onChange={(event) => setDedication(event.target.value)} placeholder="Lo que esta canción me hace pensar en ti..." rows={3} className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium text-foreground">
                  Momento especial
                  <input value={moment} onChange={(event) => setMoment(event.target.value)} placeholder="Nuestro primer viaje" className="h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-foreground">
                  Letra o frase
                  <input value={lyrics} onChange={(event) => setLyrics(event.target.value)} placeholder="Una frase que nos representa" className="h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 transition-colors hover:bg-primary/10">
                  <Music2 className="size-5 shrink-0 text-primary" />
                  <span className="min-w-0 text-sm"><strong className="block truncate">{audio?.name || 'Subir canción *'}</strong><span className="text-xs text-muted-foreground">MP3, WAV, M4A...</span></span>
                  <input required type="file" accept="audio/*" onChange={(event) => setAudio(event.target.files?.[0] || null)} className="sr-only" />
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border p-4 transition-colors hover:bg-secondary">
                  <ImagePlus className="size-5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 text-sm"><strong className="block truncate">{artwork?.name || 'Añadir portada'}</strong><span className="text-xs text-muted-foreground">Opcional</span></span>
                  <input type="file" accept="image/*" onChange={(event) => setArtwork(event.target.files?.[0] || null)} className="sr-only" />
                </label>
              </div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <button type="submit" disabled={saving} className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
                {saving ? 'Guardando...' : 'Guardar en nuestra música'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}