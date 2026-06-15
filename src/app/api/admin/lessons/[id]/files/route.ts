import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomBytes } from 'crypto'

export const maxDuration = 60

const UPLOAD_DIR = join(process.cwd(), 'uploads')

// GET /api/admin/lessons/[id]/files — list files
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const files = await prisma.lessonFile.findMany({ where: { lessonId: id }, orderBy: { order: 'asc' } })
  return NextResponse.json(files)
}

// POST /api/admin/lessons/[id]/files — upload file
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id: lessonId } = await params

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const displayName = (formData.get('displayName') as string) || ''
  const downloadPolicy = (formData.get('downloadPolicy') as string) || 'logged_in'

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop() ?? 'bin'
  const storedName = `${randomBytes(16).toString('hex')}.${ext}`

  await mkdir(UPLOAD_DIR, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(UPLOAD_DIR, storedName), buffer)

  const count = await prisma.lessonFile.count({ where: { lessonId } })
  const record = await prisma.lessonFile.create({
    data: {
      lessonId,
      displayName: displayName || file.name,
      storedName,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      downloadPolicy,
      order: count,
    },
  })
  return NextResponse.json(record, { status: 201 })
}
