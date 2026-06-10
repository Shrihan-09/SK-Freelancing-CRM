import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
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
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content, channel = 'general' } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })

  const message = await prisma.message.create({
    data: { content: content.trim(), channel, userId: session.user.id },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  })
  return NextResponse.json(message, { status: 201 })
}
