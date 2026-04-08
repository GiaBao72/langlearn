import Link from 'next/link'
import FaqAccordion from './FaqAccordion'
import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '5 Phút Tiếng Đức — Sách học tiếng Đức cho người bận rộn | G-Deutsch',
  description: '200 bài học · 500+ từ vựng cốt lõi · 200 file audio bản xứ · PDF từ vựng. Học tiếng Đức chỉ 5 phút mỗi ngày. Nhận sách, ưng ý rồi mới thanh toán.',
}

const reasons = [
  {
    icon: (
      <svg className="w-7 h-7 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Học thụ động, tự nhiên',
    desc: 'Không nhồi nhét ngữ pháp khô khan. Mỗi bài là một mẩu chuyện ngắn — não bộ hấp thụ ngôn ngữ một cách tự nhiên.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 18.364a7 7 0 000-12.728M8.464 8.464a5 5 0 000 7.072" />
      </svg>
    ),
    title: '200 file audio bản xứ',
    desc: 'Mỗi mẩu chuyện kèm 1 file audio chuẩn giọng Đức. Nghe đúng từ đầu — không lo học sai phát âm.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Nhận sách rồi mới trả tiền',
    desc: 'Đặt hàng → nhận sách tận tay → ưng ý rồi mới thanh toán. Mua sắm không rủi ro.',
  },
]

const faqs = [
  {
    q: 'Combo gồm những gì?',
    a: '1 cuốn sách in + 200 file audio MP3 chuẩn giọng bản xứ Đức + PDF 500 từ vựng cốt lõi. Tất cả trong một combo duy nhất.',
  },
  {
    q: 'Sách phù hợp với trình độ nào?',
    a: 'Phù hợp cho người mới hoàn toàn đến trung cấp. Nội dung xây dựng theo phương pháp học thụ động — bạn đọc chuyện, nghe audio, từ vựng tự ngấm vào não mà không cần học thuộc lòng.',
  },
  {
    q: 'File audio nhận ở đâu?',
    a: 'Sau khi nhận sách và thanh toán, bạn sẽ nhận link tải 200 file audio MP3 qua Messenger/Zalo. Dùng được trên mọi thiết bị.',
  },
  {
    q: 'Chính sách "nhận sách rồi mới thanh toán" là sao?',
    a: 'Sách được giao đến tận tay bạn. Bạn xem qua, cảm thấy ưng ý rồi mới cần chuyển khoản. Không hài lòng thì trả lại — không mất đồng nào.',
  },
  {
    q: 'Đặt nhiều cuốn có giảm thêm không?',
    a: 'Có! Đặt từ 2 cuốn trở lên nhận giảm thêm 10%, từ 3 cuốn giảm 15%. Liên hệ qua Messenger để đặt combo.',
  },
]

