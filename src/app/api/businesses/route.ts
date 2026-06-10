import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const industry = searchParams.get('industry') || ''
  const status = searchParams.get('status') || ''
  const sort = searchParams.get('sort') || 'score'
  const countOnly = searchParams.get('count') === 'true'

  if (countOnly) {
    const count = await prisma.business.count()
    return NextResponse.json({ count })
  }

  const where: any = {}
  if (search) {
    where.OR = [
      { companyName: { contains: search } },
      { industry: { contains: search } },
      { location: { contains: search } },
    ]
  }
  if (industry) where.industry = industry
  if (status) where.status = status

  const orderBy: any = sort === 'score' ? { leadScore: 'desc' }
    : sort === 'reviews' ? { reviewCount: 'desc' }
    : sort === 'name' ? { companyName: 'asc' }
    : { createdAt: 'desc' }

  const businesses = await prisma.business.findMany({
    where,
    orderBy,
    select: {
      id: true, companyName: true, industry: true, location: true,
      phone: true, reviewCount: true, hasWebsite: true, familyOwned: true,
      googleRating: true, yearsInBiz: true, leadScore: true, priority: true,
      status: true, createdAt: true,
    },
  })

  return NextResponse.json({ businesses, total: businesses.length })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { calculateLeadScore, getPriority } = await import('@/lib/scoring')
  const score = calculateLeadScore(body)
  const priority = getPriority(score)

  const business = await prisma.business.create({
    data: { ...body, leadScore: score, priority },
  })
  return NextResponse.json(business, { status: 201 })
}
