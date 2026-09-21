import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const configuredKey = process.env.ADMIN_KEY
  if (!configuredKey) return NextResponse.json({ ok: false, error: 'ADMIN_KEY no está configurada.' }, { status: 503 })
  const body = await request.json().catch(() => ({})) as { key?: string }
  return NextResponse.json({ ok: body.key === configuredKey }, { status: body.key === configuredKey ? 200 : 401 })
}
