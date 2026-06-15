import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createReadStream, statSync } from 'fs'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

// GET /api/files/[fileId] — serve file with policy check
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params
  const record = await prisma.lessonFile.findUnique({ where: { id: fileId } })
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (record.downloadPolicy !== 'public') {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  }

  const filePath = join(UPLOAD_DIR, record.storedName)
  try {
    statSync(filePath)
  } catch {
    return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
  }

  // Stream the file
  const stream = createReadStream(filePath)
  const headers: Record<string, string> = {
    'Content-Type': record.mimeType,
    'Content-Length': String(record.sizeBytes),
    'Content-Disposition': `inline; filename="${record.displayName}"`,
  }

  // @ts-expect-error Node.js stream to Response
  return new NextResponse(stream, { headers })
}
