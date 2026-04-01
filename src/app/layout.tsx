import type { Metadata, Viewport } from 'next'
import { Inter, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";
import PageTransition from '@/components/PageTransition';
import MascotLoader from '@/components/MascotLoader';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'LangLearn — Học ngoại ngữ hiệu quả',
  description: 'Nền tảng học ngoại ngữ thông minh với phương pháp Spaced Repetition và luyện tập thực chiến.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LangLearn',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192' },
    ],
  },
}

// Script chạy trước khi render — đọc localStorage và set class dark ngay lập tức
const themeScript = `
(function() {
  try {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved ? saved === 'dark' : prefersDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.style.colorScheme = 'light';
    }
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Lottie web component */}
        <script
          src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.3/dist/dotlottie-wc.js"
          type="module"
          async
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <PageTransition>{children}</PageTransition>
        <MascotLoader />
      </body>
    </html>
  )
}
