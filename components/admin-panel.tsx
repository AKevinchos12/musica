'use client'

import { LockKeyhole, LogOut, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'

type AdminPanelProps = {
  isAdmin: boolean
  onLogin: (key: string) => Promise<boolean>
  onLogout: () => void
}

export function AdminPanel({ isAdmin, onLogin, onLogout }: AdminPanelProps) {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setChecking(true)
    setError('')
    const valid = await onLogin(key)
    setChecking(false)
    if (valid) {
      setKey('')
      setOpen(false)
    } else {
      setError('Clave incorrecta o el panel no está configurado.')
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={isAdmin ? 'Abrir panel de administración' : 'Acceso de administrador'} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${isAdmin ? 'border-primary/50 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
        {isAdmin ? <ShieldCheck className="size-3.5" /> : <LockKeyhole className="size-3.5" />}
        <span className="hidden sm:inline">{isAdmin ? 'Admin activo' : 'Admin'}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="admin-title" className="w-full max-w-sm rounded-t-3xl border border-border bg-card p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">Zona privada</p>
                <h2 id="admin-title" className="mt-1 text-2xl font-bold text-foreground">Panel de admin</h2>
                <p className="mt-1 text-sm text-muted-foreground">Gestiona las canciones de vuestra biblioteca.</p>
              </div>
              <button type="button" onClick={() => { setOpen(false); setError('') }} aria-label="Cerrar panel" className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"><X className="size-5" /></button>
            </div>
            {isAdmin ? (
              <button type="button" onClick={() => { onLogout(); setOpen(false) }} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-secondary"><LogOut className="size-4" /> Cerrar sesión admin</button>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <label className="block text-sm font-medium text-foreground">Clave de administrador<input autoFocus required type="password" value={key} onChange={(event) => setKey(event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <button type="submit" disabled={checking} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-60">{checking ? 'Comprobando...' : 'Entrar al panel'}</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
