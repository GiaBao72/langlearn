'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // TC34: Read ?from= param to redirect back after login
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // TC35: Prevent double-click — bail out immediately if already loading
    if (loading) return

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
      // TC34: Redirect to original destination after successful login
      window.location.replace(from)
    } catch {
      setError('Lỗi kết nối, thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#334155]">LangLearn</Link>
          <p className="text-[#64748B] text-sm mt-2">Tiếp tục hành trình học của bạn</p>
        </div>

        <Card className="border border-[#E2E8F0] rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-[#334155]">Đăng nhập</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#334155] mb-1.5 font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="ban@email.com"
                  className="bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] placeholder:text-[#94a3b8] focus:border-blue-400 h-12"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm text-[#334155] font-medium">Mật khẩu</label>
                  <Link href="/forgot-password" className="text-xs text-[#2563EB] hover:underline">Quên mật khẩu?</Link>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] placeholder:text-[#94a3b8] focus:border-blue-400 h-12"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] text-white font-semibold hover:bg-blue-700 mt-2 h-12"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </form>
          </CardContent>
        </Card>

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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
