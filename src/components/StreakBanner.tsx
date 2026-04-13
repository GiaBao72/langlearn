'use client'

import Link from 'next/link'

interface Props {
  streak: number
  studiedToday: boolean
  nextLesson: { id: string; title: string; courseTitle: string } | null
}

export default function StreakBanner({ streak, studiedToday, nextLesson }: Props) {
  if (studiedToday) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4 mb-6">
      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
        <span style={{
          fontSize: 36,
          lineHeight: 1,
          animation: 'flame-pulse 1.2s ease-in-out infinite',
          transformOrigin: 'bottom center',
          display: 'inline-block',
        }}>🔥</span>
      </div>
      <div className="flex-1 min-w-0">
        {streak > 0 ? (
          <>
            <p className="font-semibold text-amber-800 text-sm">
              Đừng để mất streak {streak} ngày của bạn!
            </p>
            <p className="text-amber-600 text-xs mt-0.5">
              Hôm nay chưa học bài nào. Chỉ cần 5 phút thôi!
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold text-amber-800 text-sm">Hôm nay chưa học bài nào!</p>
            <p className="text-amber-600 text-xs mt-0.5">Bắt đầu streak của bạn ngay hôm nay 🚀</p>
          </>
        )}
      </div>
      {nextLesson && (
        <Link href={`/practice/${nextLesson.id}`}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors flex-shrink-0 whitespace-nowrap">
          Học ngay →
        </Link>
      )}
    </div>
  )
}
