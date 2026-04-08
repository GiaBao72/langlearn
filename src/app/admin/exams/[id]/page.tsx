import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import ExamEditClient from './ExamEditClient'

export const dynamic = 'force-dynamic'

export default async function ExamEditPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')
  const { id } = await params

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      course: { select: { id: true, title: true, level: true } },
      _count: { select: { attempts: true } },
    },
  })
  if (!exam) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ExamEditClient exam={exam as any} />
}
