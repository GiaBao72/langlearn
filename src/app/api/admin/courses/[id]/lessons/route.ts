import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: courseId } = await params
  const { title, order } = await req.json()
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })
  const lesson = await prisma.lesson.create({
    data: { title, courseId, order: order || 1, published: false },
  })
  return NextResponse.json(lesson, { status: 201 })
}
