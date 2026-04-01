'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import CreateUserClient from '@/components/CreateUserClient'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: Date
  completedCount: number
  totalScore: number
  lastActive: Date | null
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
      role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
    }`}>
      {role}
    </span>
  )
}

function formatLastActive(date: Date | null): string {
  if (!date) return '—'
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return 'Hôm qua'
  if (diffDays < 7) return `${diffDays} ngày trước`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`
  return d.toLocaleDateString('vi-VN')
}

function UserActions({ user, currentUserId, onRefresh }: { user: User; currentUserId: string; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false)
  const [showPwModal, setShowPwModal] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmRole, setConfirmRole] = useState(false)

  const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN'
  const isSelf = user.id === currentUserId

  async function toggleRole() {
    if (!confirmRole) return setConfirmRole(true)
    setLoading(true)
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setLoading(false)
    setConfirmRole(false)
    onRefresh()
  }

  async function resetPassword() {
    setPwError('')
    if (!newPw || newPw.length < 6) return setPwError('Mật khẩu tối thiểu 6 ký tự')
    setLoading(true)
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPw }),
    })
    setLoading(false)
    if (res.ok) {
      setPwSuccess(true)
      setTimeout(() => { setShowPwModal(false); setNewPw(''); setPwSuccess(false) }, 1500)
    } else {
      setPwError('Lưu thất bại')
    }
  }

  async function deleteUser() {
    if (!confirmDelete) return setConfirmDelete(true)
    setLoading(true)
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) onRefresh()
    else setConfirmDelete(false)
  }

  return (
    <>
      <div className="flex items-center gap-1.5 justify-end flex-wrap">
        {!confirmDelete && (
          <>
            <button onClick={toggleRole} disabled={loading || isSelf}
              title={isSelf ? 'Không thể đổi role của chính mình' : ''}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                confirmRole ? 'bg-purple-500 text-white border-purple-500' : 'border-purple-200 text-purple-600 hover:bg-purple-50'
              }`}>
              {confirmRole ? `✓ Xác nhận → ${newRole}?` : `→ ${newRole}`}
            </button>
            {confirmRole && (
              <button onClick={() => setConfirmRole(false)} className="text-xs text-muted-foreground hover:text-foreground px-1">Hủy</button>
            )}
          </>
        )}

        {!confirmRole && (
          <button onClick={() => setShowPwModal(true)} disabled={loading}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40">
            Đặt lại MK
          </button>
        )}

        {!confirmRole && (
          <>
            <button onClick={deleteUser} disabled={loading || isSelf}
              title={isSelf ? 'Không thể tự xóa mình' : ''}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${
                confirmDelete ? 'bg-red-500 text-white border-red-500' : 'border-red-200 text-red-500 hover:bg-red-50'
              }`}>
              {loading && confirmDelete ? 'Đang xóa...' : confirmDelete ? 'Xác nhận xóa?' : 'Xóa'}
            </button>
            {confirmDelete && !loading && (
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-muted-foreground hover:text-foreground px-1">Hủy</button>
            )}
          </>
        )}
      </div>

      {/* Reset password modal */}
      {showPwModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-[#1E293B] mb-1">Đặt lại mật khẩu</h3>
            <p className="text-sm text-[#64748B] mb-4">{user.email}</p>
            {pwSuccess ? (
              <p className="text-emerald-600 text-sm text-center py-2">✅ Đã đặt lại mật khẩu!</p>
            ) : (
              <>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && resetPassword()}
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm mb-2 focus:outline-none focus:border-[#2563EB]"
                  autoFocus />
                {pwError && <p className="text-red-500 text-xs mb-3">{pwError}</p>}
                <div className="flex gap-2 justify-end mt-2">
                  <button onClick={() => { setShowPwModal(false); setNewPw(''); setPwError('') }}
                    className="text-sm px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50">
                    Hủy
                  </button>
                  <button onClick={resetPassword} disabled={loading}
                    className="text-sm px-4 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-blue-700 disabled:opacity-50">
                    {loading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-[#1E293B] mb-2">⚠️ Xóa người dùng?</h3>
            <p className="text-sm text-[#64748B] mb-1">{user.email}</p>
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              Toàn bộ tiến độ học ({user.completedCount} bài, {user.totalScore} điểm) sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(false)}
                className="text-sm px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50">
                Hủy
              </button>
              <button onClick={deleteUser} disabled={loading}
                className="text-sm px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
                {loading ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function UsersClient({ users: initialUsers, currentUserId }: { users: User[]; currentUserId: string }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL')
  const [sortBy, setSortBy] = useState<'createdAt' | 'totalScore' | 'completedCount' | 'lastActive'>('createdAt')

  const filtered = useMemo(() => {
    let list = [...initialUsers]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u => u.email.toLowerCase().includes(q) || (u.name ?? '').toLowerCase().includes(q))
    }
    if (roleFilter !== 'ALL') list = list.filter(u => u.role === roleFilter)
    list.sort((a, b) => {
      if (sortBy === 'totalScore') return b.totalScore - a.totalScore
      if (sortBy === 'completedCount') return b.completedCount - a.completedCount
      if (sortBy === 'lastActive') {
        if (!a.lastActive) return 1
        if (!b.lastActive) return -1
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    return list
  }, [initialUsers, search, roleFilter, sortBy])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Người dùng ({initialUsers.length})</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý tài khoản và tiến độ học</p>
        </div>
        <CreateUserClient />
      </div>

      {/* Search + Filter + Sort */}
      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm theo email hoặc tên..."
          className="flex-1 min-w-[200px] border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#2563EB] bg-background"
        />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-[#2563EB]">
          <option value="ALL">Tất cả vai trò</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-[#2563EB]">
          <option value="createdAt">Mới đăng ký</option>
          <option value="totalScore">Điểm cao nhất</option>
          <option value="completedCount">Hoàn thành nhiều nhất</option>
          <option value="lastActive">Active gần nhất</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground py-16 border border-dashed border-border rounded-xl">
          Không tìm thấy người dùng nào
        </div>
      )}

      {/* Mobile: card list */}
      {filtered.length > 0 && (
        <div className="sm:hidden space-y-3">
          {filtered.map(u => (
            <div key={u.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">{u.email}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{u.name ?? '—'}</div>
                </div>
                <RoleBadge role={u.role} />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>🎯 {u.completedCount} bài</span>
                <span>⭐ {u.totalScore} điểm</span>
                <span>🕐 {formatLastActive(u.lastActive)}</span>
              </div>
              <UserActions user={u} currentUserId={currentUserId} onRefresh={() => router.refresh()} />
            </div>
          ))}
        </div>
      )}

      {/* Desktop: table */}
      {filtered.length > 0 && (
        <Card className="hidden sm:block overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email / Tên</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead className="text-center">Bài hoàn thành</TableHead>
                  <TableHead className="text-center">Tổng điểm</TableHead>
                  <TableHead>Lần cuối học</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead className="text-right w-64">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="font-medium text-foreground text-sm">{u.email}</div>
                      {u.name && <div className="text-xs text-muted-foreground">{u.name}</div>}
                    </TableCell>
                    <TableCell><RoleBadge role={u.role} /></TableCell>
                    <TableCell className="text-center text-sm">
                      {u.completedCount > 0 ? (
                        <span className="font-medium text-foreground">{u.completedCount}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {u.totalScore > 0 ? (
                        <span className="font-medium text-foreground">{u.totalScore.toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatLastActive(u.lastActive)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserActions user={u} currentUserId={currentUserId} onRefresh={() => router.refresh()} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
