import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";
import PageTransition from '@/components/PageTransition';
import MascotLoader from '@/components/MascotLoader'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'G-Deutsch — Học ngoại ngữ hiệu quả',
  description: 'Nền tảng học ngoại ngữ thông minh với phương pháp Spaced Repetition và luyện tập thực chiến.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'G-Deutsch',
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

const websiteSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://tuhoctiengduc.giabaobooks.vn/#website',
      url: 'https://tuhoctiengduc.giabaobooks.vn/',
      name: 'G-Deutsch — Tự Học Tiếng Đức',
      description: 'Nền tảng học tiếng Đức với Spaced Repetition, lộ trình A1→C2, kết hợp bộ sách 5 Phút Tiếng Đức.',
      inLanguage: 'vi',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://tuhoctiengduc.giabaobooks.vn/blog?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Book',
      '@id': 'https://5phuttiengduc.giabaobooks.vn/#book',
      name: '5 Phút Tiếng Đức',
      author: { '@type': 'Person', name: 'Gia Bảo' },
      url: 'https://5phuttiengduc.giabaobooks.vn/',
      inLanguage: 'vi',
      bookFormat: 'https://schema.org/Paperback',
      description: '200 mẩu chuyện ngắn + 200 file audio bản xứ + PDF 500 từ vựng cốt lõi. Học tiếng Đức 5 phút mỗi ngày — nhận sách rồi mới thanh toán.',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '1247',
        bestRating: '5',
      },
      offers: {
        '@type': 'Offer',
        price: '149000',
        priceCurrency: 'VND',
        availability: 'https://schema.org/InStock',
        url: 'https://5phuttiengduc.giabaobooks.vn/',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://tuhoctiengduc.giabaobooks.vn/#org',
      name: 'GiaBao Books',
      url: 'https://giabaobooks.vn',
      sameAs: ['https://5phuttiengduc.giabaobooks.vn/'],
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        {/* Lottie web component */}
        <script
          src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.3/dist/dotlottie-wc.js"
          type="module"
          async
        />
      </head>
      <body className={cn("font-sans antialiased", geist.variable)} suppressHydrationWarning>
        <PageTransition>{children}</PageTransition>
        <MascotLoader />
        
      </body>
    </html>
  )
}
