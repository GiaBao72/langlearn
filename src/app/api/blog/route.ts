import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import slugify from '@/lib/slugify'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 10
  const skip = (page - 1) * limit

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
      select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true },
    }),
    prisma.blogPost.count({ where: { published: true } }),
  ])

  return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { title, content, excerpt, published } = await req.json()
  if (!title || !content) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
  }

  const slug = await uniqueSlug(slugify(title))

  const post = await prisma.blogPost.create({
    data: {
      title,
      content,
      excerpt: excerpt || content.slice(0, 200).replace(/<[^>]+>/g, '') + '...',
      slug,
      published: published ?? false,
      publishedAt: published ? new Date() : null,
    },
  })

  return NextResponse.json(post, { status: 201 })
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base
  let i = 1
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`
  }
  return slug
}
