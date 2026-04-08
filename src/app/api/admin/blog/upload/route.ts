import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Upload file → trả về parsed content, KHÔNG tạo DB record
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Không có file' }, { status: 400 })
  }

  const name = file.name.toLowerCase()
  if (!name.endsWith('.txt') && !name.endsWith('.md')) {
    return NextResponse.json({ error: 'Chỉ hỗ trợ file .txt hoặc .md' }, { status: 400 })
  }

  const text = await file.text()
  const lines = text.split('\n')

  const titleLine = lines.find(l => l.trim().length > 0) ?? ''
  const title = titleLine.replace(/^#+\s*/, '').trim()

  if (!title) {
    return NextResponse.json({ error: 'File phải có tiêu đề ở dòng đầu' }, { status: 400 })
  }

  const titleIndex = lines.indexOf(titleLine)
  const content = lines.slice(titleIndex + 1).join('\n').trim()

  if (!content) {
    return NextResponse.json({ error: 'File không có nội dung' }, { status: 400 })
  }

  const excerpt = content
    .split('\n')
    .map(l => l.trim())
    .find(l => l.length > 30 && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('-'))
    ?.substring(0, 200) ?? ''

  const slug = slugify(title)

  // Trả về parsed data — client tự điền vào form, không lưu DB
  return NextResponse.json({ title, slug, content, excerpt }, { status: 200 })
}
