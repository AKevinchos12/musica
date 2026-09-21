'use client'

import { Heart, Library, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CardCreator } from '@/components/card-creator'
import { AdminPanel } from '@/components/admin-panel'
import { DedicatedCard } from '@/components/dedicated-card'
import { PlayerBar } from '@/components/player-bar'
import { PlayerProvider } from '@/components/player-provider'
import { MusicFeatures } from '@/components/music-features'
import { SearchView } from '@/components/search-view'
import { WelcomeScreen } from '@/components/welcome-screen'
import { giftConfig } from '@/lib/config'
import { dedicatedSongs } from '@/lib/dedicated-songs'
import type { Track } from '@/lib/types'

export function MusicApp() {
  const [entered, setEntered] = useState(false)
  const [songs, setSongs] = useState(dedicatedSongs)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [cloudStatus, setCloudStatus] = useState<'checking' | 'connected' | 'local'>('checking')
  const [adminKey, setAdminKey] = useState('')
  const [hiddenBaseIds, setHiddenBaseIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const saved = window.localStorage.getItem('nuestra-musica-cards')
    const savedFavorites = window.localStorage.getItem('nuestra-musica-favorites')
    const savedHidden = window.localStorage.getItem('nuestra-musica-hidden-base-cards')
    const hiddenIds = savedHidden ? new Set<string>(JSON.parse(savedHidden)) : new Set<string>()
    setHiddenBaseIds(hiddenIds)
    if (saved) {
      try {
        setSongs([...dedicatedSongs.filter((song) => !hiddenIds.has(song.id)), ...JSON.parse(saved)])
      } catch {
        window.localStorage.removeItem('nuestra-musica-cards')
      }
    }
    if (savedFavorites) setFavorites(new Set(JSON.parse(savedFavorites)))
    fetch('/api/cards')
      .then(async (response) => {
        if (!response.ok) throw new Error('local')
        const payload = await response.json() as { cards: Array<Record<string, string>> }
        const cloudSongs: Track[] = payload.cards.map((card) => ({
          id: card.id,
          title: card.title,
          artist: card.artist,
          artwork: card.artwork_url,
          audioUrl: card.audio_url,
          dedication: card.dedication || undefined,
          lyrics: card.lyrics || undefined,
          moment: card.moment || undefined,
          isDedicated: true,
        }))
        setSongs([...dedicatedSongs.filter((song) => !hiddenIds.has(song.id)), ...cloudSongs])
        setCloudStatus('connected')
      })
      .catch(() => setCloudStatus('local'))
  }, [])

  function saveLocalSongs(nextSongs: Track[]) {
    setSongs([...dedicatedSongs, ...nextSongs])
    window.localStorage.setItem('nuestra-musica-cards', JSON.stringify(nextSongs))
  }

  async function addSong(track: Track, files: { audio: File; artwork?: File }) {
    const form = new FormData()
    form.append('title', track.title)
    form.append('artist', track.artist)
    form.append('dedication', track.dedication || '')
    form.append('lyrics', track.lyrics || '')
    form.append('moment', track.moment || '')
    form.append('audio', files.audio)
    if (files.artwork) form.append('artwork', files.artwork)
    const response = await fetch('/api/cards', { method: 'POST', body: form })
    if (response.ok) {
      const payload = await response.json() as { card: Record<string, string> }
      const cloudTrack: Track = {
        id: payload.card.id,
        title: payload.card.title,
        artist: payload.card.artist,
        artwork: payload.card.artwork_url,
        audioUrl: payload.card.audio_url,
        dedication: payload.card.dedication || undefined,
        lyrics: payload.card.lyrics || undefined,
        moment: payload.card.moment || undefined,
        isDedicated: true,
      }
      setSongs((current) => [...current, cloudTrack])
      setCloudStatus('connected')
      return
    }
    if (response.status !== 503) {
      const payload = await response.json().catch(() => ({ error: 'No se pudo guardar la card.' })) as { error?: string }
      throw new Error(payload.error || 'No se pudo guardar la card en Supabase.')
    }
    const localTrack = {
      ...track,
      audioUrl: URL.createObjectURL(files.audio),
      artwork: files.artwork ? URL.createObjectURL(files.artwork) : track.artwork,
    }
    const nextLocalSongs = [...songs.filter((song) => song.id.startsWith('local-')), localTrack]
    saveLocalSongs(nextLocalSongs)
    setCloudStatus('local')
  }

  async function attachAudio(track: Track, file: File) {
    if (!track.id.startsWith('local-')) {
      const form = new FormData()
      form.append('id', track.id)
      form.append('audio', file)
      const response = await fetch('/api/cards', { method: 'PATCH', body: form, headers: { 'x-admin-key': adminKey } })
      if (response.ok) {
        const payload = await response.json() as { card: Record<string, string> }
        setSongs((current) => current.map((song) => song.id === track.id ? { ...song, audioUrl: payload.card.audio_url } : song))
        return
      }
    }
    const audioUrl = URL.createObjectURL(file)
    setSongs((current) => current.map((song) => song.id === track.id ? { ...song, audioUrl } : song))
    setCloudStatus('local')
  }

  function toggleFavorite(id: string) {
    const next = new Set(favorites)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setFavorites(next)
    window.localStorage.setItem('nuestra-musica-favorites', JSON.stringify([...next]))
  }

  async function deleteSong(id: string) {
    if (!window.confirm('¿Eliminar esta canción de nuestra música?')) return
    if (id.startsWith('local-')) {
      saveLocalSongs(songs.filter((song) => song.id.startsWith('local-') && song.id !== id))
    } else {
      const response = await fetch(`/api/cards?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'x-admin-key': adminKey } })
      if (!response.ok) return
      setSongs((current) => current.filter((song) => song.id !== id))
      if (id.startsWith('ded-')) {
        const nextHidden = new Set(hiddenBaseIds).add(id)
        setHiddenBaseIds(nextHidden)
        window.localStorage.setItem('nuestra-musica-hidden-base-cards', JSON.stringify([...nextHidden]))
      }
    }
    if (favorites.has(id)) toggleFavorite(id)
  }

  async function editSong(track: Track) {
    const title = window.prompt('Título de la canción', track.title)
    if (!title?.trim()) return
    const artist = window.prompt('Artista o momento', track.artist) || track.artist
    if (track.id.startsWith('local-')) {
      saveLocalSongs(songs.filter((song) => song.id.startsWith('local-')).map((song) => song.id === track.id ? { ...song, title: title.trim(), artist: artist.trim() } : song))
      return
    }
    const form = new FormData()
    form.append('id', track.id)
    form.append('title', title.trim())
    form.append('artist', artist.trim())
    const response = await fetch('/api/cards', { method: 'PATCH', body: form, headers: { 'x-admin-key': adminKey } })
    if (response.ok || track.id.startsWith('ded-')) {
      setSongs((current) => current.map((song) => song.id === track.id ? { ...song, title: title.trim(), artist: artist.trim() } : song))
    }
  }

  async function loginAdmin(key: string) {
    const response = await fetch('/api/admin/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) })
    if (!response.ok) return false
    const payload = await response.json() as { ok: boolean }
    if (payload.ok) setAdminKey(key)
    return payload.ok
  }

  return (
    <PlayerProvider>
      {!entered && <WelcomeScreen onEnter={() => setEntered(true)} />}

      <div className="min-h-screen pb-40">
        {/* Cabecera */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Library className="size-4" />
              </span>
            </div>
            <span className="flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              <span className={`size-1.5 rounded-full ${cloudStatus === 'connected' ? 'bg-emerald-400' : 'bg-primary'}`} />
              {cloudStatus === 'connected' ? 'En la nube' : giftConfig.milestone}
            </span>
            <AdminPanel isAdmin={Boolean(adminKey)} onLogin={loginAdmin} onLogout={() => setAdminKey('')} />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4">
          {/* Dedicatoria / nuestra historia */}
          <section className="relative overflow-hidden py-12 sm:py-16" aria-labelledby="dedicatoria-titulo">
            <div className="relative z-10 max-w-3xl">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-primary">
                <Sparkles className="size-3.5" /> {giftConfig.startDate} · para siempre
              </p>
              <h1
              id="dedicatoria-titulo"
                className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
              >{giftConfig.welcomeTitle}</h1>
              <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{giftConfig.dedication}</p>
              <p className="mt-6 flex items-center gap-2 text-sm font-medium text-foreground"><Heart className="size-4 text-primary" fill="currentColor" /> {giftConfig.signature}, {giftConfig.fromName}</p>
            </div>
            <div className="pointer-events-none absolute -right-10 top-8 size-48 rounded-full bg-primary/10 blur-3xl sm:size-72" />
          </section>

          {/* Canciones dedicadas */}
          <section className="py-6" aria-labelledby="dedicadas-titulo">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Elegidas a mano</p>
                <h2
                id="dedicadas-titulo"
                  className="mt-1 text-2xl font-bold text-foreground sm:text-3xl"
                >Nuestra música</h2>
              </div>
              <CardCreator onCreate={addSong} />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {songs.map((track) => (
                <DedicatedCard key={track.id} track={track} queue={songs} isFavorite={favorites.has(track.id)} isAdmin={Boolean(adminKey)} onToggleFavorite={() => toggleFavorite(track.id)} onEdit={() => editSong(track)} onDelete={() => deleteSong(track.id)} onAttachAudio={(file) => void attachAudio(track, file)} />
              ))}
            </div>
          </section>

          <MusicFeatures songs={songs} favorites={favorites} onToggleFavorite={toggleFavorite} onDelete={deleteSong} onEdit={editSong} />

          {/* Separador */}
          <div className="my-10 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <Heart className="size-4 text-primary" fill="currentColor" />
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Buscador global */}
          <section className="pb-16">
            <SearchView />
          </section>
        </main>
      </div>

      <PlayerBar />
    </PlayerProvider>
  )
}
