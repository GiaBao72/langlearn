import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    const user = payload as { userId: string; email: string; role: string }
    return NextResponse.json({ userId: user.userId, email: user.email, role: user.role })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
