import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const ACCESS_SECRET  = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
const REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!)

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(ACCESS_SECRET)
}

export async function signRefreshToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload, jti: crypto.randomUUID() })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET)
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value
  if (!token) return null
  return verifyAccessToken(token)
}
