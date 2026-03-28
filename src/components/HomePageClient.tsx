'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
// @ts-ignore
import confetti from 'canvas-confetti'

function useTypewriter(text: string, speed = 60) {
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
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss')

export default function HomePageClient() {
  const [questions, setQuestions] = useState(ALL_QUESTIONS)
  const [current, setCurrent] = useState(0)
  const [input, setInput] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [showCTA, setShowCTA] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const { displayed: typedLine2, done: typingDone } = useTypewriter('Kết quả thật.', 80)

  useEffect(() => {
    setQuestions(shuffle(ALL_QUESTIONS))
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
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors: ['#2563EB','#10B981','#F59E0B'] })
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
      {/* Hero */}
      <section style={{position:'relative'}} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 lg:pt-28 pb-10 sm:pb-16 text-center">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{zIndex:0}}>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        </div>
        <p className="text-[#2563EB] text-xs sm:text-sm font-semibold tracking-widest uppercase mb-4">
          Hack não bộ để học ngoại ngữ
        </p>
        <motion.h1
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-4 sm:mb-6 text-[#334155]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          5 phút mỗi ngày.<br />
          <span className="text-[#2563EB]">
            {typedLine2}
            {!typingDone && <span className="inline-block w-0.5 h-8 bg-[#2563EB] align-middle animate-pulse ml-0.5" />}
          </span>
        </motion.h1>
        <motion.p
          className="text-[#64748B] text-base sm:text-lg max-w-md mx-auto mb-8 sm:mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Phương pháp Spaced Repetition giúp não bộ ghi nhớ tự nhiên — không nhồi nhét, không quên.
        </motion.p>

        {/* Demo Widget */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-5 sm:p-8 max-w-md mx-auto shadow-lg mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          {!showCTA ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[#64748B] text-[10px] sm:text-xs uppercase tracking-widest font-semibold">Thử ngay — không cần đăng ký</p>
                <span className="text-xs text-[#94a3b8]">{current + 1}/{questions.length}</span>
              </div>

              {/* Progress dots */}
              <div className="flex gap-1.5 mb-5 justify-center">
                {questions.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${
                    i < current ? 'bg-[#10B981]' : i === current ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'
                  }`} />
                ))}
              </div>

              <p className="text-base sm:text-lg font-semibold mb-2 text-[#334155]">
                {q.sentence.split('___').map((part, i, arr) => (
                  i < arr.length - 1
                    ? <span key={i}>{part}<span className="inline-block border-b-2 border-[#2563EB] w-12 sm:w-16 align-bottom" /></span>
                    : <span key={i}>{part}</span>
                ))}
              </p>
              <p className="text-[#64748B] text-xs sm:text-sm mb-4">{q.hint}</p>
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
                  {result === 'correct' ? `🎉 Chính xác!` : `❌ Chưa đúng. Đáp án: ${q.answer}`}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-xl sm:text-2xl mb-1">
                {correctCount >= 4 ? '🏆 Xuất sắc!' : correctCount >= 2 ? '🔥 Không tệ!' : '💪 Cứ luyện thêm!'}
              </p>
              <p className="text-[#64748B] text-sm mb-1">
                Bạn đúng {correctCount}/{questions.length} câu
              </p>
              <p className="text-[#64748B] text-sm mb-5">Tạo tài khoản miễn phí để lưu tiến độ và học thêm!</p>
              <Link href="/register" className="inline-block bg-[#2563EB] text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors text-sm">
                Bắt đầu ngay →
              </Link>
            </div>
          )}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Link href="/register" className="bg-[#2563EB] text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base text-center">
            Bắt đầu miễn phí →
          </Link>
          <Link href="/courses" className="border border-[#E2E8F0] text-[#334155] px-6 py-3 rounded-full font-semibold hover:border-[#2563EB] hover:text-[#2563EB] transition-colors text-sm sm:text-base text-center bg-white">
            Xem khóa học
          </Link>
        </motion.div>
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
              <div className="text-xl sm:text-3xl font-extrabold text-[#2563EB] tabular-nums animate-count-up">{s.n}</div>
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
            <motion.div
              key={f.title}
              className="bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-6 shadow-sm hover:border-blue-200 hover:shadow-md transition-all"
              whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(37,99,235,0.12)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-2xl sm:text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold mb-2 text-[#334155] text-sm sm:text-base">{f.title}</h3>
              <p className="text-[#64748B] text-xs sm:text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="cta-bottom py-12 sm:py-16 px-4 text-center">
        <h2 className="cta-bottom__title text-2xl sm:text-3xl font-bold text-white mb-3">Bắt đầu hôm nay — miễn phí</h2>
        <p className="cta-bottom__sub text-blue-200 mb-6 sm:mb-8 text-sm sm:text-base">Chỉ cần 5 phút. Không cần thẻ tín dụng.</p>
        <Link href="/register" className="cta-bottom__btn inline-block bg-white text-[#2563EB] px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition-colors text-sm sm:text-base">
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
