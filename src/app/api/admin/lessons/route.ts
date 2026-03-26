import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const lessons = await prisma.lesson.findMany({
    include: { course: { select: { title: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ lessons })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { courseId, title, content, order, published } = await req.json()
  if (!courseId || !title) return NextResponse.json({ error: 'courseId và title là bắt buộc' }, { status: 400 })

  const lesson = await prisma.lesson.create({
    data: { courseId, title, content: content ?? '', order: order ?? 1, published: published ?? false },
  })
  return NextResponse.json(lesson, { status: 201 })
}
