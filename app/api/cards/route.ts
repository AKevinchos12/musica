import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase-admin'

const bucket = 'music-files'

function unavailable() {
  return NextResponse.json(
    { error: 'Supabase no está configurado. Añade las variables de entorno.' },
    { status: 503 },
  )
}

export async function GET() {
  if (!isSupabaseConfigured) return unavailable()
  const { data, error } = await supabaseAdmin.from('music_cards').select('*').order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ cards: data })
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured) return unavailable()
  const form = await request.formData()
  const audio = form.get('audio')
  const artwork = form.get('artwork')
  if (!(audio instanceof File)) return NextResponse.json({ error: 'Falta el audio.' }, { status: 400 })

  const id = crypto.randomUUID()
  const audioPath = `${id}/audio-${audio.name}`
  const audioUpload = await supabaseAdmin.storage.from(bucket).upload(audioPath, audio, { contentType: audio.type, upsert: false })
  if (audioUpload.error) return NextResponse.json({ error: audioUpload.error.message }, { status: 500 })

  let artworkPath: string | null = null
  if (artwork instanceof File && artwork.size > 0) {
    artworkPath = `${id}/artwork-${artwork.name}`
    const artworkUpload = await supabaseAdmin.storage.from(bucket).upload(artworkPath, artwork, { contentType: artwork.type, upsert: false })
    if (artworkUpload.error) return NextResponse.json({ error: artworkUpload.error.message }, { status: 500 })
  }

  const publicUrl = (path: string | null) => path ? supabaseAdmin.storage.from(bucket).getPublicUrl(path).data.publicUrl : null
  const card = {
    id,
    title: String(form.get('title') || 'Nuestra canción'),
    artist: String(form.get('artist') || 'Nuestra playlist'),
    dedication: String(form.get('dedication') || '') || null,
    lyrics: String(form.get('lyrics') || '') || null,
    moment: String(form.get('moment') || '') || null,
    audio_url: publicUrl(audioPath),
    artwork_url: publicUrl(artworkPath) || '/images/cover-1.png',
  }
  const { data, error } = await supabaseAdmin.from('music_cards').insert(card).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ card: data }, { status: 201 })
}

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured) return unavailable()
  const form = await request.formData()
  const id = String(form.get('id') || '')
  if (!id) return NextResponse.json({ error: 'Falta el id de la card.' }, { status: 400 })
  const updates: Record<string, string> = {}
  for (const key of ['title', 'artist', 'dedication', 'lyrics', 'moment']) {
    const value = form.get(key)
    if (value !== null) updates[key] = String(value)
  }
  const audio = form.get('audio')
  if (audio instanceof File && audio.size > 0) {
    const audioPath = `${id}/audio-${audio.name}`
    const upload = await supabaseAdmin.storage.from(bucket).upload(audioPath, audio, { contentType: audio.type, upsert: true })
    if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 500 })
    updates.audio_url = supabaseAdmin.storage.from(bucket).getPublicUrl(audioPath).data.publicUrl
  }
  const { data, error } = await supabaseAdmin.from('music_cards').update(updates).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ card: data })
}

export async function DELETE(request: Request) {
  if (!isSupabaseConfigured) return unavailable()
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Falta el id de la card.' }, { status: 400 })
  const { error } = await supabaseAdmin.from('music_cards').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabaseAdmin.storage.from(bucket).remove([`${id}`])
  return NextResponse.json({ ok: true })
}