import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const channel = searchParams.get('channel') || 'general'
  try {
    const messages = await prisma.message.findMany({
      where: { channel },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: { sender: { select: { id: true, name: true, avatar: true } } },
    })
    return NextResponse.json({ messages })
  } catch {
    return NextResponse.json({ messages: [] })
  }
}

export async function POST(req: NextRequest) {
  const { content, channel = 'general', senderName = 'User' } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  // Find or create a default user
  let user = await prisma.user.findFirst()
  if (!user) {
    user = await prisma.user.create({ data: { email: 'user@sk-freelancing.com', name: senderName, password: 'placeholder' } })
  }

  const message = await prisma.message.create({
    data: { content: content.trim(), channel, userId: user.id },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  })
  return NextResponse.json(message, { status: 201 })
}
