import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/courses — list all courses with lesson count
export async function GET(_req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { lessons: true } },
    },
  })

  return NextResponse.json(courses)
}

// POST /api/admin/courses — create course
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, language, level, description, published } = await req.json()

  if (!title || !language || !level) {
    return NextResponse.json({ error: 'title, language, level are required' }, { status: 400 })
  }

  const course = await prisma.course.create({
    data: { title, language, level, description, published: published ?? false },
  })

  return NextResponse.json(course, { status: 201 })
}
