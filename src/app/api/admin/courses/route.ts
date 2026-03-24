import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lessons: true } } },
  })
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, language, level, description, published } = await req.json()
  if (!title || !language) return NextResponse.json({ error: 'Tên và ngôn ngữ là bắt buộc' }, { status: 400 })

  const course = await prisma.course.create({
    data: { title, language, level: level || 'A1', description, published: published ?? false },
  })
  return NextResponse.json(course, { status: 201 })
}
