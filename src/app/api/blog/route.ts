import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/slugify'

// GET /api/blog — public listing (published only, unless admin)
export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(20, parseInt(searchParams.get('limit') ?? '10'))
  const skip = (page - 1) * limit

  const where = user?.role === 'ADMIN' ? {} : { published: true }

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        published: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ])

  return NextResponse.json({
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

// POST /api/blog — admin create
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, content, excerpt, published } = await req.json()

  if (!title || !content) {
    return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
  }

  const post = await prisma.blogPost.create({
    data: {
      title,
      slug: slugify(title) + '-' + Date.now(),
      content,
      excerpt: excerpt ?? content.slice(0, 160) + '…',
      published: published ?? false,
      publishedAt: published ? new Date() : null,
    },
  })

  return NextResponse.json(post, { status: 201 })
}
