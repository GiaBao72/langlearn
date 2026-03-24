import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import mammoth from 'mammoth'
import sanitizeHtml from 'sanitize-html'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  if (!file.name.endsWith('.docx')) {
    return NextResponse.json({ error: 'Only .docx files supported' }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await mammoth.convertToHtml({ buffer })

  // Sanitize — critical to prevent XSS
  const clean = sanitizeHtml(result.value, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height'],
    },
  })

  return NextResponse.json({
    html: clean,
    warnings: result.messages.map(m => m.message),
  })
}
