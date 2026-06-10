import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, emailNotifications: true, smsNotifications: true }
  })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = (session.user as any).id
  const body = await req.json()
  const allowed = ['name', 'phone', 'emailNotifications', 'smsNotifications']
  const data: any = {}
  for (const k of allowed) if (k in body) data[k] = body[k]
  const user = await prisma.user.update({ where: { id: userId }, data })
  return NextResponse.json(user)
}
