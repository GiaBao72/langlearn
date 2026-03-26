'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateUserClient() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'USER' })
  const router = useRouter()

  function reset() { setForm({ email: '', name: '', password: '', role: 'USER' }); setError(null) }

  async function submit() {
    setError(null)
    if (!form.email || !form.password) return setError('Email và mật khẩu là bắt buộc')
    setLoading(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || 'Tạo thất bại')
    setOpen(false)
    reset()
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); reset() }}
        className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors h-10 flex items-center gap-1.5"
      >
        + Thêm người dùng
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-bold text-[#1E293B] text-lg">Thêm người dùng mới</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1 block">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1 block">Tên hiển thị</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1 block">Mật khẩu * (tối thiểu 6 ký tự)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="••••••••"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1 block">Vai trò</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] bg-white"
                >
                  <option value="USER">USER — Học viên</option>
                  <option value="ADMIN">ADMIN — Quản trị</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2.5 text-sm">
                ❌ {error}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => { setOpen(false); reset() }}
                className="text-sm px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="text-sm px-4 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
