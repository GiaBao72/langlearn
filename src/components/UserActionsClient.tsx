'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string | null
  role: string
}

export default function UserActionsClient({ user, currentUserId }: { user: User; currentUserId: string }) {
  const [loading, setLoading] = useState(false)
  const [showPwModal, setShowPwModal] = useState(false)
  const [newPw, setNewPw] = useState('')
  const router = useRouter()

  async function toggleRole() {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
    if (!confirm(`Đổi ${user.email} sang role ${newRole}?`)) return
    setLoading(true)
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setLoading(false)
    router.refresh()
  }

  async function resetPassword() {
    if (!newPw || newPw.length < 6) return alert('Mật khẩu tối thiểu 6 ký tự')
    setLoading(true)
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPw }),
    })
    setLoading(false)
    if (res.ok) {
      setShowPwModal(false)
      setNewPw('')
      alert(`✅ Đã đặt lại mật khẩu cho ${user.email}`)
    }
  }

  async function deleteUser() {
    if (!confirm(`Xóa tài khoản ${user.email}? Hành động này không thể hoàn tác.`)) return
    setLoading(true)
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return alert(data.error || 'Xóa thất bại')
    router.refresh()
  }

  const isSelf = user.id === currentUserId

  return (
    <>
      <div className="flex items-center gap-1.5 justify-end flex-wrap">
        <button
          onClick={toggleRole}
          disabled={loading || isSelf}
          title={isSelf ? 'Không thể đổi role của chính mình' : ''}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-40"
        >
          {user.role === 'ADMIN' ? '→ USER' : '→ ADMIN'}
        </button>
        <button
          onClick={() => setShowPwModal(true)}
          disabled={loading}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40"
        >
          Đặt lại MK
        </button>
        <button
          onClick={deleteUser}
          disabled={loading || isSelf}
          title={isSelf ? 'Không thể tự xóa mình' : ''}
          className="text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
        >
          Xóa
        </button>
      </div>

      {/* Reset password modal */}
      {showPwModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-[#1E293B] mb-1">Đặt lại mật khẩu</h3>
            <p className="text-sm text-[#64748B] mb-4">{user.email}</p>
            <input
              type="password"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && resetPassword()}
              placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
              className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-[#2563EB]"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowPwModal(false); setNewPw('') }}
                className="text-sm px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={resetPassword}
                disabled={loading}
                className="text-sm px-4 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
