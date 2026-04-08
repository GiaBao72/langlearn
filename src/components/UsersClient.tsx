'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Search, ChevronDown, ChevronUp, Shield, User as UserIcon,
  BookOpen, ClipboardList, CheckCircle2, TrendingUp, Clock, Trash2,
  KeyRound, Crown, X, Lock, Unlock, RefreshCw, GraduationCap,
} from 'lucide-react'
import CreateUserClient from '@/components/CreateUserClient'

interface UserEnrollment {
  courseId: string
  courseTitle: string
  enrolledAt: Date
}
interface UserExamAttempt {
  score: number
  maxScore: number
  passed: boolean | null
  startedAt: Date
  examTitle: string
}

interface User {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: Date
  completedCount: number
  totalScore: number
  lastActive: Date | null
  enrollmentCount: number
  examAttemptCount: number
  avgExamScore: number | null
  enrollments: UserEnrollment[]
  recentAttempts: UserExamAttempt[]
}

function formatRelative(date: Date | null): string {
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

function Avatar({ name, email, size = 'md' }: { name: string | null; email: string; size?: 'sm' | 'md' | 'lg' }) {
  const letter = (name ?? email).slice(0, 1).toUpperCase()
  const colors = ['from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-purple-400 to-violet-500', 'from-rose-400 to-pink-500', 'from-amber-400 to-orange-500']
  const idx = email.charCodeAt(0) % colors.length
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-lg' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br ${colors[idx]} flex items-center justify-center text-white font-bold shrink-0`}>
      {letter}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
      {role === 'ADMIN' ? <Crown size={10} /> : <UserIcon size={10} />}
      {role}
    </span>
  )
}

