import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { businesses: true, tasks: true } }
      }
    })
    return NextResponse.json({ locations })
  } catch {
    return NextResponse.json({ locations: [] })
  }
}

export async function POST(req: NextRequest) {
  const { name, description, address, city, state = 'NJ', country = 'USA', isDefault } = await req.json()
  if (!name?.trim() || !city?.trim()) {
    return NextResponse.json({ error: 'Name and city are required' }, { status: 400 })
  }
  const existing = await prisma.location.findUnique({ where: { name: name.trim() } })
  if (existing) return NextResponse.json({ error: 'Location already exists' }, { status: 409 })
  if (isDefault) await prisma.location.updateMany({ data: { isDefault: false } })
  const location = await prisma.location.create({
    data: { name: name.trim(), description, address, city: city.trim(), state, country, isDefault: isDefault || false }
  })
  return NextResponse.json(location, { status: 201 })
}
