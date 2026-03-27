import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const user = await getCurrentUser()

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-surface)] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between relative">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-[#2563EB] text-lg">LangLearn</Link>
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
            <Link href="/courses" className="hover:text-[var(--color-text-main)] transition-colors">Khóa học</Link>
            <Link href="/roadmap" className="hover:text-[var(--color-text-main)] transition-colors">Lộ trình</Link>
            <Link href="/blog" className="hover:text-[var(--color-text-main)] transition-colors">Blog</Link>
            <Link href="/leaderboard" className="hover:text-[var(--color-text-main)] transition-colors">🏆 Xếp hạng</Link>
            <Link href="/store" className="hover:text-[var(--color-text-main)] transition-colors">Sách</Link>
          </div>
        </div>

        <NavbarClient user={user ? { name: user.email.split('@')[0], email: user.email, role: user.role } : null} />
      </div>
    </nav>
  )
}