function ExpandedDetail({ user }: { user: User }) {
  return (
    <div className="px-5 pb-5 pt-3 bg-[#F8FAFC] border-t border-[#E2E8F0]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Enrollments */}
        <div>
          <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <BookOpen size={12} /> Khóa học đã đăng ký ({user.enrollments.length})
          </h4>
          {user.enrollments.length === 0 ? (
            <p className="text-xs text-[#94A3B8]">Chưa đăng ký khóa nào</p>
          ) : (
            <div className="space-y-1.5">
              {user.enrollments.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-white border border-[#E2E8F0] rounded-lg px-3 py-2">
                  <span className="text-[#334155] truncate flex-1">{e.courseTitle}</span>
                  <span className="text-[10px] text-[#94A3B8] shrink-0 ml-2">{new Date(e.enrolledAt).toLocaleDateString('vi-VN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent exam attempts */}
        <div>
          <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <ClipboardList size={12} /> Lượt thi gần nhất ({user.examAttemptCount})
          </h4>
          {user.recentAttempts.length === 0 ? (
            <p className="text-xs text-[#94A3B8]">Chưa làm bài kiểm tra nào</p>
          ) : (
            <div className="space-y-1.5">
              {user.recentAttempts.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-white border border-[#E2E8F0] rounded-lg px-3 py-2">
                  <span className="text-[#334155] truncate flex-1">{a.examTitle}</span>
                  <span className={`text-xs font-semibold shrink-0 ml-2 ${a.maxScore > 0 ? (a.score / a.maxScore >= 0.8 ? 'text-green-600' : a.score / a.maxScore >= 0.5 ? 'text-amber-600' : 'text-red-500') : 'text-[#94A3B8]'}`}>
                    {a.maxScore > 0 ? `${a.score}/${a.maxScore}` : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// ── Access Modal ─────────────────────────────────────────────────────────────
interface AccessCourse { id: string; title: string; level: string; enrolled: boolean; enrolledAt: string | null }
interface AccessExamAttempt { score: number; maxScore: number; passed: boolean | null; startedAt: string }
interface AccessExam { id: string; title: string; course: { title: string; level: string }; attempted: boolean; attempts: AccessExamAttempt[] }

function AccessModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [tab, setTab] = useState<'courses' | 'exams'>('courses')
  const [courses, setCourses] = useState<AccessCourse[]>([])
  const [exams, setExams]     = useState<AccessExam[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState<string | null>(null)
  const [search, setSearch]   = useState('')

  async function loadData() {
    setLoading(true)
    const res = await fetch(`/api/admin/users/${user.id}/access`)
    const data = await res.json()
    setCourses(data.courses)
    setExams(data.exams)
    setLoading(false)
  }

  useState(() => { loadData() })

  // useEffect for initial load
  const [didLoad, setDidLoad] = useState(false)
  if (!didLoad) { setDidLoad(true); loadData() }

  async function toggleCourse(courseId: string, enrolled: boolean) {
    setSaving(courseId)
    if (enrolled) {
      await fetch(`/api/admin/users/${user.id}/access`, {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'course', targetId: courseId }),
      })
    } else {
      await fetch(`/api/admin/users/${user.id}/access`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'course', targetId: courseId }),
      })
    }
    setSaving(null)
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, enrolled: !enrolled, enrolledAt: !enrolled ? new Date().toISOString() : null } : c))
  }

  async function resetExam(examId: string) {
    if (!confirm('Xóa toàn bộ lượt thi của bài này để user thi lại?')) return
    setSaving(examId)
    await fetch(`/api/admin/users/${user.id}/access`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'exam', targetId: examId }),
    })
    setSaving(null)
    setExams(prev => prev.map(e => e.id === examId ? { ...e, attempted: false, attempts: [] } : e))
  }

  const LEVEL_COLORS: Record<string, string> = {
    A1: 'bg-emerald-100 text-emerald-700', A2: 'bg-teal-100 text-teal-700',
    B1: 'bg-blue-100 text-blue-700',       B2: 'bg-indigo-100 text-indigo-700',
    C1: 'bg-purple-100 text-purple-700',   C2: 'bg-rose-100 text-rose-700',
  }

  const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
  const filteredExams   = exams.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.course.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl"><GraduationCap size={18} className="text-[#2563EB]" /></div>
            <div>
              <h3 className="font-bold text-[#1E293B]">Quản lý quyền truy cập</h3>
              <p className="text-xs text-[#64748B]">{user.name ?? user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-[#64748B]"><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 shrink-0">
          <button onClick={() => setTab('courses')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'courses' ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:bg-slate-100'}`}>
            <span className="flex items-center gap-2"><BookOpen size={14} /> Khóa học ({courses.filter(c => c.enrolled).length}/{courses.length})</span>
          </button>
          <button onClick={() => setTab('exams')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'exams' ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:bg-slate-100'}`}>
            <span className="flex items-center gap-2"><ClipboardList size={14} /> Đề thi ({exams.filter(e => e.attempted).length} đã làm)</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..."
              className="w-full border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#2563EB]" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {loading ? (
            <div className="text-center py-10 text-[#94A3B8]">Đang tải...</div>
          ) : tab === 'courses' ? (
            <div className="space-y-2">
              {filteredCourses.length === 0 && <p className="text-sm text-[#94A3B8] text-center py-8">Không có khóa học nào</p>}
              {filteredCourses.map(c => (
                <div key={c.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${c.enrolled ? 'border-green-200 bg-green-50' : 'border-[#E2E8F0] bg-white hover:border-blue-200'}`}>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${LEVEL_COLORS[c.level] ?? 'bg-slate-100 text-slate-600'}`}>{c.level}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#334155] truncate">{c.title}</p>
                    {c.enrolled && c.enrolledAt && (
                      <p className="text-xs text-[#94A3B8]">Đăng ký: {new Date(c.enrolledAt).toLocaleDateString('vi-VN')}</p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleCourse(c.id, c.enrolled)}
                    disabled={saving === c.id}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors disabled:opacity-50 shrink-0 ${
                      c.enrolled
                        ? 'border-red-200 text-red-500 hover:bg-red-50 bg-white'
                        : 'border-[#2563EB] text-[#2563EB] hover:bg-blue-50 bg-white'
                    }`}>
                    {saving === c.id ? <RefreshCw size={12} className="animate-spin" /> : c.enrolled ? <><Lock size={12} /> Thu hồi</> : <><Unlock size={12} /> Mở khóa</>}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExams.length === 0 && <p className="text-sm text-[#94A3B8] text-center py-8">Không có đề thi nào</p>}
              {filteredExams.map(e => (
                <div key={e.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${e.attempted ? 'border-amber-200 bg-amber-50' : 'border-[#E2E8F0] bg-white'}`}>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${LEVEL_COLORS[e.course.level] ?? 'bg-slate-100 text-slate-600'}`}>{e.course.level}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#334155] truncate">{e.title}</p>
                    <p className="text-xs text-[#94A3B8] truncate">{e.course.title}</p>
                    {e.attempts.length > 0 && (
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        {e.attempts.slice(0, 3).map((a, i) => (
                          <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${a.maxScore > 0 ? (a.score / a.maxScore >= 0.8 ? 'bg-green-100 text-green-700' : a.score / a.maxScore >= 0.5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600') : 'bg-slate-100 text-slate-500'}`}>
                            {a.score}/{a.maxScore} {a.passed ? '✓' : '✗'}
                          </span>
                        ))}
                        {e.attempts.length > 3 && <span className="text-[10px] text-[#94A3B8]">+{e.attempts.length - 3} lượt</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {e.attempted && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{e.attempts.length} lượt thi</span>
                    )}
                    <button
                      onClick={() => resetExam(e.id)}
                      disabled={saving === e.id || !e.attempted}
                      title={e.attempted ? 'Xóa lịch sử thi để user làm lại' : 'Chưa làm bài này'}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 bg-white font-medium transition-colors disabled:opacity-40">
                      {saving === e.id ? <RefreshCw size={12} className="animate-spin" /> : <><RefreshCw size={12} /> Reset</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] bg-slate-50 shrink-0">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Mở khóa = enroll ngay · Thu hồi = xóa enrollment · Reset = xóa lịch sử thi</span>
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-white text-sm font-medium transition-colors">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function UserActions({ user, currentUserId, onRefresh }: { user: User; currentUserId: string; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false)
  const [showPwModal, setShowPwModal] = useState(false)
  const [showAccessModal, setShowAccessModal] = useState(false)
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
    await fetch(`/api/admin/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole }) })
    setLoading(false); setConfirmRole(false); onRefresh()
  }

  async function resetPassword() {
    setPwError('')
    if (!newPw || newPw.length < 6) return setPwError('Mật khẩu tối thiểu 6 ký tự')
    setLoading(true)
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: newPw }) })
    setLoading(false)
    if (res.ok) { setPwSuccess(true); setTimeout(() => { setShowPwModal(false); setNewPw(''); setPwSuccess(false) }, 1500) }
    else setPwError('Lưu thất bại')
  }

  async function deleteUser() {
    if (!confirmDelete) return setConfirmDelete(true)
    setLoading(true)
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
    setLoading(false)
    if (res.ok) onRefresh(); else setConfirmDelete(false)
  }

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap">
        <button onClick={toggleRole} disabled={loading || isSelf}
          title={isSelf ? 'Không thể đổi role của chính mình' : `Đổi sang ${newRole}`}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${confirmRole ? 'bg-purple-500 text-white border-purple-500' : 'border-purple-200 text-purple-600 hover:bg-purple-50'}`}>
          <Shield size={11} />
          {confirmRole ? `Xác nhận → ${newRole}?` : newRole}
        </button>
        {confirmRole && <button onClick={() => setConfirmRole(false)} className="text-xs text-[#94A3B8] hover:text-[#64748B] px-1"><X size={12} /></button>}

        <button onClick={() => setShowPwModal(true)} disabled={loading}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40">
          <KeyRound size={11} /> Đặt lại MK
        </button>

        <button onClick={() => setShowAccessModal(true)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-blue-200 text-[#2563EB] hover:bg-blue-50 transition-colors">
          <GraduationCap size={11} /> Quyền truy cập
        </button>

        <button onClick={deleteUser} disabled={loading || isSelf} title={isSelf ? 'Không thể tự xóa mình' : 'Xóa người dùng'}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border transition-colors disabled:opacity-40 ${confirmDelete ? 'bg-red-500 text-white border-red-500' : 'border-red-200 text-red-500 hover:bg-red-50'}`}>
          <Trash2 size={11} />
          {loading && confirmDelete ? 'Đang xóa...' : confirmDelete ? 'Xác nhận?' : 'Xóa'}
        </button>
        {confirmDelete && !loading && <button onClick={() => setConfirmDelete(false)} className="text-xs text-[#94A3B8] hover:text-[#64748B] px-1"><X size={12} /></button>}
      </div>

      {showPwModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-[#1E293B] mb-1">Đặt lại mật khẩu</h3>
            <p className="text-sm text-[#64748B] mb-4">{user.email}</p>
            {pwSuccess ? <p className="text-emerald-600 text-sm text-center py-2">Đã đặt lại mật khẩu!</p> : (
              <>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && resetPassword()}
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm mb-2 focus:outline-none focus:border-[#2563EB]" autoFocus />
                {pwError && <p className="text-red-500 text-xs mb-3">{pwError}</p>}
                <div className="flex gap-2 justify-end mt-2">
                  <button onClick={() => { setShowPwModal(false); setNewPw(''); setPwError('') }} className="text-sm px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50">Hủy</button>
                  <button onClick={resetPassword} disabled={loading} className="text-sm px-4 py-2 rounded-lg bg-[#2563EB] text-white hover:bg-blue-700 disabled:opacity-50">{loading ? 'Đang lưu...' : 'Lưu'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {showAccessModal && <AccessModal user={user} onClose={() => setShowAccessModal(false)} />}
    </>
  )
}

export default function UsersClient({ users: initialUsers, currentUserId }: { users: User[]; currentUserId: string }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL')
  const [sortBy, setSortBy] = useState<'createdAt' | 'totalScore' | 'completedCount' | 'lastActive'>('createdAt')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const adminCount = initialUsers.filter(u => u.role === 'ADMIN').length
  const activeThisWeek = initialUsers.filter(u => u.lastActive && new Date(u.lastActive).getTime() > Date.now() - 7 * 86400000).length
  const withActivity = initialUsers.filter(u => u.completedCount > 0 || u.examAttemptCount > 0).length

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
        if (!a.lastActive) return 1; if (!b.lastActive) return -1
        return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    return list
  }, [initialUsers, search, roleFilter, sortBy])

  function toggleExpand(id: string) {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Người dùng</h1>
          <p className="text-sm text-[#64748B] mt-1">Quản lý tài khoản và tiến độ học</p>
        </div>
        <CreateUserClient />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Tổng người dùng', value: initialUsers.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Crown, label: 'Admin', value: adminCount, color: 'text-red-600', bg: 'bg-red-50' },
          { icon: Clock, label: 'Active tuần này', value: activeThisWeek, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: TrendingUp, label: 'Đã học/thi', value: withActivity, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.bg}`}><s.icon size={16} className={s.color} /></div>
            <div>
              <div className="text-xl font-bold text-[#1E293B]">{s.value}</div>
              <div className="text-xs text-[#64748B]">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo email hoặc tên..."
            className="w-full border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB] bg-white" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as typeof roleFilter)}
          className="border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#2563EB] text-[#334155]">
          <option value="ALL">Tất cả vai trò</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
          className="border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#2563EB] text-[#334155]">
          <option value="createdAt">Mới đăng ký</option>
          <option value="totalScore">Điểm cao nhất</option>
          <option value="completedCount">Hoàn thành nhiều nhất</option>
          <option value="lastActive">Active gần nhất</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-[#94A3B8] py-16 border border-dashed border-[#E2E8F0] rounded-2xl">
          Không tìm thấy người dùng nào
        </div>
      )}

      {/* User list */}
      {filtered.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
          <div className="divide-y divide-[#F1F5F9]">
            {filtered.map(u => (
              <div key={u.id}>
                {/* Main row */}
                <div className="flex items-center gap-3 px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                  <Avatar name={u.name} email={u.email} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-[#1E293B]">{u.name ?? '—'}</span>
                      <RoleBadge role={u.role} />
                    </div>
                    <div className="text-xs text-[#64748B] truncate mt-0.5">{u.email}</div>
                  </div>

                  {/* Stats - hidden on mobile */}
                  <div className="hidden md:flex items-center gap-4 shrink-0">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-[#334155]">{u.enrollmentCount}</div>
                      <div className="text-[10px] text-[#94A3B8]">khóa</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-[#334155]">{u.completedCount}</div>
                      <div className="text-[10px] text-[#94A3B8]">bài xong</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-[#334155]">{u.examAttemptCount}</div>
                      <div className="text-[10px] text-[#94A3B8]">lượt thi</div>
                    </div>
                    {u.avgExamScore !== null && (
                      <div className="text-center">
                        <div className={`text-sm font-semibold ${u.avgExamScore >= 80 ? 'text-green-600' : u.avgExamScore >= 50 ? 'text-amber-600' : 'text-red-500'}`}>{u.avgExamScore}%</div>
                        <div className="text-[10px] text-[#94A3B8]">TB thi</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-xs text-[#64748B]">{formatRelative(u.lastActive)}</div>
                      <div className="text-[10px] text-[#94A3B8]">last active</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[#94A3B8]">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</div>
                      <div className="text-[10px] text-[#94A3B8]">đăng ký</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <UserActions user={u} currentUserId={currentUserId} onRefresh={() => router.refresh()} />
                    <button onClick={() => toggleExpand(u.id)}
                      className="p-1.5 rounded-lg hover:bg-[#E2E8F0] text-[#94A3B8] hover:text-[#334155] transition-colors">
                      {expandedId === u.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedId === u.id && <ExpandedDetail user={u} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
