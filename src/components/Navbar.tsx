'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 py-3 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-[#334155]">LangLearn</Link>
        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-4 text-sm">
          <Link href="/courses" className="text-[#64748B] hover:text-[#2563EB] font-medium">Khóa học</Link>
          <Link href="/blog" className="text-[#64748B] hover:text-[#2563EB] font-medium">Blog</Link>
          <Link href="/login" className="text-[#64748B] hover:text-[#2563EB] font-medium">Đăng nhập</Link>
          <Link href="/register" className="bg-[#2563EB] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">Bắt đầu</Link>
        </div>
        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-2">
          <Link href="/login" className="text-[#64748B] text-sm font-medium px-2 py-1">Đăng nhập</Link>
          <button onClick={() => setOpen(!open)} className="p-2 rounded-lg hover:bg-slate-100" aria-label="Menu">
            {open
              ? <svg className="w-5 h-5 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              : <svg className="w-5 h-5 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
            }
          </button>
        </div>
      </div>
      {open && (
        <div className="sm:hidden mt-2 pb-3 border-t border-[#E2E8F0] pt-3 flex flex-col gap-1 max-w-6xl mx-auto">
          <Link href="/courses" onClick={() => setOpen(false)} className="py-2.5 px-2 text-sm font-medium text-[#334155] hover:text-[#2563EB] rounded-lg hover:bg-slate-50">Khóa học</Link>
          <Link href="/blog" onClick={() => setOpen(false)} className="py-2.5 px-2 text-sm font-medium text-[#334155] hover:text-[#2563EB] rounded-lg hover:bg-slate-50">Blog</Link>
          <Link href="/register" onClick={() => setOpen(false)} className="bg-[#2563EB] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 text-sm text-center mt-1">Bắt đầu miễn phí →</Link>
        </div>
      )}
    </nav>
  )
}
