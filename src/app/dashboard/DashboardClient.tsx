'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { BookOpen, Flame, Target, Trophy, ArrowRight } from 'lucide-react'
import useAutoRefresh from '@/hooks/useAutoRefresh'
import StreakBanner from '@/components/StreakBanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface HeatmapDay {
  date: string
  count: number
}

interface DashboardData {
  totalScore: number
  completedCount: number
  streak: number
  studiedToday: boolean
  heatmap: HeatmapDay[]
  nextLesson: { id: string; title: string; courseTitle: string } | null
  inProgressLessons: {
    id: string
    title: string
    courseTitle: string
    courseId: string
    done: number
    total: number
  }[]
  recentProgress: {
    id: string
    score: number
    completedAt: string
    lessonTitle: string
    courseTitle: string
  }[]
}

function useCountUp(target: number, duration = 1000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}

function Heatmap({ days }: { days: HeatmapDay[] }) {
  function getColor(count: number) {
    if (count === 0) return 'bg-[#E2E8F0]'
    if (count <= 2) return 'bg-blue-200'
    return 'bg-[#2563EB]'
  }

  return (
    <div className="grid grid-cols-10 gap-1">
      {days.map((day) => (
        <div
          key={day.date}
          title={`${day.date}: ${day.count} bài`}
          className={`w-6 h-6 rounded-sm ${getColor(day.count)}`}
        />
      ))}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-pulse">
      <div className="mb-8">
        <div className="h-8 bg-slate-200 rounded w-48 mb-2" />
        <div className="h-4 bg-slate-100 rounded w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1,2,3].map(i => (
          <div key={i} className="border border-[#E2E8F0] rounded-xl p-5">
            <div className="w-9 h-9 bg-slate-200 rounded-lg mb-3" />
            <div className="h-7 bg-slate-200 rounded w-16 mb-1" />
            <div className="h-4 bg-slate-100 rounded w-24" />
          </div>
        ))}
      </div>
      <div className="border border-[#E2E8F0] rounded-xl p-5 mb-8">
        <div className="h-5 bg-slate-200 rounded w-40 mb-4" />
        <div className="grid grid-cols-10 gap-1">
          {Array.from({length: 30}).map((_, i) => (
            <div key={i} className="w-6 h-6 rounded-sm bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DashboardClient() {
  useAutoRefresh()
  const searchParams = useSearchParams()
  const isWelcome = searchParams.get('welcome') === '1'
  const [showWelcome, setShowWelcome] = useState(isWelcome)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized')
        return res.json()
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Count-up hooks must be called unconditionally (Rules of Hooks)
  const animatedCompletedCount = useCountUp(data?.completedCount ?? 0)
  const animatedTotalScore = useCountUp(data?.totalScore ?? 0)
  const animatedStreak = useCountUp(data?.streak ?? 0)

  if (loading) return <DashboardSkeleton />

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-[#64748B] mb-4">Vui lòng đăng nhập để xem dashboard</p>
          <Link href="/login" className="bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Welcome banner */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-5 flex items-center justify-between gap-4 mb-6 shadow-md">
          <div>
            <p className="font-bold text-lg">🎉 Chào mừng đến với LangLearn!</p>
            <p className="text-blue-100 text-sm mt-0.5">Tài khoản của bạn đã sẵn sàng. Bắt đầu học ngay thôi!</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/courses" className="bg-white text-[#2563EB] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">
              Xem khóa học
            </Link>
            <button onClick={() => setShowWelcome(false)} className="text-blue-200 hover:text-white text-xl leading-none">×</button>
          </div>
        </div>
      )}
      {/* Streak Banner */}
      <StreakBanner
        streak={data.streak}
        studiedToday={data.studiedToday}
        nextLesson={data.nextLesson}
      />
      {/* Hero row */}
      <div className="mb-6 sm:mb-8 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#334155]">
            Xin chào! 👋
          </h1>
          <p className="text-[#64748B] text-sm sm:text-base mt-1">Hôm nay học gì nào?</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {data.streak > 0 && (
            <Badge className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-orange-50">
              <Flame className="w-4 h-4" />
              {data.streak} ngày streak
            </Badge>
          )}
          <Badge className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-[#2563EB] px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-50">
            <Trophy className="w-4 h-4" />
            {data.totalScore} điểm
          </Badge>
        </div>
      </div>

      {/* Stats row - 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Card className="border border-[#E2E8F0] rounded-xl shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div className="text-2xl font-bold text-[#334155] mb-0.5">{animatedCompletedCount}</div>
            <div className="text-[#64748B] text-sm">Bài đã làm</div>
          </CardContent>
        </Card>

        <Card className="border border-[#E2E8F0] rounded-xl shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5 text-[#10B981]" />
            </div>
            <div className="text-2xl font-bold text-[#334155] mb-0.5">{animatedTotalScore}</div>
            <div className="text-[#64748B] text-sm">Tổng điểm</div>
          </CardContent>
        </Card>

        <Card className="border border-[#E2E8F0] rounded-xl shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-[#334155] mb-0.5">{animatedStreak}</div>
            <div className="text-[#64748B] text-sm">Ngày streak</div>
            <Progress value={Math.min(100, data.streak * 10)} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Heatmap 30 ngày */}
      <Card className="border border-[#E2E8F0] rounded-xl shadow-sm mb-6 sm:mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="font-semibold text-[#334155] text-sm sm:text-base">Hoạt động 30 ngày qua</CardTitle>
        </CardHeader>
        <CardContent>
          <Heatmap days={data.heatmap} />
          <div className="flex items-center gap-4 mt-3">
            <p className="text-[#64748B] text-xs">Mỗi ô = 1 ngày</p>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="w-3 h-3 rounded-sm bg-[#E2E8F0] inline-block" />
              Không học
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="w-3 h-3 rounded-sm bg-blue-200 inline-block" />
              1-2 bài
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="w-3 h-3 rounded-sm bg-[#2563EB] inline-block" />
              3+ bài
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continue learning */}
      {data.nextLesson ? (
        <div className="mb-6 sm:mb-8">
          <h2 className="font-semibold text-[#334155] mb-3 text-sm sm:text-base">Tiếp tục học</h2>
          <Link href={`/practice/${data.nextLesson.id}`} className="block">
            <Card className="border border-[#E2E8F0] rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#64748B] mb-1 font-medium">{data.nextLesson.courseTitle}</p>
                    <p className="font-semibold text-[#334155] group-hover:text-[#2563EB] transition-colors">
                      {data.nextLesson.title}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-[#2563EB] rounded-lg flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      ) : (
        <div className="mb-6 sm:mb-8">
          <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-4 sm:p-5 text-center">
            <p className="text-[#10B981] font-semibold">Bạn đã hoàn thành tất cả bài học! 🎉</p>
            <p className="text-[#64748B] text-sm mt-1">Hãy khám phá thêm khóa học mới</p>
          </div>
        </div>
      )}

      {/* Bài đang dở */}
      {data.inProgressLessons && data.inProgressLessons.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="font-semibold text-[#334155] mb-3 text-sm sm:text-base">📖 Bài đang học dở ({data.inProgressLessons.length})</h2>
          <div className="space-y-2">
            {data.inProgressLessons.map((lesson) => {
              const pct = Math.round((lesson.done / lesson.total) * 100)
              return (
                <Link key={lesson.id} href={`/practice/${lesson.id}`}>
                  <Card className="border border-[#E2E8F0] rounded-xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all group">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-[#64748B] mb-0.5">{lesson.courseTitle}</p>
                          <p className="font-medium text-[#334155] group-hover:text-[#2563EB] transition-colors text-sm truncate">{lesson.title}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 bg-[#2563EB] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-[#64748B] w-8">{pct}%</span>
                          <ArrowRight className="w-4 h-4 text-[#2563EB]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* All courses */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#334155] text-sm sm:text-base">Tất cả khóa học</h2>
        <Link href="/courses" className="flex items-center gap-1 text-[#2563EB] text-sm hover:underline font-medium">
          <BookOpen className="w-4 h-4" />
          Xem tất cả
        </Link>
      </div>
    </div>
  )
}
