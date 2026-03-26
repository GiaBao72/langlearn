import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    })
  }
  const response = NextResponse.json({ success: true })
  response.cookies.set('access_token', '', { httpOnly: true, maxAge: 0, path: '/' })
  response.cookies.set('refresh_token', '', { httpOnly: true, maxAge: 0, path: '/' })
  return response
}