export default function StorePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Hero */}
      <section className="bg-white border-b border-[#E2E8F0] py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-widest mb-3">Sách học tiếng Đức</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#334155] leading-tight mb-4">
            Chinh phục tiếng Đức<br className="hidden sm:block" /> chỉ với 5 phút mỗi ngày
          </h1>
          <p className="text-[#64748B] text-lg leading-relaxed mb-6">
            200 mẩu chuyện ngắn · 500+ từ vựng cốt lõi · học thụ động, không nhồi nhét
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-[#64748B]">
            <span>📦 <strong className="text-[#334155]">3,200+</strong> đơn đã giao</span>
            <span>⭐ <strong className="text-[#334155]">4.9/5</strong> đánh giá</span>
            <span>🎓 <strong className="text-[#334155]">1,247</strong> người học</span>
          </div>
        </div>
      </section>

      {/* Featured Product */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* Book cover */}
            <div className="sm:w-56 shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-8 min-h-[200px]">
              <div className="text-center text-white">
                <div className="text-5xl mb-3">📘</div>
                <div className="font-extrabold text-base leading-tight">5 Phút<br />Tiếng Đức</div>
                <div className="text-blue-200 text-xs mt-2">200 bài · 500+ từ</div>
                <div className="flex justify-center gap-0.5 mt-2">
                  {[1,2,3,4,5].map(i => <span key={i} className="text-amber-300 text-xs">★</span>)}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col gap-4 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                  🔥 Bán chạy nhất
                </span>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-200">
                  ✅ Nhận sách rồi mới trả tiền
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#334155]">5 Phút Tiếng Đức</h2>

              <p className="text-[#64748B] text-sm leading-relaxed">
                Mỗi ngày 1 mẩu chuyện ngắn tiếng Đức + dịch tiếng Việt + 2 từ vựng nổi bật + phiên âm dễ đọc + câu danh ngôn.
                200 bài học, 200 mẩu chuyện — 500+ từ vựng cốt lõi thấm vào não một cách tự nhiên.
              </p>

              {/* Combo contents */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs font-bold text-[#2563EB] uppercase tracking-wide mb-2">Combo bao gồm</p>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-sm text-[#334155]">
                  <li className="flex items-center gap-2"><span>📗</span> 1 cuốn sách in</li>
                  <li className="flex items-center gap-2"><span>🎧</span> 200 file audio MP3</li>
                  <li className="flex items-center gap-2"><span>📄</span> PDF 500 từ vựng</li>
                </ul>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#334155]">149.000đ</span>
                <span className="text-[#64748B] line-through text-base">200.000đ</span>
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">-25.5%</span>
              </div>

              <div className="text-sm text-[#64748B]">⭐ 4.9/5 từ 1,247 người học</div>

              <a
                href="https://5phuttiengduc.giabaobooks.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-center bg-[#F5A623] text-[#334155] font-bold text-base px-8 py-3.5 rounded-full hover:brightness-105 transition shadow-md w-full sm:w-auto"
              >
                Đặt mua ngay — 149.000đ →
              </a>
              <p className="text-xs text-[#94a3b8]">Nhận sách tận tay · Ưng ý rồi mới thanh toán · Miễn phí vận chuyển</p>
            </div>
          </div>
        </div>
      </section>

      {/* Phương pháp */}
      <section className="max-w-4xl mx-auto px-4 pb-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 sm:p-8 text-white">
          <h2 className="text-lg sm:text-xl font-bold mb-2">Phương pháp: Học thụ động + Spaced Repetition</h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Không học ngữ pháp khô khan từ đầu. Thay vào đó, bạn đọc các mẩu chuyện ngắn có ngữ cảnh thực tế,
            nghe audio giọng bản xứ, và từ vựng tự khắc vào đầu nhờ lặp lại ngắt quãng (Spaced Repetition).
            Kết hợp với luyện tập trên <Link href="/" className="text-amber-300 hover:underline">G-Deutsch</Link> để nhớ lâu hơn gấp đôi.
          </p>
        </div>
      </section>

      {/* 3 Reasons */}
      <section className="max-w-4xl mx-auto px-4 py-10 pb-12">
        <h2 className="text-xl font-bold text-[#334155] text-center mb-8">Tại sao chọn 5 Phút Tiếng Đức?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {reasons.map((r) => (
            <div key={r.title} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col gap-3 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                {r.icon}
              </div>
              <h3 className="font-bold text-[#334155]">{r.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-[#334155] text-center mb-6">Câu hỏi thường gặp</h2>
        <FaqAccordion faqs={faqs} />
      </section>

      {/* Footer CTA */}
      <section className="bg-[#2563EB] py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Bắt đầu hành trình tiếng Đức hôm nay</h2>
          <p className="text-blue-100 mb-6 text-sm">Nhận sách, đọc thử, ưng rồi mới thanh toán — không rủi ro gì cả.</p>
          <a
            href="https://5phuttiengduc.giabaobooks.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-[#2563EB] font-bold px-8 py-3.5 rounded-full hover:bg-blue-50 transition shadow-md"
          >
            Đặt mua ngay — 149.000đ →
          </a>
        </div>
      </section>
    </div>
  )
}
