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

  function checkAnswer() {
    const correct = input.trim().toLowerCase() === DEMO_QUESTION.answer
    setResult(correct ? 'correct' : 'wrong')
    if (correct) {
      setTimeout(() => setShowCTA(true), 800)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="border-b border-slate-200 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="font-bold text-lg tracking-tight">LangLearn</span>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link href="/login" className="hover:text-white transition-colors">Đăng nhập</Link>
          <Link href="/register" className="bg-indigo-600 text-black px-4 py-1.5 rounded-full font-medium hover:bg-indigo-600/90 transition-colors">
            Bắt đầu miễn phí
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="text-indigo-600 text-sm font-medium tracking-widest uppercase mb-6">
          Hack não bộ để học ngoại ngữ
        </p>
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-none mb-6">
          5 phút mỗi ngày.<br />
          <span className="text-slate-400">Kết quả thật.</span>
        </h1>
        <p className="text-slate-500 text-xl max-w-xl mx-auto mb-16">
          Phương pháp Spaced Repetition giúp não bộ ghi nhớ tự nhiên — không nhồi nhét, không quên.
        </p>

        {/* Interactive Demo */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 max-w-lg mx-auto">
          {!showCTA ? (
            <>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">Thử ngay — không cần đăng ký</p>
              <p className="text-lg font-medium mb-6 text-slate-800">
                {DEMO_QUESTION.sentence.replace('___', '______')}
              </p>
              <p className="text-slate-400 text-sm mb-4">{DEMO_QUESTION.hint}</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && checkAnswer()}
                  placeholder="Điền từ vào đây..."
                  className="flex-1 bg-white border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-400 transition-colors"
                />
                <button
                  onClick={checkAnswer}
                  className="bg-indigo-600 text-black px-5 py-3 rounded-lg font-semibold hover:bg-indigo-600/90 transition-colors"
                >
                  Check
                </button>
              </div>
              {result && (
                <p className={`mt-4 text-sm font-medium ${result === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
                  {result === 'correct' ? '🎉 Chính xác! Đáp án: lerne' : `❌ Chưa đúng. Đáp án: ${DEMO_QUESTION.answer}`}
                </p>
              )}
            </>
          ) : (
            <div className="text-center">
              <p className="text-2xl mb-2">🔥 Bạn có tố chất đấy!</p>
              <p className="text-slate-500 mb-6">Tạo tài khoản để lưu tiến độ và học tiếp.</p>
              <Link
                href="/register"
                className="inline-block bg-indigo-600 text-black px-8 py-3 rounded-full font-bold hover:bg-indigo-600/90 transition-colors"
              >
                Bắt đầu chuỗi 5 phút mỗi ngày →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-6">
        {[
          { icon: '🧠', title: 'Spaced Repetition', desc: 'Hệ thống tự biết từ nào bạn hay quên và lặp lại đúng lúc.' },
          { icon: '⚡', title: 'Zen Mode', desc: 'Luyện tập không phân tâm — giao diện tối giản, tập trung tuyệt đối.' },
          { icon: '📊', title: 'Theo dõi tiến độ', desc: 'Heatmap trực quan giúp bạn thấy rõ hành trình học mỗi ngày.' },
        ].map(f => (
          <div key={f.title} className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-slate-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 text-center text-slate-400 text-sm">
        © 2026 LangLearn. Học ngoại ngữ mỗi ngày.
      </footer>
    </div>
  )
}
