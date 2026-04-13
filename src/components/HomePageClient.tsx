'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

function useTypewriter(text: string, speed = 80) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { setDone(true); clearInterval(timer) }
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])
  return { displayed, done }
}

const TESTIMONIALS = [
  {
    name: 'Minh Châu',
    role: 'Sinh viên năm 3, TP.HCM',
    avatar: 'MC',
    color: 'bg-blue-100 text-blue-700',
    text: 'Mình dùng G-Deutsch được 2 tháng, streak 45 ngày liên tiếp. Từ vựng nhớ lâu hơn hẳn nhờ hệ thống lặp lại thông minh. Điểm Goethe A2 của mình lên đáng kể!',
    stars: 5,
  },
  {
    name: 'Thanh Hùng',
    role: 'Kỹ sư phần mềm, Hà Nội',
    avatar: 'TH',
    color: 'bg-emerald-100 text-emerald-700',
    text: 'Học 15 phút/ngày trên xe buýt. Giao diện gọn, không rác, không notification spam. Sau 3 tháng mình đọc được báo tiếng Đức cơ bản — thực sự ngạc nhiên.',
    stars: 5,
  },
  {
    name: 'Phương Linh',
    role: 'Du học sinh, München',
    avatar: 'PL',
    color: 'bg-purple-100 text-purple-700',
    text: 'Chuẩn bị đi du học, mình cần lên B1 nhanh. G-Deutsch giúp mình ôn từ vựng đều đặn và theo dõi được mình yếu ở đâu. Lộ trình rõ ràng, không bị lạc.',
    stars: 5,
  },
  {
    name: 'Quốc Bảo',
    role: 'Freelancer, Đà Nẵng',
    avatar: 'QB',
    color: 'bg-amber-100 text-amber-700',
    text: 'Đã thử Duolingo, Anki, các app khác — G-Deutsch là cái duy nhất mình stick được lâu. Bài tập đa dạng, không nhàm. Leaderboard thêm động lực cạnh tranh nữa!',
    stars: 5,
  },
  {
    name: 'Thu Hà',
    role: 'Giáo viên tiếng Anh, Cần Thơ',
    avatar: 'TH',
    color: 'bg-rose-100 text-rose-700',
    text: 'Là giáo viên mình khá khó tính với app học ngôn ngữ. G-Deutsch có đủ loại bài: nghe, viết, trắc nghiệm, flashcard. Blog cũng hay, có tips thực tiễn.',
    stars: 5,
  },
]

const STATS = [
  { value: '500+', label: 'Học viên' },
  { value: '10,000+', label: 'Bài tập hoàn thành' },
  { value: '6', label: 'Cấp độ A1→C2' },
  { value: '5', label: 'Dạng bài tập' },
]

