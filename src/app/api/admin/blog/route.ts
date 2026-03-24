import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, excerpt, content, published } = await req.json()
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    let slug = slugify(title)
    // Ensure unique slug
    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const post = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt?.trim() || null,
        content: content.trim(),
        published: !!published,
        publishedAt: published ? new Date() : null,
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, published: true, publishedAt: true, createdAt: true },
  })

  return NextResponse.json({ posts })
}
