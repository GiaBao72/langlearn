import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { isDemo: true, published: true },
    orderBy: { level: 'asc' },
    include: {
      _count: { select: { lessons: true } },
    },
  })
  return NextResponse.json(courses)
}
