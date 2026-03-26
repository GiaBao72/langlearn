'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

interface NavbarClientProps {
  user: { name: string; email: string; role: string } | null
}

const navLinks = [
  { href: '/courses', label: 'Khóa học' },
  { href: '/roadmap', label: 'Lộ trình' },
  { href: '/blog', label: 'Blog' },
  { href: '/store', label: 'Sách' },
]

export default function NavbarClient({ user }: NavbarClientProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <>
      {/* Desktop right side */}
      <div className="hidden md:flex items-center gap-3">
        {user ? (
          <>
            {user.role === 'ADMIN' && (
              <Link href="/admin" className="text-sm text-[#64748B] hover:text-[#334155] transition-colors">
                Admin
              </Link>
            )}
            <Link href="/dashboard" className="text-sm text-[#64748B] hover:text-[#334155] transition-colors">
              Dashboard
            </Link>
            <Link href="/profile" className="text-sm text-[#64748B] hover:text-[#334155] transition-colors">
              Tài khoản
            </Link>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-[#2563EB] text-white text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-[#334155]">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}
              className="text-sm text-[#64748B] hover:text-red-500 transition-colors">
              Đăng xuất
            </Button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm text-[#64748B] hover:text-[#334155] transition-colors">
              Đăng nhập
            </Link>
            <Link href="/register"
              className="bg-[#2563EB] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#2563EB]/90 transition-colors">
              Đăng ký
            </Link>
          </>
        )}
      </div>

      {/* Mobile: hamburger button */}
      <button
        className="md:hidden p-2 rounded-lg text-[#64748B] hover:text-[#334155] hover:bg-slate-100 transition-colors"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Menu"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white border-b border-[#E2E8F0] shadow-lg z-50 md:hidden">
          <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
            {/* Nav links */}
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-[#64748B] hover:bg-slate-50 hover:text-[#334155] transition-colors">
                {link.label}
              </Link>
            ))}

            <div className="border-t border-[#E2E8F0] my-2" />

            {user ? (
              <>
                {/* User info */}
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-[#2563EB] text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium text-[#334155]">{user.name}</div>
                    <div className="text-xs text-[#64748B]">{user.email}</div>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-[#64748B] hover:bg-slate-50 hover:text-[#334155] transition-colors">
                  Dashboard
                </Link>
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-[#64748B] hover:bg-slate-50 hover:text-[#334155] transition-colors">
                  Tài khoản
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm text-[#64748B] hover:bg-slate-50 hover:text-[#334155] transition-colors">
                    ⚙️ Quản trị
                  </Link>
                )}
                <button onClick={() => { setMenuOpen(false); handleLogout() }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-[#64748B] hover:bg-slate-50 transition-colors">
                  Đăng nhập
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)}
                  className="block mx-3 my-1 px-4 py-2.5 rounded-full text-sm text-center bg-[#2563EB] text-white hover:bg-blue-700 transition-colors font-medium">
                  Đăng ký miễn phí
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
