import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LangLearn — Học ngoại ngữ hiệu quả',
  description: 'Nền tảng học ngoại ngữ thông minh với phương pháp Spaced Repetition và luyện tập thực chiến.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" style={{ colorScheme: 'light' }}>
      <body className={inter.className} style={{ backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  )
}
