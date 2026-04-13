import Navbar from '@/components/Navbar'
import HomePageClient from '@/components/HomePageClient'
import { getCurrentUser } from '@/lib/auth'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'G-Deutsch — Học tiếng Đức thông minh hơn mỗi ngày',
  description: 'Hệ thống học tiếng Đức với Spaced Repetition, 5 dạng bài tập, lộ trình A1→C2 rõ ràng. Miễn phí, không cần cài app.',
}

export default async function HomePage() {
  const user = await getCurrentUser()
  return (
    <>
      <Navbar />
      <HomePageClient isLoggedIn={!!user} />
    </>
  )
}
