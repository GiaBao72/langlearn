import Link from 'next/link'
import FaqAccordion from './FaqAccordion'
import Navbar from '@/components/Navbar'

const reasons = [
  {
    icon: (
      <svg className="w-7 h-7 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Phương pháp khoa học',
    desc: 'Xây dựng dựa trên nghiên cứu về ghi nhớ dài hạn và lặp lại ngắt quãng — học ít mà nhớ lâu.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 18.364a7 7 0 000-12.728M8.464 8.464a5 5 0 000 7.072" />
      </svg>
    ),
    title: 'Có audio đi kèm',
    desc: 'Mỗi cuốn sách đi kèm file âm thanh chuẩn giọng bản xứ, luyện nghe và phát âm ngay từ đầu.',
  },
  {
    icon: (
      <svg className="w-7 h-7 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Bảo hành hoàn tiền 7 ngày',
    desc: 'Không hài lòng? Chúng tôi hoàn tiền 100% trong vòng 7 ngày — không hỏi lý do.',
  },
]

const faqs = [
  {
    q: 'Sách phù hợp với trình độ nào?',
    a: 'Sách được thiết kế cho người mới bắt đầu hoàn toàn (A1) đến trung cấp (B1). Nếu bạn chưa học tiếng Đức bao giờ, đây là điểm khởi đầu lý tưởng.',
  },
  {
    q: 'File audio ở đâu và cách tải?',
    a: 'Sau khi đặt mua thành công, bạn sẽ nhận link tải audio qua Messenger/Zalo trong vòng 24 giờ. File MP3 chất lượng cao, dùng được trên mọi thiết bị.',
  },
  {
    q: 'Tôi có thể đặt nhiều cuốn để được giảm giá không?',
    a: 'Có! Đặt từ 2 cuốn trở lên nhận giảm thêm 10%, từ 3 cuốn giảm 15%. Liên hệ Messenger để đặt combo.',
  },
]

export default function StorePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      {/* Hero */}
      <section className="bg-white border-b border-[#E2E8F0] py-14 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-[#2563EB] uppercase tracking-widest mb-3">Sách học ngoại ngữ</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#334155] leading-tight mb-4">
            Bộ sách học ngoại ngữ<br className="hidden sm:block" /> được hàng nghìn người tin dùng
          </h1>
          <p className="text-[#64748B] text-lg leading-relaxed mb-6">
            Học đúng phương pháp, có giáo trình bài bản — tiến bộ nhanh hơn bạn nghĩ.
          </p>
          {/* Social proof bar */}
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
            {/* Book cover placeholder */}
            <div className="sm:w-56 shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-8 min-h-[200px]">
              <div className="text-center text-white">
                <div className="text-4xl mb-2">📘</div>
                <div className="font-bold text-sm leading-tight">5 Phút<br />Tiếng Đức</div>
                <div className="text-blue-200 text-xs mt-1">Tập 1</div>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col gap-4 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-orange-200">
                  🔥 Bán chạy nhất
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#334155]">5 Phút Tiếng Đức - Tập 1</h2>

              <p className="text-[#64748B] text-sm leading-relaxed">
                Học tiếng Đức chỉ 5 phút mỗi ngày với phương pháp lặp lại ngắt quãng. 
                Sách gồm 60 bài học ngắn, từ vựng hàng ngày, ngữ pháp nền tảng 
                và bài tập thực hành kèm đáp án. Audio giọng bản xứ chuẩn Đức.
              </p>

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
                Đặt mua ngay — 149.000đ
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Reasons */}
      <section className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-xl font-bold text-[#334155] text-center mb-8">Tại sao chọn sách của chúng tôi?</h2>
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
        <FaqAccordion />
      </section>

      {/* Footer CTA */}
      <section className="bg-[#2563EB] py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">Cần tư vấn trước khi mua?</h2>
          <p className="text-blue-100 mb-6 text-sm">Nhắn Messenger — chúng tôi trả lời trong vòng 5 phút.</p>
          <a
            href="https://5phuttiengduc.giabaobooks.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-[#2563EB] font-bold px-8 py-3.5 rounded-full hover:bg-blue-50 transition shadow-md"
          >
            💬 Nhắn Messenger ngay
          </a>
        </div>
      </section>
    </div>
  )
}
