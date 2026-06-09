import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { id: true, name: true } },
        business: { select: { id: true, companyName: true } },
      },
    })
    return NextResponse.json({ activities })
  } catch {
    return NextResponse.json({ activities: [] })
  }
}

export async function POST(req: NextRequest) {
  const { type, description, businessId, metadata } = await req.json()
  const activity = await prisma.activity.create({
    data: { type, description, businessId: businessId || null, metadata: metadata ? JSON.stringify(metadata) : null }
  })
  return NextResponse.json(activity)
}
