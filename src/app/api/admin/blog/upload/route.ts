import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

  if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
    return NextResponse.json({ error: 'Chỉ hỗ trợ file .txt hoặc .md' }, { status: 400 })
  }

  const text = await file.text()
  const lines = text.split('\n')

  // Dòng đầu tiên không trống = tiêu đề
  const titleLine = lines.find(l => l.trim().length > 0) ?? ''
  const title = titleLine.replace(/^#+\s*/, '').trim() // bỏ ## nếu có
  
  if (!title) {
    return NextResponse.json({ error: 'File phải có tiêu đề ở dòng đầu' }, { status: 400 })
  }

  // Nội dung = phần còn lại sau dòng tiêu đề
  const titleIndex = lines.indexOf(titleLine)
  const content = lines.slice(titleIndex + 1).join('\n').trim()

  if (!content) {
    return NextResponse.json({ error: 'File không có nội dung' }, { status: 400 })
  }

  // Excerpt = đoạn văn đầu tiên có ý nghĩa (không phải heading)
  const excerpt = content
    .split('\n')
    .map(l => l.trim())
    .find(l => l.length > 30 && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('-'))
    ?.substring(0, 200) ?? ''

  // Tạo slug unique
  const baseSlug = slugify(title)
  const existing = await prisma.blogPost.findUnique({ where: { slug: baseSlug } })
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      published: false, // nháp, admin review rồi publish
      publishedAt: null,
    },
  })

  return NextResponse.json({ post }, { status: 201 })
}
