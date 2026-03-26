import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '404 — Trang không tìm thấy | LangLearn' }

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-[#334155] mb-3">404</h1>
      <p className="text-lg text-[#64748B] mb-2">Trang này không tồn tại</p>
      <p className="text-sm text-[#94a3b8] mb-8 max-w-sm">
        Có thể đường dẫn sai, trang đã bị xóa, hoặc chưa bao giờ tồn tại.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/"
          className="bg-[#2563EB] text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors text-sm">
          Về trang chủ
        </Link>
        <Link href="/courses"
          className="border border-[#E2E8F0] text-[#334155] px-6 py-3 rounded-full font-semibold hover:border-[#2563EB] hover:text-[#2563EB] transition-colors text-sm bg-white">
          Xem khóa học
        </Link>
      </div>
    </div>
  )
}
