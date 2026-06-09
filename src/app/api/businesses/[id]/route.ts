import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const business = await prisma.business.findUnique({
    where: { id: params.id },
    include: { analysis: true, callLogs: { orderBy: { calledAt: 'desc' }, take: 10 } },
  })
  if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(business)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const allowed = ['status', 'notes', 'email', 'phone', 'priority', 'nextFollowUp', 'lastContact', 'website']
  const data: any = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }
  if (Object.keys(data).length === 0) return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  if ('status' in data) data.lastContact = new Date()
  const business = await prisma.business.update({ where: { id: params.id }, data })
  return NextResponse.json(business)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.business.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
