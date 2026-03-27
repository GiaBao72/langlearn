'use client'

import { useState } from 'react'

interface RecentProgressItem {
  score: number
  completedAt: string
  exerciseType: string
  exerciseQuestion: string | null
  lessonTitle: string | null
  courseTitle: string | null
}

interface Props {
  user: { userId: string; email: string; role: string }
  recentProgress: RecentProgressItem[]
}

export default function ProfileClient({ user, recentProgress }: Props) {
  const [name, setName] = useState('')
  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [loadingName, setLoadingName] = useState(false)
  const [loadingPw, setLoadingPw] = useState(false)
  const [msgName, setMsgName] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [msgPw, setMsgPw] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  async function saveName() {
    if (!name.trim()) return setMsgName({ type: 'err', text: '❌ Tên không được để trống' })
    if (name.trim().length < 2) return setMsgName({ type: 'err', text: '❌ Tên tối thiểu 2 ký tự' })
    if (name.trim().length > 50) return setMsgName({ type: 'err', text: '❌ Tên tối đa 50 ký tự' })
    setLoadingName(true); setMsgName(null)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setLoadingName(false)
    setMsgName(res.ok ? { type: 'ok', text: '✅ Đã cập nhật tên' } : { type: 'err', text: '❌ Cập nhật thất bại' })
  }

  async function savePassword() {
    if (!curPw || !newPw || !confirmPw) return setMsgPw({ type: 'err', text: '❌ Vui lòng điền đầy đủ' })
    if (newPw.length < 6) return setMsgPw({ type: 'err', text: '❌ Mật khẩu mới tối thiểu 6 ký tự' })
    if (newPw !== confirmPw) return setMsgPw({ type: 'err', text: '❌ Mật khẩu xác nhận không khớp' })
    setLoadingPw(true); setMsgPw(null)
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
    })
    const data = await res.json()
    setLoadingPw(false)
    if (res.ok) {
      setMsgPw({ type: 'ok', text: '✅ Đã đổi mật khẩu' })
      setCurPw(''); setNewPw(''); setConfirmPw('')
    } else {
      setMsgPw({ type: 'err', text: `❌ ${data.error || 'Đổi mật khẩu thất bại'}` })
    }
  }

  return (
    <div className="space-y-6">
      {/* Info card */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-1">
        <div className="text-xs text-[#64748B] uppercase tracking-widest mb-3">Thông tin tài khoản</div>
        <div className="text-sm"><span className="text-[#64748B]">Email:</span> <span className="font-medium text-[#334155]">{user.email}</span></div>
        <div className="text-sm"><span className="text-[#64748B]">Vai trò:</span> <span className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span></div>
      </div>

      {/* Change name */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
        <div className="text-xs text-[#64748B] uppercase tracking-widest mb-4">Tên hiển thị</div>
        <div className="flex gap-2">
          <input value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveName()}
            placeholder="Nhập tên mới..."
            className="flex-1 border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]" />
          <button onClick={saveName} disabled={loadingName || !name.trim()}
            className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 transition-colors">
            {loadingName ? '...' : 'Lưu'}
          </button>
        </div>
        {msgName && <p className={`mt-2 text-sm ${msgName.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{msgName.text}</p>}
      </div>

      {/* Change password */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
        <div className="text-xs text-[#64748B] uppercase tracking-widest mb-4">Đổi mật khẩu</div>
        <div className="space-y-3">
          <input type="password" value={curPw} onChange={e => setCurPw(e.target.value)}
            placeholder="Mật khẩu hiện tại"
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]" />
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
            placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]" />
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && savePassword()}
            placeholder="Xác nhận mật khẩu mới"
            className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]" />
          <button onClick={savePassword} disabled={loadingPw}
            className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loadingPw ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
          {msgPw && <p className={`text-sm ${msgPw.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{msgPw.text}</p>}
        </div>
      </div>

      {/* Lịch sử học */}
      {recentProgress.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-[#334155] mb-4">📚 Lịch sử học gần đây</h2>
          <div className="space-y-2">
            {recentProgress.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#64748B]">{p.courseTitle} · {p.lessonTitle}</p>
                  <p className="text-sm text-[#334155] truncate">{p.exerciseQuestion || `(${p.exerciseType})`}</p>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <span className="text-sm font-semibold text-[#2563EB]">+{p.score}đ</span>
                  <span className="text-xs text-[#94A3B8]">
                    {new Date(p.completedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
