import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const allowed = ['name', 'description', 'address', 'city', 'state', 'country', 'isDefault']
  const data: any = {}
  for (const k of allowed) if (k in body) data[k] = body[k]
  if (data.isDefault) await prisma.location.updateMany({ data: { isDefault: false } })
  const location = await prisma.location.update({ where: { id: params.id }, data })
  return NextResponse.json(location)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.business.updateMany({ where: { locationId: params.id }, data: { locationId: null } })
  await prisma.task.updateMany({ where: { locationId: params.id }, data: { locationId: null } })
  await prisma.location.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
