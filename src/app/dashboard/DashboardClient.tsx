'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Flame, Target, Trophy, ArrowRight } from 'lucide-react'
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
  heatmap: HeatmapDay[]
  nextLesson: { id: string; title: string; courseTitle: string } | null
  recentProgress: {
    id: string
    score: number
    completedAt: string
    lessonTitle: string
    courseTitle: string
  }[]
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
          title={`${day.date}: ${day.count} bai`}
          className={`w-6 h-6 rounded-sm ${getColor(day.count)}`}
        />
      ))}
    </div>
  )
}

export default function DashboardClient() {
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {loading && (
        <div className="flex items-center justify-center h-64 text-[#64748B]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Dang tai...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-[#64748B] mb-4">Vui long dang nhap de xem dashboard</p>
            <Link href="/login" className="bg-[#2563EB] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Dang nhap
            </Link>
          </div>
        </div>
      )}

      {data && (
        <>
          {/* Hero row */}
          <div className="mb-6 sm:mb-8 flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#334155]">
                Chao, ban!
              </h1>
              <p className="text-[#64748B] text-sm sm:text-base mt-1">Hom nay hoc gi nao?</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {data.streak > 0 && (
                <Badge className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-orange-50">
                  <Flame className="w-4 h-4" />
                  {data.streak} ngay streak
                </Badge>
              )}
              <Badge className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-[#2563EB] px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-50">
                <Trophy className="w-4 h-4" />
                {data.totalScore} diem
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
                <div className="text-2xl font-bold text-[#334155] mb-0.5">{data.completedCount}</div>
                <div className="text-[#64748B] text-sm">Bai da lam</div>
              </CardContent>
            </Card>

            <Card className="border border-[#E2E8F0] rounded-xl shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                  <Trophy className="w-5 h-5 text-[#10B981]" />
                </div>
                <div className="text-2xl font-bold text-[#334155] mb-0.5">{data.totalScore}</div>
                <div className="text-[#64748B] text-sm">Tong diem</div>
              </CardContent>
            </Card>

            <Card className="border border-[#E2E8F0] rounded-xl shadow-sm">
              <CardContent className="p-4 sm:p-5">
                <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center mb-3">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-[#334155] mb-0.5">{data.streak}</div>
                <div className="text-[#64748B] text-sm">Ngay streak</div>
                <Progress value={Math.min(100, data.streak * 10)} className="mt-2 h-1.5" />
              </CardContent>
            </Card>
          </div>

          {/* Heatmap 30 ngay */}
          <Card className="border border-[#E2E8F0] rounded-xl shadow-sm mb-6 sm:mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="font-semibold text-[#334155] text-sm sm:text-base">Hoat dong 30 ngay qua</CardTitle>
            </CardHeader>
            <CardContent>
              <Heatmap days={data.heatmap} />
              <div className="flex items-center gap-4 mt-3">
                <p className="text-[#64748B] text-xs">Moi o = 1 ngay</p>
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <span className="w-3 h-3 rounded-sm bg-[#E2E8F0] inline-block" />
                  Khong hoc
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <span className="w-3 h-3 rounded-sm bg-blue-200 inline-block" />
                  1-2 bai
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <span className="w-3 h-3 rounded-sm bg-[#2563EB] inline-block" />
                  3+ bai
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Continue learning */}
          {data.nextLesson ? (
            <div className="mb-6 sm:mb-8">
              <h2 className="font-semibold text-[#334155] mb-3 text-sm sm:text-base">Tiep tuc hoc</h2>
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
                <p className="text-[#10B981] font-semibold">Ban da hoan thanh tat ca bai hoc!</p>
                <p className="text-[#64748B] text-sm mt-1">Hay kham pha them khoa hoc moi</p>
              </div>
            </div>
          )}

          {/* All courses */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#334155] text-sm sm:text-base">Tat ca khoa hoc</h2>
            <Link href="/courses" className="flex items-center gap-1 text-[#2563EB] text-sm hover:underline font-medium">
              <BookOpen className="w-4 h-4" />
              Xem tat ca
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
