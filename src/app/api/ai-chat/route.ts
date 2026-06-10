import { NextRequest, NextResponse } from 'next/server'
import { generateWithGemini } from '@/lib/gemini'

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()
  if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })
  const text = await generateWithGemini(prompt)
  return NextResponse.json({ text })
}
