import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

// PATCH /api/admin/files/[fileId] — update displayName or downloadPolicy
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { fileId } = await params
  const body = await req.json()
  const data: Record<string, unknown> = {}
  if ('displayName' in body) data.displayName = body.displayName
  if ('downloadPolicy' in body) data.downloadPolicy = body.downloadPolicy
  if ('order' in body) data.order = body.order
  const record = await prisma.lessonFile.update({ where: { id: fileId }, data })
  return NextResponse.json(record)
}

// DELETE /api/admin/files/[fileId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { fileId } = await params
  const record = await prisma.lessonFile.findUnique({ where: { id: fileId } })
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try { await unlink(join(UPLOAD_DIR, record.storedName)) } catch { /* file may not exist */ }
  await prisma.lessonFile.delete({ where: { id: fileId } })
  return NextResponse.json({ ok: true })
}
