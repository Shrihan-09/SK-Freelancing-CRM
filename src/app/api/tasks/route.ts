import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || ''
  const businessId = searchParams.get('businessId') || ''

  const where: any = {}
  if (status) where.status = status
  if (businessId) where.businessId = businessId

  try {
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        business: { select: { id: true, companyName: true, industry: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true } },
      },
    })
    return NextResponse.json({ tasks })
  } catch {
    return NextResponse.json({ tasks: [] })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, description, status = 'Backlog', priority = 'Medium', businessId, dueDate } = body
  if (!title?.trim()) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const task = await prisma.task.create({
    data: { title: title.trim(), description, status, priority, businessId: businessId || null, dueDate: dueDate ? new Date(dueDate) : null },
    include: {
      business: { select: { id: true, companyName: true } },
    },
  })

  // Log activity
  try {
    await prisma.activity.create({
      data: { type: 'task_created', description: `Task created: ${title}`, metadata: JSON.stringify({ taskId: task.id }) }
    })
  } catch {}

  return NextResponse.json(task, { status: 201 })
}
