import { notFound, redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'
import LessonEditClient from './LessonEditClient'

async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) return null
  try {
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export default async function LessonEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')

  const { id } = await params

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      exercises: { orderBy: { order: 'asc' } },
      course: { select: { id: true, title: true } },
    },
  })

  if (!lesson) notFound()

  return <LessonEditClient lesson={lesson} />
}
