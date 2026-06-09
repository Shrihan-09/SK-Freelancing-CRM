import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [locations, byCity] = await Promise.all([
    prisma.location.findMany({ orderBy: { city: 'asc' } }),
    prisma.business.groupBy({ by: ['city', 'state'], _count: { id: true } }),
  ])
  return NextResponse.json({ locations, byCity })
}

export async function POST(req: NextRequest) {
  const { city, state = 'NJ', county } = await req.json()
  if (!city) return NextResponse.json({ error: 'city required' }, { status: 400 })
  const loc = await prisma.location.upsert({
    where: { city_state: { city, state } },
    update: {},
    create: { city, state, county },
  })
  return NextResponse.json(loc)
}
