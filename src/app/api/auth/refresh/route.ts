import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyRefreshToken, signAccessToken, signRefreshToken } from '@/lib/auth'

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 })
  }

  const payload = verifyRefreshToken(refreshToken)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }

  // Check DB — not revoked
  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Token revoked or expired' }, { status: 401 })
  }

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } })

  const newAccessToken = signAccessToken({ userId: payload.userId, email: payload.email, role: payload.role })
  const newRefreshToken = signRefreshToken({ userId: payload.userId, email: payload.email, role: payload.role })

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: payload.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  const response = NextResponse.json({ success: true })
  response.cookies.set('access_token', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60, path: '/' })
  response.cookies.set('refresh_token', newRefreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60, path: '/' })
  return response
}

export async function DELETE() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value
  if (refreshToken) {
    await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { revokedAt: new Date() } })
  }
  const response = NextResponse.json({ success: true })
  response.cookies.delete('access_token')
  response.cookies.delete('refresh_token')
  return response
}
