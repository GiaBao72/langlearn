import Link from 'next/link'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import NavbarClient from './NavbarClient'

async function getUserFromCookie() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('access_token')?.value
    if (!token) return null
    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: string; email: string; role: string }
  } catch {
    return null
  }
}

export default async function Navbar() {
  const user = await getUserFromCookie()

  return (
    <nav className="border-b border-[#E2E8F0] bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-[#2563EB] text-lg">LangLearn</Link>
          <div className="hidden md:flex items-center gap-4 text-sm text-[#64748B]">
            <Link href="/courses" className="hover:text-[#334155] transition-colors">Khóa học</Link>
            <Link href="/roadmap" className="hover:text-[#334155] transition-colors">Lộ trình</Link>
            <Link href="/blog" className="hover:text-[#334155] transition-colors">Blog</Link>
            <Link href="/store" className="hover:text-[#334155] transition-colors">Sách</Link>
          </div>
        </div>

        <NavbarClient user={user ? { name: user.email.split('@')[0], email: user.email, role: user.role } : null} />
      </div>
    </nav>
  )
}
