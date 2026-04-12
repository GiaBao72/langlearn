import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'


// GET /api/admin/courses/[id]/enrollments — list enrolled users
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const enrollments = await prisma.courseEnrollment.findMany({
    where: { courseId: id },
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  return NextResponse.json(enrollments)
}

// POST /api/admin/courses/[id]/enrollments — enroll user(s)
// body: { userId: string } | { userIds: string[] }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: courseId } = await params

  let body: any

  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }

  const userIds: string[] = body.userIds ?? (body.userId ? [body.userId] : [])
  if (userIds.length === 0) return NextResponse.json({ error: 'userId or userIds required' }, { status: 400 })

  // Check course exists
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  // Upsert all enrollments (ignore duplicates)
  const created = await Promise.allSettled(
    userIds.map(uid =>
      prisma.courseEnrollment.upsert({
        where: { userId_courseId: { userId: uid, courseId } },
        create: { id: crypto.randomUUID(), userId: uid, courseId },
        update: {},
      })
    )
  )

  const succeeded = created.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ enrolled: succeeded })
}

// DELETE /api/admin/courses/[id]/enrollments — unenroll user(s)
// body: { userId: string } | { userIds: string[] }
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: courseId } = await params

  let body: any

  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
  const userIds: string[] = body.userIds ?? (body.userId ? [body.userId] : [])
  if (userIds.length === 0) return NextResponse.json({ error: 'userId or userIds required' }, { status: 400 })

  await prisma.courseEnrollment.deleteMany({
    where: { courseId, userId: { in: userIds } },
  })

  return NextResponse.json({ ok: true })
}