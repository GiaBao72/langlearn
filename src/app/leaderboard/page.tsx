import Navbar from '@/components/Navbar'
import LeaderboardClient from './LeaderboardClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bảng xếp hạng — LangLearn',
  description: 'Top học viên LangLearn tuần này và mọi thời đại.',
}

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-10 sm:py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#334155] mb-1">🏆 Bảng xếp hạng</h1>
          <p className="text-[#64748B] text-sm">Top học viên tích cực nhất</p>
        </div>
        <LeaderboardClient />
      </div>
    </div>
  )
}
