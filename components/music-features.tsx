'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Edit3,
  Heart,
  ListMusic,
  Palette,
  Play,
  Plus,
  Quote,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { usePlayer } from '@/components/player-provider'
import type { Track } from '@/lib/types'

type Playlist = { id: string; name: string; trackIds: string[] }
type Theme = 'ember' | 'ocean' | 'gold'

type MusicFeaturesProps = {
  songs: Track[]
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (track: Track) => void
}

const themes: { id: Theme; label: string; color: string }[] = [
  { id: 'ember', label: 'Atardecer', color: '#f0523d' },
  { id: 'ocean', label: 'Noche azul', color: '#39a7c7' },
  { id: 'gold', label: 'Luz dorada', color: '#e4a83d' },
]

export function MusicFeatures({ songs, favorites, onToggleFavorite, onDelete, onEdit }: MusicFeaturesProps) {
  const { play, listenHistory } = usePlayer()
  const [panel, setPanel] = useState<'favorites' | 'playlists' | 'stats' | 'themes' | null>(null)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [playlistName, setPlaylistName] = useState('')
  const [theme, setTheme] = useState<Theme>('ember')
  const [storyOpen, setStoryOpen] = useState(false)
  const [presentation, setPresentation] = useState(false)
  const [storyIndex, setStoryIndex] = useState(0)

  const favoriteTracks = useMemo(() => songs.filter((song) => favorites.has(song.id)), [favorites, songs])
  const storyTracks = useMemo(() => songs.filter((song) => song.moment || song.dedication || song.lyrics), [songs])
  const activeStoryTrack = storyTracks[storyIndex]
  const totalListens = Object.values(listenHistory).reduce((sum, value) => sum + value, 0)
  const topTrack = [...songs].sort((a, b) => (listenHistory[b.id] || 0) - (listenHistory[a.id] || 0))[0]

  useEffect(() => {
    const savedPlaylists = window.localStorage.getItem('nuestra-musica-playlists')
    const savedTheme = window.localStorage.getItem('nuestra-musica-theme') as Theme | null
    if (savedPlaylists) {
      try {
        setPlaylists(JSON.parse(savedPlaylists))
      } catch {
        window.localStorage.removeItem('nuestra-musica-playlists')
      }
    }
    if (savedTheme && themes.some((item) => item.id === savedTheme)) setTheme(savedTheme)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('nuestra-musica-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!presentation || storyTracks.length < 1) return
    const timer = window.setInterval(() => setStoryIndex((index) => (index + 1) % storyTracks.length), 7000)
    return () => window.clearInterval(timer)
  }, [presentation, storyTracks.length])

  useEffect(() => {
    if (presentation && activeStoryTrack) play(activeStoryTrack, storyTracks)
  }, [presentation, storyIndex])

  function savePlaylists(next: Playlist[]) {
    setPlaylists(next)
    window.localStorage.setItem('nuestra-musica-playlists', JSON.stringify(next))
  }

  function createPlaylist() {
    const name = playlistName.trim()
    if (!name) return
    savePlaylists([...playlists, { id: `playlist-${Date.now()}`, name, trackIds: favoriteTracks.map((track) => track.id) }])
    setPlaylistName('')
  }

  function openStory() {
    setStoryIndex(0)
    setStoryOpen(true)
  }

  function nextStory(step: number) {
    setStoryIndex((index) => (index + step + storyTracks.length) % storyTracks.length)
  }

  const panelTitle = useMemo(() => ({ favorites: 'Tus favoritas', playlists: 'Tus playlists', stats: 'Nuestra escucha', themes: 'Ambientes' }[panel || 'favorites']), [panel])

  return (
    <>
      <section className="music-tools" aria-label="Herramientas de nuestra música">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Más para nosotros</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">Hazla tuya</h2>
          </div>
          <Sparkles className="size-5 text-primary" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button type="button" onClick={() => setPanel(panel === 'favorites' ? null : 'favorites')} className="music-tool-button">
            <Heart className="size-5" fill={favoriteTracks.length ? 'currentColor' : 'none'} /> <span>Favoritas</span><b>{favoriteTracks.length}</b>
          </button>
          <button type="button" onClick={() => setPanel(panel === 'playlists' ? null : 'playlists')} className="music-tool-button"><ListMusic className="size-5" /><span>Playlists</span><b>{playlists.length}</b></button>
          <button type="button" onClick={() => setPanel(panel === 'stats' ? null : 'stats')} className="music-tool-button"><BarChart3 className="size-5" /><span>Estadísticas</span></button>
          <button type="button" onClick={() => setPanel(panel === 'themes' ? null : 'themes')} className="music-tool-button"><Palette className="size-5" /><span>Ambiente</span></button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={openStory} disabled={!storyTracks.length} className="music-mode-button"><Quote className="size-4" /> Nuestra historia</button>
          <button type="button" onClick={() => { setPresentation(true); setStoryIndex(0) }} disabled={!storyTracks.length} className="music-mode-button"><Clapperboard className="size-4" /> Modo presentación</button>
        </div>

        {panel && (
          <div className="music-panel mt-4">
            <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold">{panelTitle}</h3><button type="button" onClick={() => setPanel(null)} aria-label="Cerrar panel"><X className="size-4" /></button></div>
            {panel === 'favorites' && (
              favoriteTracks.length ? <div className="space-y-1">{favoriteTracks.map((track) => <MiniTrack key={track.id} track={track} onPlay={() => play(track, favoriteTracks)} onRemove={() => onToggleFavorite(track.id)} />)}</div> : <EmptyState text="Marca el corazón de una canción para verla aquí." />
            )}
            {panel === 'playlists' && (
              <div className="space-y-4">
                <div className="flex gap-2"><input value={playlistName} onChange={(event) => setPlaylistName(event.target.value)} placeholder="Nombre de la playlist" className="h-10 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /><button type="button" onClick={createPlaylist} aria-label="Crear playlist" className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Plus className="size-4" /></button></div>
                {playlists.length ? playlists.map((playlist) => { const tracks = songs.filter((track) => playlist.trackIds.includes(track.id)); return <div key={playlist.id} className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2"><button type="button" onClick={() => tracks.length && play(tracks[0], tracks)} className="flex items-center gap-2 text-sm font-medium"><Play className="size-4 text-primary" fill="currentColor" /> {playlist.name} <span className="text-xs text-muted-foreground">{tracks.length} canciones</span></button><button type="button" onClick={() => savePlaylists(playlists.filter((item) => item.id !== playlist.id))} aria-label={`Eliminar ${playlist.name}`} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button></div> }) : <EmptyState text="Crea una playlist con tus canciones favoritas." />}
              </div>
            )}
            {panel === 'stats' && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><Stat label="Canciones" value={songs.length} /><Stat label="Escuchas" value={totalListens} /><Stat label="Favoritas" value={favoriteTracks.length} /><div className="col-span-2 rounded-xl bg-secondary p-4 sm:col-span-3"><p className="text-xs text-muted-foreground">La más escuchada</p><p className="mt-1 font-semibold">{topTrack?.title || 'Todavía estamos empezando'}</p></div></div>}
            {panel === 'themes' && <div className="grid grid-cols-3 gap-2">{themes.map((item) => <button type="button" key={item.id} onClick={() => setTheme(item.id)} className={`rounded-xl border p-3 text-left text-sm transition-colors ${theme === item.id ? 'border-primary bg-primary/10' : 'border-border bg-secondary'}`}><span className="mb-2 block size-6 rounded-full" style={{ backgroundColor: item.color }} /><span className="font-medium">{item.label}</span></button>)}</div>}
          </div>
        )}
      </section>

      {storyOpen && activeStoryTrack && <StoryModal track={activeStoryTrack} index={storyIndex} total={storyTracks.length} onPlay={() => play(activeStoryTrack, storyTracks)} onClose={() => setStoryOpen(false)} onNext={() => nextStory(1)} onPrev={() => nextStory(-1)} />}
      {presentation && activeStoryTrack && <StoryModal presentation track={activeStoryTrack} index={storyIndex} total={storyTracks.length} onPlay={() => play(activeStoryTrack, storyTracks)} onClose={() => setPresentation(false)} onNext={() => nextStory(1)} onPrev={() => nextStory(-1)} />}
    </>
  )
}

function MiniTrack({ track, onPlay, onRemove }: { track: Track; onPlay: () => void; onRemove: () => void }) {
  return <div className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary"><img src={track.artwork} alt="" className="size-9 rounded-lg object-cover" /><button type="button" onClick={onPlay} className="min-w-0 flex-1 truncate text-left text-sm font-medium">{track.title}<span className="ml-2 text-xs font-normal text-muted-foreground">{track.artist}</span></button><button type="button" onClick={onRemove} aria-label={`Quitar ${track.title}`} className="p-1 text-primary"><Heart className="size-4" fill="currentColor" /></button></div>
}

function EmptyState({ text }: { text: string }) { return <p className="rounded-xl bg-secondary p-4 text-sm text-muted-foreground">{text}</p> }
function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-xl bg-secondary p-4"><p className="text-2xl font-bold text-primary">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div> }

function StoryModal({ track, index, total, presentation = false, onPlay, onClose, onNext, onPrev }: { track: Track; index: number; total: number; presentation?: boolean; onPlay: () => void; onClose: () => void; onNext: () => void; onPrev: () => void }) {
  return <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md ${presentation ? 'story-presentation' : ''}`}><div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/15 bg-card shadow-2xl"><img src={track.artwork} alt="" className="absolute inset-0 size-full object-cover opacity-20 blur-2xl" /><div className="relative grid gap-6 p-6 sm:grid-cols-[minmax(0,0.8fr)_1fr] sm:p-10"><div className="relative aspect-square overflow-hidden rounded-2xl"><img src={track.artwork} alt={`Portada de ${track.title}`} className="size-full object-cover" /></div><div className="flex flex-col justify-center"><div className="mb-8 flex items-center justify-between"><span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Momento {index + 1} / {total}</span><button type="button" onClick={onClose} aria-label="Cerrar historia" className="rounded-full p-2 text-white/70 hover:bg-white/10"><X className="size-5" /></button></div><p className="text-sm text-primary">{track.moment || 'Una canción para nosotros'}</p><h2 className="mt-2 text-3xl font-bold text-white sm:text-5xl">{track.title}</h2><p className="mt-2 text-white/60">{track.artist}</p><p className="mt-8 text-lg leading-relaxed text-white/85">“{track.lyrics || track.dedication || 'Esta canción también forma parte de nuestra historia.'}”</p><div className="mt-8 flex items-center gap-3"><button type="button" onClick={onPrev} aria-label="Momento anterior" className="rounded-full border border-white/20 p-3 text-white/80 hover:bg-white/10"><ChevronLeft className="size-5" /></button><button type="button" onClick={onPlay} className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"><Play className="size-4" fill="currentColor" /> Escuchar</button><button type="button" onClick={onNext} aria-label="Siguiente momento" className="rounded-full border border-white/20 p-3 text-white/80 hover:bg-white/10"><ChevronRight className="size-5" /></button></div></div></div></div></div>
}
