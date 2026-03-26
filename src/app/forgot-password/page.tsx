'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Step = 'email' | 'reset' | 'done'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [tokenInput, setTokenInput] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devToken, setDevToken] = useState('') // hiện token khi chưa có email

  async function requestReset() {
    if (!email) return setError('Vui lòng nhập email')
    setLoading(true); setError('')
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Có lỗi xảy ra')
    if (data.token) setDevToken(data.token) // dev mode: hiện token
    setStep('reset')
  }

  async function doReset() {
    if (!tokenInput) return setError('Vui lòng nhập mã reset')
    if (!password) return setError('Vui lòng nhập mật khẩu mới')
    if (password.length < 6) return setError('Mật khẩu tối thiểu 6 ký tự')
    if (password !== confirm) return setError('Mật khẩu xác nhận không khớp')
    setLoading(true); setError('')
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: tokenInput, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Đặt lại mật khẩu thất bại')
    setStep('done')
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#2563EB]">LangLearn</Link>
          <h1 className="text-xl font-bold text-[#334155] mt-4">
            {step === 'done' ? '✅ Đặt lại thành công!' : 'Quên mật khẩu'}
          </h1>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
          {step === 'email' && (
            <>
              <p className="text-sm text-[#64748B]">Nhập email tài khoản của bạn. Chúng tôi sẽ cấp mã reset.</p>
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1 block">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && requestReset()}
                  placeholder="email@example.com" autoFocus
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={requestReset} disabled={loading}
                className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {loading ? 'Đang xử lý...' : 'Lấy mã reset'}
              </button>
            </>
          )}

          {step === 'reset' && (
            <>
              <p className="text-sm text-[#64748B]">Nhập mã reset và mật khẩu mới.</p>
              {devToken && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-amber-600 font-medium mb-1">🔑 Mã reset của bạn (hiệu lực 15 phút):</p>
                  <p className="font-mono text-lg font-bold text-amber-700 tracking-widest">{devToken}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1 block">Mã reset</label>
                <input type="text" value={tokenInput} onChange={e => setTokenInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã reset" autoFocus maxLength={12}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1 block">Mật khẩu mới</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]" />
              </div>
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1 block">Xác nhận mật khẩu</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && doReset()}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={doReset} disabled={loading}
                className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
              </button>
            </>
          )}

          {step === 'done' && (
            <p className="text-sm text-[#64748B] text-center py-2">Đang chuyển về trang đăng nhập...</p>
          )}
        </div>

        <p className="text-center text-sm text-[#64748B] mt-6">
          <Link href="/login" className="text-[#2563EB] hover:underline">← Quay lại đăng nhập</Link>
        </p>
      </div>
    </div>
  )
}
