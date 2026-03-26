import Navbar from '@/components/Navbar'
import { prisma } from '@/lib/prisma'
import CoursesClient from './CoursesClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Khóa học — LangLearn',
  description: 'Khám phá các khóa học ngoại ngữ từ A1 đến C1. Học tiếng Đức và nhiều ngôn ngữ khác với phương pháp Spaced Repetition.',
}

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { lessons: true } } },
  })

  return <><Navbar /><CoursesClient courses={courses} /></>
}
