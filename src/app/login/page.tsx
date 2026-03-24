'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Đăng nhập thất bại')
        return
      }
      window.location.replace('/dashboard')
    } catch {
      setError('Lỗi kết nối, thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#334155]">LangLearn</Link>
          <p className="text-[#64748B] text-sm mt-2">Tiếp tục hành trình học của bạn</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm">
          <h1 className="text-xl font-semibold mb-5 sm:mb-6 text-[#334155]">Đăng nhập</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#334155] mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ban@email.com"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:border-blue-400 transition-colors h-12"
              />
            </div>
            <div>
              <label className="block text-sm text-[#334155] mb-1.5 font-medium">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:border-blue-400 transition-colors h-12"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563EB] text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 h-12"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#64748B] text-sm mt-5 sm:mt-6">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-[#2563EB] hover:underline font-medium">Đăng ký miễn phí</Link>
        </p>

        <p className="text-center mt-4">
          <Link href="/" className="text-[#64748B] text-xs hover:text-[#334155] transition-colors">
            ← Về trang chủ
          </Link>
        </p>
      </div>
    </div>
  )
}