const FAQS = [
  {
    q: 'G-Deutsch có miễn phí không?',
    a: 'Hoàn toàn miễn phí. Bạn chỉ cần tạo tài khoản là học được tất cả nội dung — không có gói trả phí ẩn.',
  },
  {
    q: 'Tôi cần học bao lâu để lên B1?',
    a: 'Trung bình 6–12 tháng nếu học đều đặn 15–20 phút/ngày. Hệ thống Spaced Repetition giúp bạn nhớ lâu hơn và tối ưu thời gian ôn tập.',
  },
  {
    q: 'Có app điện thoại không?',
    a: 'Chưa có app riêng nhưng website tương thích hoàn toàn với điện thoại và có thể cài như PWA (Add to Home Screen) để dùng như app thật.',
  },
  {
    q: 'Tôi hoàn toàn mới, bắt đầu từ đâu?',
    a: 'Bắt đầu từ khóa A1 — không cần biết gì trước. Lộ trình được thiết kế từ con số 0, từng bước rõ ràng.',
  },
  {
    q: 'Khác gì Duolingo hay các app khác?',
    a: 'G-Deutsch tập trung vào tiếng Đức thuần túy, không có mini-game gây xao nhãng. Bài tập sát thực tế hơn (nghe chép, điền từ, sắp xếp câu) và có lộ trình theo chuẩn Goethe.',
  },
]

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-2">
      {FAQS.map((faq, i) => (
        <div key={i} className="border border-[#E2E8F0] rounded-xl overflow-hidden bg-white">
          <button
            className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-[#334155] text-sm sm:text-base hover:bg-[#F8FAFC] transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>{faq.q}</span>
            <span className={`ml-4 shrink-0 text-[#2563EB] transition-transform ${open === i ? 'rotate-45' : ''}`}>＋</span>
          </button>
          {open === i && (
            <div className="px-5 pb-4 text-[#64748B] text-sm leading-relaxed border-t border-[#E2E8F0] pt-3">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function StarRating({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
      ))}
    </div>
  )
}

export default function HomePageClient({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const { displayed: typedLine2, done: typingDone } = useTypewriter('Giỏi ngay tiếng Đức', 80)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-[#F8FAFC]">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28 pb-10 sm:pb-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ zIndex: 1 }}>
          <p className="text-[#2563EB] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4">
            Hack não bộ để học ngoại ngữ
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1E293B] leading-tight mb-4">
            <span className="block">5 phút mỗi ngày.</span>
            {/* Fix CLS: reserve chiều cao trước khi typewriter chạy */}
            <span className="text-[#2563EB] inline-block min-h-[1.2em] w-full">
              {typedLine2}
              {!typingDone && <span className="animate-pulse">|</span>}
            </span>
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8">
            Hệ thống học thông minh với Spaced Repetition — nhớ lâu hơn, học ít hơn, tiến nhanh hơn.
          </p>

          {/* CTA buttons — smart theo login state */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center mb-10"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="bg-[#2563EB] text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base text-center">
                  Vào dashboard →
                </Link>
                <Link href="/courses" className="border border-[#E2E8F0] text-[#334155] px-6 py-3 rounded-full font-semibold hover:border-[#2563EB] hover:text-[#2563EB] transition-colors text-sm sm:text-base text-center bg-white">
                  Xem khóa học
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="bg-[#2563EB] text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base text-center shadow-md flex items-center gap-2 justify-center">
                  🚀 Bắt đầu miễn phí →
                </Link>
                <Link href="/courses" className="border border-[#E2E8F0] text-[#334155] px-8 py-3 rounded-full font-semibold hover:border-[#2563EB] hover:text-[#2563EB] transition-colors text-sm sm:text-base text-center bg-white flex items-center gap-2 justify-center">
                  📚 Xem khóa học
                </Link>
              </>
            )}
          </motion.div>

        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="text-2xl font-extrabold text-[#2563EB]">{s.value}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <h2 className="text-xl sm:text-2xl font-bold text-[#334155] text-center mb-8 sm:mb-12">Tại sao G-Deutsch?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '🧠', title: 'Spaced Repetition', desc: 'Hệ thống tự biết từ nào bạn hay quên và lặp lại đúng lúc — khoa học não bộ.' },
            { icon: '⚡', title: 'Zen Mode', desc: 'Giao diện tối giản, không phân tâm. Chỉ bạn và bài học.' },
            { icon: '📊', title: 'Theo dõi tiến độ', desc: 'Heatmap trực quan. Streak mỗi ngày. Thấy rõ hành trình của mình.' },
            { icon: '🎯', title: '5 dạng bài tập', desc: 'Trắc nghiệm, điền từ, flashcard, nghe chép, sắp xếp — không bao giờ chán.' },
            { icon: '📚', title: 'Lộ trình rõ ràng', desc: 'Từ A1 đến C2 — biết mình đang ở đâu và bước tiếp theo là gì.' },
            { icon: '✍️', title: 'Blog học thuật', desc: 'Mẹo học, tips ngữ pháp, câu chuyện từ người học thật.' },
          ].map(f => (
            <motion.div
              key={f.title}
              className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
              whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(37,99,235,0.12)' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="text-2xl sm:text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2 text-[#334155] text-sm sm:text-base">{f.title}</h3>
              <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SOCIAL PROOF / TESTIMONIALS ──────────────────── */}
      <section className="bg-white border-y border-[#E2E8F0] py-14 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-2">Người học nói gì</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-3">Hàng trăm người đã thay đổi cách học</h2>
            <p className="text-[#64748B] text-sm sm:text-base max-w-xl mx-auto">
              Từ sinh viên đến kỹ sư, từ Hà Nội đến München — họ đều tìm được nhịp học phù hợp với G-Deutsch.
            </p>
            {/* Rating summary */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <StarRating n={5} />
              <span className="font-bold text-[#1E293B] text-sm">4.9</span>
              <span className="text-[#64748B] text-sm">/ 5 · 200+ đánh giá</span>
            </div>
          </div>

          {/* Testimonial grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 sm:p-6 flex flex-col gap-3 hover:border-blue-200 hover:shadow-md transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <StarRating n={t.stars} />
                <p className="text-[#334155] text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-1 border-t border-[#E2E8F0]">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${t.color}`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#1E293B]">{t.name}</p>
                    <p className="text-xs text-[#64748B]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <span>Không bán dữ liệu</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🇻🇳</span>
              <span>Made in Vietnam</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🆓</span>
              <span>Hoàn toàn miễn phí</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📱</span>
              <span>Học mọi lúc, mọi nơi</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest mb-2">Giải đáp thắc mắc</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B]">Câu hỏi thường gặp</h2>
        </div>
        <FaqAccordion />
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────── */}
      <section className="cta-bottom py-12 sm:py-16 px-4 text-center">
        <h2 className="cta-bottom__title text-2xl sm:text-3xl font-bold text-white mb-3">
          {isLoggedIn ? 'Chào mừng trở lại! 👋' : 'Bắt đầu hôm nay — miễn phí'}
        </h2>
        <p className="cta-bottom__sub text-blue-200 mb-6 sm:mb-8 text-sm sm:text-base">
          {isLoggedIn ? 'Streak của bạn đang chờ. Đừng để bị đứt!' : 'Chỉ cần 5 phút. Không cần thẻ tín dụng.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={isLoggedIn ? '/dashboard' : '/register'}
            className="cta-bottom__btn inline-block bg-white text-[#2563EB] px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors text-sm sm:text-base"
          >
            {isLoggedIn ? 'Vào dashboard →' : 'Tạo tài khoản miễn phí →'}
          </Link>
          {!isLoggedIn && (
            <Link
              href="/courses"
              className="inline-block border-2 border-white/60 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors text-sm sm:text-base"
            >
              🎓 Xem khóa học miễn phí
            </Link>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-[#E2E8F0] py-8 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6">
            <div>
              <p className="font-bold text-[#1E293B] text-base mb-1">G-Deutsch</p>
              <p className="text-xs text-[#64748B]">Học ngoại ngữ thông minh hơn mỗi ngày.</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#64748B]">
              <Link href="/courses" className="hover:text-[#2563EB] transition-colors">Khóa học</Link>
              <Link href="/roadmap" className="hover:text-[#2563EB] transition-colors">Lộ trình</Link>
              <Link href="/leaderboard" className="hover:text-[#2563EB] transition-colors">Xếp hạng</Link>
              <Link href="/blog" className="hover:text-[#2563EB] transition-colors">Blog</Link>
              {isLoggedIn
                ? <Link href="/dashboard" className="hover:text-[#2563EB] transition-colors">Dashboard</Link>
                : <Link href="/login" className="hover:text-[#2563EB] transition-colors">Đăng nhập</Link>
              }
            </div>
          </div>
          <div className="border-t border-[#E2E8F0] pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#94a3b8]">
            <span>© 2026 G-Deutsch. All rights reserved.</span>
            <span>Made with ❤️ in Vietnam</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
