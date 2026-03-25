'use client'

import Link from 'next/link'

interface NavbarClientProps {
  user: { name: string; email: string; role: string } | null
}

export default function NavbarClient({ user }: NavbarClientProps) {
  async function handleLogout() {
    await fetch('/api/auth/refresh', { method: 'DELETE' })
    window.location.href = '/'
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {user.role === 'ADMIN' && (
          <Link href="/admin" className="text-sm text-[#64748B] hover:text-[#334155] transition-colors">
            Admin
          </Link>
        )}
        <Link href="/dashboard" className="text-sm text-[#64748B] hover:text-[#334155] transition-colors">
          Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-[#334155] hidden md:block">{user.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[#64748B] hover:text-red-500 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="text-sm text-[#64748B] hover:text-[#334155] transition-colors">
        Đăng nhập
      </Link>
      <Link
        href="/register"
        className="bg-[#2563EB] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#2563EB]/90 transition-colors"
      >
        Đăng ký
      </Link>
    </div>
  )
}
