'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Đăng ký thất bại')
        return
      }
      router.push('/dashboard')
    } catch {
      setError('Lỗi kết nối, thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight">LangLearn</Link>
          <p className="text-slate-400 text-sm mt-2">Bắt đầu chuỗi 5 phút mỗi ngày</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8">
          <h1 className="text-xl font-semibold mb-6">Tạo tài khoản</h1>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Tên của bạn</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="ban@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Ít nhất 8 ký tự"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-black py-3 rounded-lg font-semibold hover:bg-indigo-600/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Bắt đầu miễn phí →'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
