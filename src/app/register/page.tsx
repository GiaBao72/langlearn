'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function RegisterPage() {
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
      window.location.href = '/dashboard?welcome=1'
    } catch {
      setError('Lỗi kết nối, thử lại sau')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight text-[#334155]">LangLearn</Link>
          <p className="text-[#64748B] text-sm mt-2">Bắt đầu chuỗi 5 phút mỗi ngày</p>
        </div>

        <Card className="border border-[#E2E8F0] rounded-2xl shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold text-[#334155]">Tạo tài khoản</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#334155] mb-1.5 font-medium">Tên của bạn</label>
                <Input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] placeholder:text-[#94a3b8] focus:border-blue-400 h-12"
                />
              </div>
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
                <label className="block text-sm text-[#334155] mb-1.5 font-medium">Mật khẩu</label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Tối thiểu 6 ký tự"
                  className="bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] placeholder:text-[#94a3b8] focus:border-blue-400 h-12"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] text-white font-semibold hover:bg-blue-700 mt-2 h-12"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Bắt đầu miễn phí →'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[#64748B] text-sm mt-5 sm:mt-6">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#2563EB] hover:underline font-medium">Đăng nhập</Link>
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
