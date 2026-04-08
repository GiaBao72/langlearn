'use client'

import { useState } from 'react'

interface RecentProgressItem {
  score: number; completedAt: string; exerciseType: string
  exerciseQuestion: string | null; lessonTitle: string | null; courseTitle: string | null
}

interface LoginHistoryItem {
  id: string; loginAt: string; ipAddress: string | null
}

interface Props {
  user: { userId: string; email: string; role: string; name: string; createdAt: string }
  recentProgress: RecentProgressItem[]
  loginHistory: LoginHistoryItem[]
  studyByDay: Record<string, number>   // "YYYY-MM-DD" → seconds
  totalStudySecs: number
}

function fmtDuration(secs: number) {
  if (secs < 60) return `${secs}s`
  if (secs < 3600) return `${Math.floor(secs / 60)} phút`
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  return m > 0 ? `${h}g ${m}p` : `${h} giờ`
}

// Mini heatmap — 30 ô = 30 ngày
function StudyHeatmap({ studyByDay }: { studyByDay: Record<string, number> }) {
  const days: { date: string; secs: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })
    days.push({ date: key, secs: studyByDay[key] || 0 })
  }

  function color(secs: number) {
    if (secs === 0) return 'bg-slate-100'
    if (secs < 300) return 'bg-blue-100'
    if (secs < 900) return 'bg-blue-300'
    if (secs < 1800) return 'bg-blue-500'
    return 'bg-blue-700'
  }

  return (
    <div>
      <p className="text-xs text-[#94A3B8] mb-2">30 ngày gần nhất</p>
      <div className="flex gap-1 flex-wrap">
        {days.map(d => (
          <div key={d.date} title={`${d.date}: ${fmtDuration(d.secs)}`}
            className={`w-5 h-5 rounded-sm ${color(d.secs)} transition-colors cursor-default`} />
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-xs text-[#94A3B8]">Ít</span>
        {['bg-slate-100','bg-blue-100','bg-blue-300','bg-blue-500','bg-blue-700'].map(c => (
          <div key={c} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-xs text-[#94A3B8]">Nhiều</span>
      </div>
    </div>
  )
}

export default function ProfileClient({ user, recentProgress, loginHistory, studyByDay, totalStudySecs }: Props) {
  const [name, setName] = useState(user.name || '')
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
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }),
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
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
    })
    const data = await res.json()
    setLoadingPw(false)
    if (res.ok) { setMsgPw({ type: 'ok', text: '✅ Đã đổi mật khẩu' }); setCurPw(''); setNewPw(''); setConfirmPw('') }
    else setMsgPw({ type: 'err', text: `❌ ${data.error || 'Đổi mật khẩu thất bại'}` })
  }

  const inp = 'w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2563EB]'

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 space-y-1">
        <div className="text-xs text-[#64748B] uppercase tracking-widest mb-3">Thông tin tài khoản</div>
        <div className="text-sm"><span className="text-[#64748B]">Email:</span> <span className="font-medium text-[#334155]">{user.email}</span></div>
        <div className="text-sm"><span className="text-[#64748B]">Vai trò:</span> <span className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span></div>
        {user.createdAt && <div className="text-sm"><span className="text-[#64748B]">Tham gia:</span> <span className="font-medium text-[#334155]">{new Date(user.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span></div>}
      </div>

      {/* Study stats */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
        <div className="text-xs text-[#64748B] uppercase tracking-widest mb-4">📊 Thống kê học tập</div>
        <div className="flex gap-4 mb-5">
          <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#2563EB]">{fmtDuration(totalStudySecs)}</p>
            <p className="text-xs text-[#64748B] mt-0.5">Tổng thời gian học (30 ngày)</p>
          </div>
          <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-[#334155]">{Object.keys(studyByDay).length}</p>
            <p className="text-xs text-[#64748B] mt-0.5">Ngày có hoạt động</p>
          </div>
        </div>
        <StudyHeatmap studyByDay={studyByDay} />
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
            className="bg-[#2563EB] text-white px-4 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loadingName ? '...' : 'Lưu'}
          </button>
        </div>
        {msgName && <p className={`text-sm mt-2 ${msgName.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{msgName.text}</p>}
      </div>

      {/* Change password */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
        <div className="text-xs text-[#64748B] uppercase tracking-widest mb-4">Đổi mật khẩu</div>
        <div className="space-y-3">
          <input type="password" value={curPw} onChange={e => setCurPw(e.target.value)} placeholder="Mật khẩu hiện tại" className={inp} />
          <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" className={inp} />
          <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Xác nhận mật khẩu mới" className={inp} />
          <button onClick={savePassword} disabled={loadingPw}
            className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loadingPw ? 'Đang lưu...' : 'Đổi mật khẩu'}
          </button>
          {msgPw && <p className={`text-sm ${msgPw.type === 'ok' ? 'text-green-600' : 'text-red-500'}`}>{msgPw.text}</p>}
        </div>
      </div>

      {/* Login history */}
      {loginHistory.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
          <div className="text-xs text-[#64748B] uppercase tracking-widest mb-4">🔐 Lịch sử đăng nhập</div>
          <div className="space-y-2">
            {loginHistory.map((l, i) => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
                <div className="flex items-center gap-2">
                  {i === 0 && <span className="text-xs bg-green-100 text-green-600 font-semibold px-2 py-0.5 rounded-full">Lần này</span>}
                  <span className="text-xs text-[#94A3B8]">{l.ipAddress || 'Unknown'}</span>
                </div>
                <span className="text-xs text-[#64748B]">
                  {new Date(l.loginAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent progress */}
      {recentProgress.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5">
          <div className="text-xs text-[#64748B] uppercase tracking-widest mb-4">📚 Bài tập gần đây</div>
          <div className="space-y-2">
            {recentProgress.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#64748B]">{p.courseTitle} · {p.lessonTitle}</p>
                  <p className="text-sm text-[#334155] truncate">{p.exerciseQuestion || `(${p.exerciseType})`}</p>
                </div>
                <div className="flex items-center gap-3 ml-3 shrink-0">
                  <span className="text-sm font-semibold text-[#2563EB]">+{p.score}đ</span>
                  <span className="text-xs text-[#94A3B8]">{new Date(p.completedAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
