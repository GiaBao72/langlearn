'use client'

import { useState } from 'react'
import Link from 'next/link'

const DEMO_QUESTION = {
  sentence: 'Ich ___ jeden Tag Deutsch.',
  answer: 'lerne',
  hint: 'Động từ "học" chia ở ngôi thứ nhất số ít',
}

export default function HomePage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [showCTA, setShowCTA] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  function checkAnswer() {
    const correct = input.trim().toLowerCase() === DEMO_QUESTION.answer
    setResult(correct ? 'correct' : 'wrong')
    if (correct) setTimeout(() => setShowCTA(true), 800)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="font-bold text-lg tracking-tight text-[#334155]">LangLearn</Link>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <Link href="/blog" className="text-[#64748B] hover:text-[#2563EB] transition-colors font-medium">Blog</Link>
            <Link href="/login" className="text-[#64748B] hover:text-[#2563EB] transition-colors font-medium">Đăng nhập</Link>
            <Link href="/register" className="bg-[#2563EB] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
              Bắt đầu miễn phí
            </Link>
          </div>

          {/* Mobile: compact links + hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <Link href="/login" className="text-[#64748B] text-sm font-medium px-2 py-1">Đăng nhập</Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" aria-label="Menu">
              {menuOpen
                ? <svg className="w-5 h-5 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg className="w-5 h-5 text-[#334155]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="sm:hidden mt-2 pb-3 flex flex-col gap-1 max-w-6xl mx-auto border-t border-[#E2E8F0] pt-3">
            <Link href="/blog" onClick={() => setMenuOpen(false)} className="text-[#334155] py-2.5 px-2 text-sm font-medium hover:text-[#2563EB] transition-colors rounded-lg hover:bg-slate-50">Blog</Link>
            <Link href="/courses" onClick={() => setMenuOpen(false)} className="text-[#334155] py-2.5 px-2 text-sm font-medium hover:text-[#2563EB] transition-colors rounded-lg hover:bg-slate-50">Khóa học</Link>
            <Link href="/register" onClick={() => setMenuOpen(false)} className="bg-[#2563EB] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm text-center mt-1">
              Bắt đầu miễn phí →
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 lg:pt-28 pb-10 sm:pb-16 text-center">
        <p className="text-[#2563EB] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4">
          Hack não bộ để học ngoại ngữ
        </p>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-4 sm:mb-6 text-[#334155]">
          5 phút mỗi ngày.<br />
          <span className="text-[#2563EB]">Kết quả thật.</span>
        </h1>
        <p className="text-[#64748B] text-base sm:text-lg max-w-md mx-auto mb-8 sm:mb-12 leading-relaxed">
          Phương pháp Spaced Repetition giúp não bộ ghi nhớ tự nhiên — không nhồi nhét, không quên.
        </p>

        {/* Demo Widget */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 sm:p-8 max-w-md mx-auto shadow-sm mb-8 sm:mb-10">
          {!showCTA ? (
            <>
              <p className="text-[#64748B] text-[10px] sm:text-xs uppercase tracking-widest mb-4 font-semibold">Thử ngay — không cần đăng ký</p>
              <p className="text-base sm:text-lg font-semibold mb-2 text-[#334155]">
                Ich <span className="inline-block border-b-2 border-[#2563EB] w-12 sm:w-16 align-bottom"></span> jeden Tag Deutsch.
              </p>
              <p className="text-[#64748B] text-xs sm:text-sm mb-4">{DEMO_QUESTION.hint}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                  placeholder="Điền từ vào đây..."
                  className="flex-1 min-w-0 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:border-[#2563EB] transition-colors"
                />
                <button onClick={checkAnswer} className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0">
                  Check
                </button>
              </div>
              {result && (
                <p className={`mt-3 text-sm font-medium ${result === 'correct' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {result === 'correct' ? '🎉 Chính xác! Đáp án: lerne' : `❌ Chưa đúng. Đáp án: ${DEMO_QUESTION.answer}`}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-xl sm:text-2xl mb-2">🔥 Bạn có tố chất!</p>
              <p className="text-[#64748B] mb-5 text-sm">Tạo tài khoản miễn phí để lưu tiến độ.</p>
              <Link href="/register" className="inline-block bg-[#2563EB] text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors text-sm">
                Bắt đầu ngay →
              </Link>
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/register" className="bg-[#2563EB] text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base text-center">
            Bắt đầu miễn phí →
          </Link>
          <Link href="/courses" className="border border-[#E2E8F0] text-[#334155] px-6 py-3 rounded-full font-semibold hover:border-[#2563EB] hover:text-[#2563EB] transition-colors text-sm sm:text-base text-center bg-white">
            Xem khóa học
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-y border-[#E2E8F0] py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-3 gap-4 text-center">
          {[
            { n: '5 phút', label: 'mỗi ngày là đủ' },
            { n: '5 dạng', label: 'bài tập khác nhau' },
            { n: '100%', label: 'miễn phí đăng ký' },
          ].map(s => (
            <div key={s.n}>
              <div className="text-xl sm:text-3xl font-extrabold text-[#2563EB]">{s.n}</div>
              <div className="text-[#64748B] text-xs sm:text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <h2 className="text-xl sm:text-2xl font-bold text-[#334155] text-center mb-8 sm:mb-12">Tại sao LangLearn?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[
            { icon: '🧠', title: 'Spaced Repetition', desc: 'Hệ thống tự biết từ nào bạn hay quên và lặp lại đúng lúc — khoa học não bộ.' },
            { icon: '⚡', title: 'Zen Mode', desc: 'Giao diện tối giản, không phân tâm. Chỉ bạn và bài học.' },
            { icon: '📊', title: 'Theo dõi tiến độ', desc: 'Heatmap trực quan. Streak mỗi ngày. Thấy rõ hành trình của mình.' },
            { icon: '🎯', title: '5 dạng bài tập', desc: 'Trắc nghiệm, điền từ, flashcard, nghe chép, sắp xếp — không bao giờ chán.' },
            { icon: '📚', title: 'Lộ trình rõ ràng', desc: 'Từ A1 đến C1 — biết mình đang ở đâu và bước tiếp theo là gì.' },
            { icon: '✍️', title: 'Blog học thuật', desc: 'Mẹo học, tips ngữ pháp, câu chuyện từ người học thật.' },
          ].map(f => (
            <div key={f.title} className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
              <div className="text-2xl sm:text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2 text-[#334155] text-sm sm:text-base">{f.title}</h3>
              <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-[#2563EB] py-12 sm:py-16 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Bắt đầu hôm nay — miễn phí</h2>
        <p className="text-blue-200 mb-6 sm:mb-8 text-sm sm:text-base">Chỉ cần 5 phút. Không cần thẻ tín dụng.</p>
        <Link href="/register" className="inline-block bg-white text-[#2563EB] px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors text-sm sm:text-base">
          Tạo tài khoản miễn phí →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] py-6 text-center text-[#64748B] text-xs sm:text-sm px-4 bg-white">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <span>© 2026 LangLearn</span>
          <Link href="/blog" className="hover:text-[#2563EB] transition-colors">Blog</Link>
          <Link href="/courses" className="hover:text-[#2563EB] transition-colors">Khóa học</Link>
          <Link href="/login" className="hover:text-[#2563EB] transition-colors">Đăng nhập</Link>
        </div>
      </footer>
    </div>
  )
}
