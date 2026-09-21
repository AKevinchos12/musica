'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Track } from '@/lib/types'

type PlayerContextValue = {
  current: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  shuffle: boolean
  repeat: boolean
  listenHistory: Record<string, number>
  /** error de carga del audio (p. ej. MP3 que aún no has subido) */
  loadError: boolean
  play: (track: Track, queue?: Track[]) => void
  toggle: () => void
  next: () => void
  prev: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  toggleRepeat: () => void
}

const PlayerContext = createContext<PlayerContextValue | null>(null)

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer debe usarse dentro de <PlayerProvider>')
  return ctx
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [current, setCurrent] = useState<Track | null>(null)
  const [queue, setQueue] = useState<Track[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loadError, setLoadError] = useState(false)
  const [volume, setVolumeState] = useState(0.75)
  const [isMuted, setIsMuted] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [listenHistory, setListenHistory] = useState<Record<string, number>>({})

  useEffect(() => {
    const savedVolume = window.localStorage.getItem('nuestra-musica-volume')
    if (savedVolume) setVolumeState(Math.min(1, Math.max(0, Number(savedVolume))))
    const savedHistory = window.localStorage.getItem('nuestra-musica-history')
    if (savedHistory) {
      try {
        setListenHistory(JSON.parse(savedHistory))
      } catch {
        window.localStorage.removeItem('nuestra-musica-history')
      }
    }
  }, [])

  const play = useCallback(
    (track: Track, nextQueue?: Track[]) => {
      setLoadError(false)
      if (nextQueue) setQueue(nextQueue)
      else if (queue.length === 0) setQueue([track])

      const audio = audioRef.current
      if (!audio) return

      if (current?.id === track.id) {
        // misma canción: alterna play/pausa
        if (audio.paused) void audio.play()
        else audio.pause()
        return
      }

      setCurrent(track)
      setListenHistory((history) => {
        const nextHistory = { ...history, [track.id]: (history[track.id] || 0) + 1 }
        window.localStorage.setItem('nuestra-musica-history', JSON.stringify(nextHistory))
        return nextHistory
      })
      audio.src = track.audioUrl
      audio.currentTime = 0
      setCurrentTime(0)
      setDuration(0)
      void audio.play().catch(() => setLoadError(true))
    },
    [current?.id, queue.length],
  )

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !current) return
    if (audio.paused) void audio.play().catch(() => setLoadError(true))
    else audio.pause()
  }, [current])

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!current || queue.length === 0) return
      const idx = queue.findIndex((t) => t.id === current.id)
      if (idx === -1) return
      const nextIdx = (idx + dir + queue.length) % queue.length
      play(queue[nextIdx], queue)
    },
    [current, queue, play],
  )

  const next = useCallback(() => step(1), [step])
  const prev = useCallback(() => step(-1), [step])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    setCurrentTime(time)
  }, [])

  const setVolume = useCallback((nextVolume: number) => {
    const next = Math.min(1, Math.max(0, nextVolume))
    setVolumeState(next)
    setIsMuted(next === 0)
    if (audioRef.current) audioRef.current.volume = next
    window.localStorage.setItem('nuestra-musica-volume', String(next))
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    audio.muted = nextMuted
  }, [isMuted])

  const toggleShuffle = useCallback(() => setShuffle((value) => !value), [])
  const toggleRepeat = useCallback(() => setRepeat((value) => !value), [])

  // Listeners del elemento <audio>
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume
    audio.muted = isMuted

    const onTime = () => setCurrentTime(audio.currentTime)
    const onMeta = () => setDuration(audio.duration || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => {
      if (repeat && current) play(current, queue)
      else step(1)
    }
    const onError = () => {
      setLoadError(true)
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [current, isMuted, play, queue, repeat, step, volume])

  const shuffledStep = useCallback(
    (dir: 1 | -1) => {
      if (!shuffle || queue.length < 2) {
        if (dir === 1) next()
        else prev()
        return
      }
      const options = queue.filter((track) => track.id !== current?.id)
      const randomTrack = options[Math.floor(Math.random() * options.length)]
      if (randomTrack) play(randomTrack, queue)
    },
    [current?.id, next, play, prev, queue, shuffle],
  )

  const value = useMemo<PlayerContextValue>(
    () => ({
      current,
      isPlaying,
      currentTime,
      duration,
      loadError,
      volume,
      isMuted,
      shuffle,
      repeat,
      listenHistory,
      play,
      toggle,
      next: shuffle ? () => shuffledStep(1) : next,
      prev: shuffle ? () => shuffledStep(-1) : prev,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      toggleRepeat,
    }),
    [current, isPlaying, currentTime, duration, loadError, volume, isMuted, shuffle, repeat, listenHistory, play, toggle, next, prev, seek, setVolume, toggleMute, toggleShuffle, toggleRepeat, shuffledStep],
  )

  return (
    <PlayerContext.Provider value={value}>
      {children}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
    </PlayerContext.Provider>
  )
}
