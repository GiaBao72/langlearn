'use client'

import { useEffect, useState } from 'react'

interface Entry {
  rank: number
  displayName: string
  totalScore: number
  exerciseCount: number
}

interface LeaderboardData {
  entries: Entry[]
  mode: string
  weekStart: string
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardClient() {
  const [mode, setMode] = useState<'weekly' | 'alltime'>('weekly')
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/leaderboard?mode=${mode}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [mode])

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex bg-white border border-[#E2E8F0] rounded-xl p-1 mb-6 w-fit">
        {(['weekly', 'alltime'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m ? 'bg-[#2563EB] text-white' : 'text-[#64748B] hover:text-[#334155]'
            }`}>
            {m === 'weekly' ? '📅 Tuần này' : '🌟 Tất cả'}
          </button>
        ))}
      </div>

      {mode === 'weekly' && data?.weekStart && (
        <p className="text-xs text-[#64748B] mb-4">
          Từ {new Date(data.weekStart).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' })} đến nay
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white border border-[#E2E8F0] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !data?.entries.length ? (
        <div className="text-center py-16 bg-white border border-[#E2E8F0] rounded-2xl">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-[#64748B] text-sm">
            {mode === 'weekly' ? 'Chưa có ai học tuần này. Hãy là người đầu tiên! 🚀' : 'Chưa có dữ liệu.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.entries.map((entry, i) => (
            <div key={i}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                i === 0 ? 'bg-yellow-50 border-yellow-200' :
                i === 1 ? 'bg-slate-50 border-slate-200' :
                i === 2 ? 'bg-orange-50 border-orange-200' :
                'bg-white border-[#E2E8F0]'
              }`}>
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                {i < 3 ? (
                  <span className="text-xl">{MEDALS[i]}</span>
                ) : (
                  <span className="text-sm font-bold text-[#64748B]">#{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                i === 0 ? 'bg-yellow-200 text-yellow-700' :
                i === 1 ? 'bg-slate-200 text-slate-600' :
                i === 2 ? 'bg-orange-200 text-orange-700' :
                'bg-blue-100 text-blue-600'
              }`}>
                {entry.displayName.charAt(0).toUpperCase()}
              </div>

              {/* Name + stats */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#334155] text-sm truncate">{entry.displayName}</p>
                <p className="text-[#64748B] text-xs">{entry.exerciseCount} bài tập</p>
              </div>

              {/* Score */}
              <div className="text-right flex-shrink-0">
                <p className={`font-bold text-base ${i === 0 ? 'text-yellow-600' : i === 1 ? 'text-slate-500' : i === 2 ? 'text-orange-600' : 'text-[#2563EB]'}`}>
                  {entry.totalScore.toLocaleString()}
                </p>
                <p className="text-[#64748B] text-xs">điểm</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
