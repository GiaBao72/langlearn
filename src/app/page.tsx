import Navbar from '@/components/Navbar'
import HomePageClient from '@/components/HomePageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'G-Deutsch — Học tiếng Đức thông minh hơn mỗi ngày',
  description: 'Hệ thống học tiếng Đức với Spaced Repetition, 5 dạng bài tập, lộ trình A1→C2 rõ ràng. Miễn phí, không cần cài app.',
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <HomePageClient />
    </>
  )
}
