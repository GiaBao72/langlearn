import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ ok: false }, { status: 401 })
    const { exerciseId, score } = await req.json()

    const existing = await prisma.userProgress.findUnique({
      where: { userId_exerciseId: { userId: user.userId, exerciseId } },
    })

    if (existing) {
      // Chỉ update nếu điểm mới cao hơn
      if (score > existing.score) {
        await prisma.userProgress.update({
          where: { userId_exerciseId: { userId: user.userId, exerciseId } },
          data: { score, completedAt: new Date() },
        })
      }
    } else {
      await prisma.userProgress.create({
        data: { userId: user.userId, exerciseId, score },
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
