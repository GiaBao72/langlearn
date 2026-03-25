import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const lessons = await prisma.lesson.findMany({
    include: { course: { select: { title: true } } },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ lessons })
}
