import type { Track } from '@/lib/types'

type ITunesResult = {
  trackId: number
  trackName: string
  artistName: string
  collectionName?: string
  artworkUrl100?: string
  previewUrl?: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const term = searchParams.get('term')?.trim()

  if (!term) {
    return Response.json({ results: [] })
  }

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
      term,
    )}&media=music&entity=song&limit=25`

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      // cachea búsquedas idénticas durante una hora
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return Response.json({ results: [], error: 'search_failed' }, { status: 502 })
    }

    const data = (await res.json()) as { results: ITunesResult[] }

    const results: Track[] = data.results
      .filter((r) => r.previewUrl && r.artworkUrl100)
      .map((r) => ({
        id: String(r.trackId),
        title: r.trackName,
        artist: r.artistName,
        album: r.collectionName,
        // sube la resolución de la carátula
        artwork: r.artworkUrl100!.replace('100x100bb', '300x300bb'),
        audioUrl: r.previewUrl!,
        isPreview: true,
      }))

    return Response.json({ results })
  } catch {
    return Response.json({ results: [], error: 'search_failed' }, { status: 500 })
  }
}
