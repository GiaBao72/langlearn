import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import NewExamClient from './NewExamClient'

export const dynamic = 'force-dynamic'

export default async function NewExamPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const courses = await prisma.course.findMany({
    orderBy: { title: 'asc' },
    select: { id: true, title: true, level: true },
  })

  return <NewExamClient courses={courses} />
}
