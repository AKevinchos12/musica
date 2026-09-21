'use client'

import { ArrowDown, Heart, Music2, Play, Sparkles, Volume2 } from 'lucide-react'
import { giftConfig } from '@/lib/config'

export function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="welcome-screen fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      <img
        src="/images/hero.png"
        alt=""
        className="welcome-screen__image absolute inset-0 size-full object-cover"
        crossOrigin="anonymous"
      />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(10,10,14,.94),rgba(10,10,14,.56),rgba(10,10,14,.86))]" />
      <div className="welcome-screen__glow absolute left-1/2 top-1/2 size-[min(72vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="welcome-screen__ring absolute left-1/2 top-1/2 size-[min(74vw,34rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20" />
      <div className="welcome-screen__ring welcome-screen__ring--delayed absolute left-1/2 top-1/2 size-[min(58vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

      <div className="absolute left-6 top-8 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-white/60 sm:left-10 sm:top-10">
        <Music2 className="size-4 text-primary" /> Nuestra música
      </div>

      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center px-6 text-center">
        <div className="animate-fade-in-up mb-7 flex items-center gap-3" style={{ animationDelay: '0.05s' }}>
          <span className="welcome-screen__dot size-2 rounded-full bg-primary" />
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/70">{giftConfig.milestone} juntos</span>
          <span className="welcome-screen__dot size-2 rounded-full bg-primary" />
        </div>

        <div className="animate-fade-in-up relative mb-7 flex size-24 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md" style={{ animationDelay: '0.12s' }}>
          <span className="absolute inset-2 rounded-full border border-primary/50" />
          <Heart className="relative size-9 text-primary" fill="currentColor" />
          <Sparkles className="absolute -right-1 -top-1 size-5 text-white" />
        </div>

        <h1
          className="animate-fade-in-up text-balance text-5xl font-bold leading-[0.98] tracking-tight text-white sm:text-7xl"
          style={{ animationDelay: '0.2s' }}
        >
          {giftConfig.welcomeTitle}
        </h1>

        <p
          className="animate-fade-in-up mt-6 max-w-lg text-pretty text-base leading-relaxed text-white/70 sm:text-lg"
          style={{ animationDelay: '0.3s' }}
        >
          {giftConfig.welcomeSubtitle}
        </p>

        <button
          type="button"
          onClick={onEnter}
          className="welcome-screen__cta animate-fade-in-up mt-9 inline-flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-[0_0_35px_rgba(242,72,48,.35)] transition-all hover:scale-105 hover:shadow-[0_0_48px_rgba(242,72,48,.55)] active:scale-95"
          style={{ animationDelay: '0.42s' }}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-white/20">
            <Play className="ml-0.5 size-4" fill="currentColor" />
          </span>
          Escuchar nuestra historia
          <ArrowDown className="size-4 -rotate-90" />
        </button>

        <div className="animate-fade-in-up mt-12 flex items-center gap-3 text-xs text-white/45" style={{ animationDelay: '0.6s' }}>
          <Volume2 className="size-3.5" />
          <span>Sube el volumen, esto empieza ahora</span>
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-white/40">
        <span className="font-mono text-[9px] uppercase tracking-[0.25em]">Desliza para entrar</span>
        <ArrowDown className="welcome-screen__arrow size-4" />
      </div>
    </div>
  )
}
