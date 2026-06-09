import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const allowed = ['title', 'description', 'status', 'priority', 'dueDate', 'assigneeId', 'businessId']
  const data: any = {}
  for (const k of allowed) if (k in body) data[k] = body[k]
  if (body.status === 'Completed') data.completedAt = new Date()
  const task = await prisma.task.update({ where: { id: params.id }, data })
  return NextResponse.json(task)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.task.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
