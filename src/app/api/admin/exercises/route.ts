import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lessonId = searchParams.get('lessonId')
  const exercises = await prisma.exercise.findMany({
    where: lessonId ? { lessonId } : {},
    orderBy: { order: 'asc' },
  })
  return NextResponse.json({ exercises })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

  const { lessonId, type, question, points, data, order } = await req.json()
  const exercise = await prisma.exercise.create({
    data: {
      lessonId,
      type,
      question,
      points: points || 10,
      data,
      order: order || 0,
    },
  })
  return NextResponse.json({ exercise }, { status: 201 })
}
