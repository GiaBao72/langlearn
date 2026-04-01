'use client'

import { useState, useEffect, useCallback } from 'react'

interface EnrolledUser {
  id: string
  enrolledAt: string
  user: {
    id: string
    name: string | null
    email: string
    createdAt: string
  }
}

interface AllUser {
  id: string
  name: string | null
  email: string
}

export default function EnrollmentTab({ courseId }: { courseId: string }) {
  const [enrolled, setEnrolled] = useState<EnrolledUser[]>([])
  const [allUsers, setAllUsers] = useState<AllUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [addSearch, setAddSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [bulkSelected, setBulkSelected] = useState<Set<string>>(new Set())
  const [bulkRemoving, setBulkRemoving] = useState(false)

  const enrolledIds = new Set(enrolled.map(e => e.user.id))

  const fetchEnrolled = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/courses/${courseId}/enrollments`)
    if (res.ok) setEnrolled(await res.json())
    setLoading(false)
  }, [courseId])

  const fetchAllUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users?limit=500')
    if (res.ok) {
      const data = await res.json()
      setAllUsers((data.users ?? data).map((u: AllUser & { role?: string }) => ({
        id: u.id, name: u.name, email: u.email,
      })).filter((u: AllUser & { role?: string }) => (u as AllUser & { role?: string }).role !== 'ADMIN'))
    }
  }, [])

  useEffect(() => {
    fetchEnrolled()
    fetchAllUsers()
  }, [fetchEnrolled, fetchAllUsers])

  async function enrollUser(userId: string) {
    setAdding(true)
    await fetch(`/api/admin/courses/${courseId}/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    await fetchEnrolled()
    setAdding(false)
    setAddSearch('')
  }

  async function unenrollUser(userId: string) {
    setRemoving(userId)
    await fetch(`/api/admin/courses/${courseId}/enrollments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    setEnrolled(prev => prev.filter(e => e.user.id !== userId))
    setRemoving(null)
    setConfirmRemove(null)
    setBulkSelected(prev => { const n = new Set(prev); n.delete(userId); return n })
  }

  async function enrollAll() {
    const notEnrolled = filteredAdd.map(u => u.id)
    if (notEnrolled.length === 0) return
    setAdding(true)
    await fetch(`/api/admin/courses/${courseId}/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: notEnrolled }),
    })
    await fetchEnrolled()
    setAdding(false)
    setAddSearch('')
  }

  async function bulkUnenroll() {
    if (bulkSelected.size === 0) return
    setBulkRemoving(true)
    await fetch(`/api/admin/courses/${courseId}/enrollments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: [...bulkSelected] }),
    })
    setEnrolled(prev => prev.filter(e => !bulkSelected.has(e.user.id)))
    setBulkSelected(new Set())
    setBulkRemoving(false)
  }

  function toggleBulk(userId: string) {
    setBulkSelected(prev => {
      const n = new Set(prev)
      if (n.has(userId)) n.delete(userId); else n.add(userId)
      return n
    })
  }

  function toggleAll() {
    if (bulkSelected.size === filteredEnrolled.length && filteredEnrolled.length > 0) {
      setBulkSelected(new Set())
    } else {
      setBulkSelected(new Set(filteredEnrolled.map(e => e.user.id)))
    }
  }

  const filteredEnrolled = enrolled.filter(e =>
    !search || e.user.name?.toLowerCase().includes(search.toLowerCase()) || e.user.email.toLowerCase().includes(search.toLowerCase())
  )

  const filteredAdd = allUsers.filter(u =>
    !enrolledIds.has(u.id) &&
    (!addSearch || u.name?.toLowerCase().includes(addSearch.toLowerCase()) || u.email.toLowerCase().includes(addSearch.toLowerCase()))
  )

  return (
    <div className="space-y-6">

      {/* Stats bar */}
      <div className="flex items-center gap-6 text-sm">
        <div className="text-foreground">
          <span className="font-bold text-2xl text-[#2563EB]">{enrolled.length}</span>
          <span className="text-muted-foreground ml-1">học viên đã đăng ký</span>
        </div>
        <div className="text-muted-foreground">
          / {allUsers.length} tài khoản
        </div>
      </div>

      {/* Add users section */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-semibold text-sm text-foreground">➕ Thêm học viên</h3>
          <button
            onClick={enrollAll}
            disabled={adding || filteredAdd.length === 0}
            className="text-xs bg-[#2563EB] text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {adding ? '...' : `Thêm tất cả${addSearch ? ` (${filteredAdd.length})` : ` ${filteredAdd.length} người`}`}
          </button>
        </div>

        <div className="p-3 border-b">
          <input
            value={addSearch}
            onChange={e => setAddSearch(e.target.value)}
            placeholder="🔍 Tìm theo tên hoặc email..."
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="max-h-52 overflow-y-auto divide-y divide-border">
          {filteredAdd.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {addSearch ? 'Không tìm thấy.' : 'Tất cả tài khoản đã được đăng ký.'}
            </div>
          ) : (
            filteredAdd.slice(0, 50).map(u => (
              <div key={u.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{u.name ?? '—'}</div>
                  <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                </div>
                <button
                  onClick={() => enrollUser(u.id)}
                  disabled={adding}
                  className="shrink-0 ml-3 text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors"
                >
                  + Thêm
                </button>
              </div>
            ))
          )}
          {filteredAdd.length > 50 && (
            <div className="px-4 py-2 text-center text-xs text-muted-foreground">
              Hiện {50}/{filteredAdd.length} — nhập tên để lọc thêm
            </div>
          )}
        </div>
      </div>

      {/* Enrolled users */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-sm text-foreground">👥 Đã đăng ký</h3>
            {bulkSelected.size > 0 && (
              <button
                onClick={bulkUnenroll}
                disabled={bulkRemoving}
                className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {bulkRemoving ? '...' : `🗑 Xóa ${bulkSelected.size} người`}
              </button>
            )}
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Tìm học viên..."
            className="border border-border rounded-lg px-3 py-1.5 text-xs bg-background focus:outline-none focus:border-[#2563EB] w-44"
          />
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Đang tải...</div>
        ) : filteredEnrolled.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            {search ? 'Không tìm thấy.' : 'Chưa có học viên nào.'}
          </div>
        ) : (
          <>
            {/* Header row with select all */}
            <div className="flex items-center px-4 py-2 border-b bg-muted/10 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="mr-3 rounded"
                checked={bulkSelected.size === filteredEnrolled.length && filteredEnrolled.length > 0}
                onChange={toggleAll}
              />
              <span>Chọn tất cả ({filteredEnrolled.length})</span>
            </div>

            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {filteredEnrolled.map(e => (
                <div key={e.id} className={`flex items-center px-4 py-3 hover:bg-muted/30 transition-colors ${bulkSelected.has(e.user.id) ? 'bg-red-50/50' : ''}`}>
                  <input
                    type="checkbox"
                    className="mr-3 rounded"
                    checked={bulkSelected.has(e.user.id)}
                    onChange={() => toggleBulk(e.user.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{e.user.name ?? '—'}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {e.user.email} · Đăng ký {new Date(e.enrolledAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>

                  {confirmRemove === e.user.id ? (
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span className="text-xs text-red-600">Xác nhận?</span>
                      <button
                        onClick={() => unenrollUser(e.user.id)}
                        disabled={removing === e.user.id}
                        className="text-xs bg-red-500 text-white px-2.5 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                      >
                        {removing === e.user.id ? '...' : 'Xóa'}
                      </button>
                      <button
                        onClick={() => setConfirmRemove(null)}
                        className="text-xs border border-border px-2.5 py-1 rounded hover:bg-muted/50"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRemove(e.user.id)}
                      className="shrink-0 ml-3 text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
