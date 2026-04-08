import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// PATCH /api/admin/exams/[id]/questions/reorder
// body: { order: ['qid1','qid2',...] }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: examId } = await params
  const { order } = await req.json() as { order: string[] }
  if (!Array.isArray(order)) return NextResponse.json({ error: 'order must be array' }, { status: 400 })

  await prisma.$transaction(
    order.map((qid, i) =>
      prisma.examQuestion.updateMany({
        where: { id: qid, examId },
        data: { order: i },
      })
    )
  )
  return NextResponse.json({ ok: true })
}
