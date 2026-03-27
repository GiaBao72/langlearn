import type { Metadata } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";
import PageTransition from '@/components/PageTransition';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LangLearn — Học ngoại ngữ hiệu quả',
  description: 'Nền tảng học ngoại ngữ thông minh với phương pháp Spaced Repetition và luyện tập thực chiến.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" style={{ colorScheme: 'light' }} className={cn("font-sans", geist.variable)}>
      <body className={inter.className} style={{ backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh' }}>
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
