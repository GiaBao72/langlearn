'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
// @ts-ignore
import confetti from 'canvas-confetti'

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

const ALL_QUESTIONS = [
  { sentence: 'Ich ___ jeden Tag Deutsch.', answer: 'lerne', hint: 'Động từ "học" chia ngôi thứ nhất số ít' },
  { sentence: 'Das ist ___ Buch.', answer: 'ein', hint: '"Một" — mạo từ bất định với danh từ trung tính' },
  { sentence: 'Wie ___ du?', answer: 'heißt', hint: 'Động từ "tên là" chia ngôi thứ hai số ít' },
  { sentence: 'Ich ___ aus Vietnam.', answer: 'komme', hint: 'Động từ "đến từ" chia ngôi thứ nhất số ít' },
  { sentence: '___ sprechen Deutsch.', answer: 'Wir', hint: '"Chúng tôi" — đại từ nhân xưng ngôi thứ nhất số nhiều' },
]

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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const normalize = (s: string) =>
  s.trim().toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')

function StarRating({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
      ))}
    </div>
  )
}

export default function HomePageClient() {
  const [questions, setQuestions] = useState(ALL_QUESTIONS)
  const [current, setCurrent] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [showCTA, setShowCTA] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { displayed: typedLine2, done: typingDone } = useTypewriter('Giỏi ngay tiếng Đức', 80)

  useEffect(() => {
    setQuestions(shuffle(ALL_QUESTIONS))
    // Kiểm tra đăng nhập
    fetch('/api/auth/me').then(r => { if (r.ok) setIsLoggedIn(true) }).catch(() => {})
  }, [])

  useEffect(() => {
    if (showCTA && correctCount >= 4) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } })
    }
  }, [showCTA])

  const q = questions[current]

  function checkAnswer() {
    if (!input.trim()) return
    const correct = normalize(input) === normalize(q.answer)
    setResult(correct ? 'correct' : 'wrong')
    if (correct) {
      setCorrectCount(c => c + 1)
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#2563EB', '#10B981', '#F59E0B'] })
    }
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setShowCTA(true)
      } else {
        setCurrent(i => i + 1)
        setInput('')
        setResult(null)
      }
    }, correct ? 800 : 1400)
  }

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
            <span className="text-[#2563EB] inline-block min-h-[1.2em]">
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
                <Link href="/register" className="bg-[#2563EB] text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base text-center shadow-md">
                  Bắt đầu miễn phí →
                </Link>
                <Link href="/demo" className="border-2 border-[#2563EB]/30 text-[#2563EB] bg-white px-6 py-3 rounded-full font-semibold hover:border-[#2563EB] hover:bg-blue-50 transition-colors text-sm sm:text-base text-center flex items-center gap-2 justify-center">
                  🎓 Học thử — không cần đăng ký
                </Link>
              </>
            )}
          </motion.div>

          {/* Demo widget */}
          <motion.div
            className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-6 sm:p-8 max-w-md mx-auto text-left"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#64748B] font-medium">🎯 Thử ngay — không cần đăng ký</span>
              <span className="text-xs text-[#94a3b8]">{Math.min(current + 1, questions.length)}/{questions.length}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#E2E8F0] rounded-full h-1.5 mb-5">
              <div
                className="bg-[#2563EB] h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${((current) / questions.length) * 100}%` }}
              />
            </div>

            {!showCTA && q ? (
              <>
                <p className="text-base sm:text-lg font-semibold text-[#334155] mb-1 leading-relaxed">
                  {q.sentence.split('___').map((part, i, arr) => (
                    <span key={i}>{part}{i < arr.length - 1 && (
                      <span className={`inline-block min-w-[60px] border-b-2 mx-1 text-center font-bold ${
                        result === 'correct' ? 'border-emerald-400 text-emerald-600' :
                        result === 'wrong' ? 'border-red-400 text-red-500' :
                        'border-[#2563EB] text-[#2563EB]'
                      }`}>{input || '\u00A0\u00A0\u00A0\u00A0\u00A0'}</span>
                    )}</span>
                  ))}
                </p>
                <p className="text-[#64748B] text-xs mb-4">{q.hint}</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !result && checkAnswer()}
                    placeholder="Điền từ vào đây..."
                    disabled={!!result}
                    className="flex-1 min-w-0 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-sm text-[#334155] placeholder-[#94a3b8] focus:outline-none focus:border-[#2563EB] transition-colors disabled:opacity-60"
                  />
                  <button onClick={checkAnswer} disabled={!!result || !input.trim()}
                    className="bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shrink-0 disabled:opacity-50">
                    Check
                  </button>
                </div>
                {result && (
                  <p className={`mt-3 text-sm font-medium ${result === 'correct' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {result === 'correct' ? '🎉 Chính xác!' : `❌ Chưa đúng. Đáp án: ${q.answer}`}
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-xl sm:text-2xl mb-1">
                  {correctCount >= 4 ? '🏆 Xuất sắc!' : correctCount >= 2 ? '🔥 Không tệ!' : '💪 Cứ luyện thêm!'}
                </p>
                <p className="text-[#64748B] text-sm mb-1">Bạn đúng {correctCount}/{questions.length} câu</p>
                <p className="text-[#64748B] text-sm mb-5">
                  {isLoggedIn ? 'Tiếp tục luyện tập với khóa học thật!' : 'Tạo tài khoản miễn phí để lưu tiến độ!'}
                </p>
                <Link href={isLoggedIn ? '/dashboard' : '/register'}
                  className="inline-block bg-[#2563EB] text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors text-sm">
                  {isLoggedIn ? 'Vào dashboard →' : 'Bắt đầu ngay →'}
                </Link>
              </div>
            )}
          </motion.div>
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
              href="/demo"
              className="inline-block border-2 border-white/60 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors text-sm sm:text-base"
            >
              🎓 Học thử — không cần đăng ký
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
