import { prisma } from '@/lib/prisma'
import {
  Users, BookOpen, FileText, GraduationCap, ClipboardList,
  Dumbbell, TrendingUp, UserCheck, CheckCircle2, Clock,
  Sparkles, ChevronRight,
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function StatCard({ icon: Icon, label, value, sub, href, color, bg }: {
  icon: React.ElementType; label: string; value: number | string
  sub?: string; href: string; color: string; bg: string
}) {
  return (
    <Link href={href}
      className="bg-white border border-[#E2E8F0] rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all group flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl ${bg}`}>
          <Icon size={18} className={color} />
        </div>
        <ChevronRight size={14} className="text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors" />
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-bold text-[#1E293B]">{typeof value === 'number' ? value.toLocaleString('vi-VN') : value}</div>
        <div className="text-sm text-[#64748B] mt-0.5">{label}</div>
        {sub && <div className="text-xs text-[#94A3B8] mt-1">{sub}</div>}
      </div>
    </Link>
  )
}

export default async function AdminPage() {
  const [
    userCount, newUsers7d,
    courseCount, pubCourseCount,
    lessonCount, examCount, exerciseCount,
    attemptCount, completionCount, enrollmentCount,
    blogCount,
    recentUsers, recentAttempts,
    topExams,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    prisma.course.count(),
    prisma.course.count({ where: { published: true } }),
    prisma.lesson.count(),
    prisma.exam.count(),
    prisma.exercise.count(),
    prisma.examAttempt.count(),
    prisma.lessonCompletion.count(),
    prisma.courseEnrollment.count(),
    prisma.blogPost.count(),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' }, take: 5,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
    prisma.examAttempt.findMany({
      orderBy: { startedAt: 'desc' }, take: 6,
      select: {
        id: true, score: true, maxScore: true, passed: true, startedAt: true,
        user: { select: { name: true, email: true } },
        exam: { select: { title: true } },
      },
    }),
    prisma.examAttempt.groupBy({
      by: ['examId'], _count: { id: true },
      orderBy: { _count: { id: 'desc' } }, take: 5,
    }),
  ])

  // Fetch exam titles for topExams
  const topExamIds = topExams.map(e => e.examId)
  const topExamDetails = topExamIds.length > 0
    ? await prisma.exam.findMany({ where: { id: { in: topExamIds } }, select: { id: true, title: true } })
    : []
  const examTitleMap = Object.fromEntries(topExamDetails.map(e => [e.id, e.title]))

  const statCards = [
    { icon: Users, label: 'Người dùng', value: userCount, sub: `+${newUsers7d} trong 7 ngày qua`, href: '/admin/users', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: BookOpen, label: 'Khóa học', value: courseCount, sub: `${pubCourseCount} đã đăng`, href: '/admin/courses', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: GraduationCap, label: 'Bài học', value: lessonCount, sub: `${exerciseCount.toLocaleString('vi-VN')} bài tập`, href: '/admin/courses', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { icon: ClipboardList, label: 'Bài kiểm tra', value: examCount, sub: `${attemptCount} lượt thi`, href: '/admin/exams', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: UserCheck, label: 'Lượt đăng ký khóa học', value: enrollmentCount, sub: 'tổng lượt user đăng ký vào khóa', href: '/admin/users', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: CheckCircle2, label: 'Bài đã hoàn thành', value: completionCount, sub: 'lesson completions', href: '/admin/stats', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: FileText, label: 'Bài viết blog', value: blogCount, sub: '', href: '/admin/blog', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: Dumbbell, label: 'Bài tập', value: exerciseCount, sub: `trên ${lessonCount} bài học`, href: '/admin/exercises', color: 'text-rose-600', bg: 'bg-rose-50' },
  ]

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E293B]">Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-1">Tổng quan hệ thống G-Deutsch</p>
        </div>
        <Link href="/admin/ai-generate"
          className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          <Sparkles size={15} /> AI Tạo Đề
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Bottom 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent users */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[#64748B]" />
              <h2 className="font-semibold text-[#334155]">Người dùng mới nhất</h2>
            </div>
            <Link href="/admin/users" className="text-xs text-[#2563EB] hover:underline">Xem tất cả</Link>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFC] transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(u.name ?? u.email).slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#334155] truncate">{u.name ?? '—'}</div>
                  <div className="text-xs text-[#94A3B8] truncate">{u.email}</div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {u.role}
                  </span>
                  <span className="text-[10px] text-[#CBD5E1]">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <div className="text-center py-8 text-[#94A3B8] text-sm">Chưa có người dùng</div>
            )}
          </div>
        </div>

        {/* Right col: recent attempts + top exams */}
        <div className="flex flex-col gap-5">

          {/* Recent exam attempts */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#64748B]" />
                <h2 className="font-semibold text-[#334155]">Lượt thi gần nhất</h2>
              </div>
              <Link href="/admin/exams" className="text-xs text-[#2563EB] hover:underline">Xem bài kiểm tra</Link>
            </div>
            <div className="divide-y divide-[#F1F5F9]">
              {recentAttempts.map(a => (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#334155] truncate">{a.exam.title}</div>
                    <div className="text-xs text-[#94A3B8] truncate">{a.user.name ?? a.user.email}</div>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className={`text-xs font-semibold ${a.maxScore > 0 ? (a.score / a.maxScore >= 0.8 ? 'text-green-600' : a.score / a.maxScore >= 0.5 ? 'text-amber-600' : 'text-red-500') : 'text-[#94A3B8]'}`}>
                      {a.maxScore > 0 ? `${a.score}/${a.maxScore}` : '—'}
                    </span>
                    <span className="text-[10px] text-[#CBD5E1] flex items-center gap-0.5">
                      <Clock size={9} />
                      {new Date(a.startedAt).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {recentAttempts.length === 0 && (
                <div className="text-center py-8 text-[#94A3B8] text-sm">Chưa có lượt thi nào</div>
              )}
            </div>
          </div>

          {/* Top exams by attempts */}
          {topExams.length > 0 && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-2">
                <ClipboardList size={16} className="text-[#64748B]" />
                <h2 className="font-semibold text-[#334155]">Bài thi được làm nhiều nhất</h2>
              </div>
              <div className="divide-y divide-[#F1F5F9]">
                {topExams.map((e, i) => (
                  <div key={e.examId} className="flex items-center gap-3 px-5 py-3 hover:bg-[#F8FAFC] transition-colors">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'}`}>
                      {i + 1}
                    </span>
                    <span className="flex-1 min-w-0 text-sm text-[#334155] truncate">{examTitleMap[e.examId] ?? e.examId}</span>
                    <span className="text-sm font-semibold text-[#2563EB] shrink-0">{e._count.id} lượt</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
