'use client'
import { speak, preloadVoices } from '@/lib/tts'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type ExerciseType = 'MULTIPLE_CHOICE' | 'MULTIPLE_CHOICE_PARTIAL' | 'MULTIPLE_CHOICE_ALL' | 'FILL_BLANK' | 'FLASHCARD' | 'DICTATION' | 'SORT_WORDS'

interface ExamQuestion {
  id: string; type: ExerciseType; question: string; data: Record<string, unknown>; points: number; order: number
}

interface GradedAnswer {
  questionId: string; question: string; type: string; data: Record<string, unknown>
  userAnswer: string | string[]; correct: boolean; earnedPoints: number; maxPoints: number
}

export default function ExamRunner({
  attemptId, questions, exam, courseId
}: {
  attemptId: string
  questions: ExamQuestion[]
  exam: { id: string; title: string; durationMins: number | null }
  courseId: string
}) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; maxScore: number; passed: boolean | null; pct: number; answers: GradedAnswer[] } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(exam.durationMins ? exam.durationMins * 60 : null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAt = useRef(Date.now())
  const questionRefs = useRef<(HTMLDivElement | null)[]>([])
  // Dùng ref để tránh stale closure trong timer callback
  const answersRef = useRef<Record<string, string | string[]>>({})
  const submittingRef = useRef(false)
  const submittedRef = useRef(false)

  useEffect(() => {
    if (timeLeft === null) return
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000)
      const remaining = (exam.durationMins! * 60) - elapsed
      if (remaining <= 0) {
        setTimeLeft(0)
        clearInterval(timerRef.current!)
        // Dùng ref — không bị stale closure
        submitExam(answersRef.current)
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function formatTime(s: number) {
    const m = Math.floor(s / 60); const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  function setAnswer(qid: string, val: string | string[]) {
    setAnswers(a => {
      const next = { ...a, [qid]: val }
      answersRef.current = next  // Đồng bộ ref để timer dùng được
      return next
    })
  }

  function toggleMultiAnswer(qid: string, opt: string) {
    const cur = (answers[qid] as string[] | undefined) ?? []
    setAnswers(a => {
      const next = { ...a, [qid]: cur.includes(opt) ? cur.filter(v => v !== opt) : [...cur, opt] }
      answersRef.current = next  // Đồng bộ ref
      return next
    })
  }

  function isAnswered(qid: string) {
    const v = answers[qid]
    if (!v) return false
    return Array.isArray(v) ? v.length > 0 : v !== ''
  }

  function scrollToQuestion(i: number) {
    questionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  async function submitExam(currentAnswers: Record<string, string | string[]>) {
    if (submittingRef.current || submittedRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    const payload = questions.map(q => ({ questionId: q.id, answer: currentAnswers[q.id] ?? '' }))
    try {
      const res = await fetch(`/api/exams/${exam.id}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, answers: payload }),
      })
      if (res.ok) {
        const data = await res.json()
        setResult(data)
        setSubmitted(true)
        submittedRef.current = true
        if (timerRef.current) clearInterval(timerRef.current)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error ?? 'Có lỗi khi nộp bài, vui lòng thử lại.')
      }
    } catch {
      alert('Mất kết nối mạng. Vui lòng thử nộp lại.')
    }
    submittingRef.current = false
    setSubmitting(false)
  }

  async function handleSubmit() {
    await submitExam(answersRef.current)
  }

  const answered = questions.filter(q => isAnswered(q.id)).length

  // ── RESULT SCREEN ──────────────────────────────────────────────
  if (submitted && result) {
    const pct = result.pct
    const passed = result.passed
    const emoji = passed === true ? '🎉' : passed === false ? '😔' : '📊'
    const colorClass = passed === true ? 'bg-green-50 border-green-200' : passed === false ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
    const labelColor = passed === true ? 'text-green-600' : passed === false ? 'text-red-500' : 'text-blue-600'

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Flip card */}
        <div className="mb-8" style={{ perspective: '1000px' }}>
          <div onClick={() => setFlipped(f => !f)} className="relative cursor-pointer select-none"
            style={{ transformStyle: 'preserve-3d', transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)', height: '220px' }}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex flex-col items-center justify-center shadow-xl"
              style={{ backfaceVisibility: 'hidden' }}>
              <div className="text-6xl mb-4">🎴</div>
              <p className="text-white font-bold text-lg tracking-wide">Kết quả của bạn</p>
              <p className="text-slate-400 text-sm mt-1">Nhấn để xem</p>
            </div>
            <div className={`absolute inset-0 rounded-2xl border ${colorClass} flex flex-col items-center justify-center shadow-xl`}
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
              <div className="text-5xl mb-3">{emoji}</div>
              <h2 className="text-3xl font-bold text-[#334155] mb-1">{pct}%</h2>
              <p className="text-[#64748B] text-sm">{result.score}/{result.maxScore} điểm</p>
              {passed !== null && <p className={`mt-2 font-semibold ${labelColor}`}>{passed ? '✓ Đạt' : '✗ Chưa đạt'}</p>}
              <p className="text-xs text-[#94A3B8] mt-3">Nhấn để lật lại</p>
            </div>
          </div>
        </div>

        {flipped && (
          <>
            <div className="space-y-3 mb-8">
              <h3 className="font-semibold text-[#334155]">Chi tiết từng câu</h3>
              {result.answers.map((a, i) => (
                <div key={a.questionId} className={`bg-white border rounded-xl p-4 ${a.correct ? 'border-green-200' : 'border-red-200'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${a.correct ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>{a.correct ? '✓' : '✗'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#334155] mb-1">Câu {i+1}: {a.question}</p>
                      <p className="text-xs text-[#64748B]">Bạn trả lời: <span className="font-medium text-[#334155]">{Array.isArray(a.userAnswer) ? a.userAnswer.join(', ') || '(bỏ trống)' : a.userAnswer || '(bỏ trống)'}</span></p>
                      {!a.correct && (
                        <p className="text-xs text-green-600 mt-0.5">Đáp án đúng: {(() => {
                          const d = a.data as Record<string, unknown>
                          // FILL_BLANK: hiển thị tất cả đáp án hợp lệ
                          if (Array.isArray(d.answers) && (d.answers as string[]).length > 0) return (d.answers as string[]).join(' / ')
                          // MC: nếu answer là label đơn (A/B/C/D), tìm option đầy đủ
                          const ans = String(d.answer ?? d.back ?? '')
                          if (ans.length <= 1 && Array.isArray(d.options)) {
                            const found = (d.options as string[]).find(o => o.startsWith(ans + '.') || o.startsWith(ans + ' '))
                            if (found) return found
                          }
                          return ans
                        })()}</p>
                      )}
                      <p className="text-xs text-[#94A3B8] mt-1">{a.earnedPoints}/{a.maxPoints} điểm</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Link href={`/courses/${courseId}`} className="flex-1 text-center py-3 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#64748B] hover:bg-slate-50 transition-colors">← Về khóa học</Link>
              <button onClick={() => router.push(`/exams/${exam.id}`)} className="flex-1 py-3 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Thi lại</button>
            </div>
          </>
        )}

        {!flipped && (
          <div className="flex gap-3">
            <Link href={`/courses/${courseId}`} className="flex-1 text-center py-3 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-[#64748B] hover:bg-slate-50 transition-colors">← Về khóa học</Link>
            <button onClick={() => router.push(`/exams/${exam.id}`)} className="flex-1 py-3 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Thi lại</button>
          </div>
        )}
      </div>
    )
  }

  // ── EXAM SCREEN ────────────────────────────────────────────────
  return (
    <div className="flex gap-0 md:gap-6 max-w-5xl mx-auto px-2 md:px-4 py-6 md:py-8 items-start">

      {/* Panel trái — navigator */}
      <aside className="hidden md:flex flex-col gap-3 w-44 shrink-0 sticky top-6">
        {/* Header */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3">
          <h1 className="font-bold text-[#334155] text-sm leading-tight mb-1 truncate">{exam.title}</h1>
          <p className="text-xs text-[#64748B]">{answered}/{questions.length} đã trả lời</p>
          {timeLeft !== null && (
            <div className={`mt-2 text-center font-mono font-bold text-base px-2 py-1 rounded-lg ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-[#334155]'}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Grid số câu */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3">
          <p className="text-xs text-[#94A3B8] mb-2 font-medium">Câu hỏi</p>
          <div className="grid grid-cols-4 gap-1.5">
            {questions.map((q, i) => (
              <button key={q.id} onClick={() => scrollToQuestion(i)}
                title={`Câu ${i+1}`}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                  isAnswered(q.id)
                    ? 'bg-[#2563EB] text-white hover:bg-blue-700'
                    : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
          {/* Legend */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="w-3 h-3 rounded bg-[#2563EB] inline-block" /> Đã trả lời
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="w-3 h-3 rounded bg-slate-200 inline-block" /> Chưa trả lời
            </div>
          </div>
        </div>

        {/* Nộp bài */}
        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-3 bg-[#2563EB] text-white rounded-2xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 shadow">
          {submitting ? 'Đang nộp...' : 'Nộp bài'}
        </button>
      </aside>

      {/* Content chính */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-[#334155]">{exam.title}</h1>
            <p className="text-xs text-[#64748B]">{answered}/{questions.length} câu đã trả lời</p>
          </div>
          {timeLeft !== null && (
            <div className={`font-mono font-bold px-3 py-1.5 rounded-xl text-sm ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-[#334155]'}`}>
              ⏱ {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Mobile navigator — hàng ngang cuộn */}
        <div className="md:hidden flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {questions.map((q, i) => (
            <button key={q.id} onClick={() => scrollToQuestion(i)}
              className={`shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                isAnswered(q.id) ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#64748B]'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-[#2563EB] rounded-full transition-all" style={{ width: `${questions.length > 0 ? answered / questions.length * 100 : 0}%` }} />
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={q.id} ref={el => { questionRefs.current[i] = el }}
              className="bg-white border border-[#E2E8F0] rounded-2xl p-5 scroll-mt-4">
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 transition-colors ${
                  isAnswered(q.id) ? 'bg-[#2563EB] text-white' : 'bg-blue-50 text-[#2563EB]'
                }`}>{i+1}</span>
                <p className="font-medium text-[#334155]">{q.question}</p>
                <span className="ml-auto text-xs text-[#94A3B8] shrink-0">{q.points}đ</span>
              </div>

              {(q.type === 'MULTIPLE_CHOICE') && (() => {
                const opts = q.data.options as string[] ?? []
                return (
                  <div className="space-y-2">
                    {opts.map(opt => (
                      <button key={opt} onClick={() => setAnswer(q.id, opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${answers[q.id] === opt ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-medium' : 'border-[#E2E8F0] hover:border-blue-200 hover:bg-slate-50'}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )
              })()}

              {(q.type === 'MULTIPLE_CHOICE_PARTIAL' || q.type === 'MULTIPLE_CHOICE_ALL') && (() => {
                const opts = q.data.options as string[] ?? []
                const sel = (answers[q.id] as string[] | undefined) ?? []
                return (
                  <div className="space-y-2">
                    <p className="text-xs text-[#64748B] mb-2">{q.type === 'MULTIPLE_CHOICE_PARTIAL' ? 'Chọn tất cả đáp án đúng (điểm tỉ lệ)' : 'Phải chọn đúng và đủ tất cả đáp án'}</p>
                    {opts.map(opt => (
                      <button key={opt} onClick={() => toggleMultiAnswer(q.id, opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${sel.includes(opt) ? 'border-[#2563EB] bg-blue-50 text-[#2563EB] font-medium' : 'border-[#E2E8F0] hover:border-blue-200 hover:bg-slate-50'}`}>
                        <span className={`inline-block w-4 h-4 rounded border mr-2 align-middle ${sel.includes(opt) ? 'bg-[#2563EB] border-[#2563EB]' : 'border-[#CBD5E1]'}`} />
                        {opt}
                      </button>
                    ))}
                  </div>
                )
              })()}

              {q.type === 'FILL_BLANK' && (
                <input value={(answers[q.id] as string) ?? ''} onChange={e => setAnswer(q.id, e.target.value)}
                  placeholder="Nhập câu trả lời..."
                  className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB]" />
              )}

              {q.type === 'DICTATION' && (() => {
                const audioText = String((q.data as Record<string, unknown>).audio_text ?? q.data.answer ?? q.question)
                return (
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => speak(audioText, { rate: 0.85 })}
                        className="w-16 h-16 rounded-full bg-[#2563EB] text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg active:scale-95"
                        title="Nghe câu"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
                          <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-center text-[#64748B]">Bấm để nghe rồi gõ lại</p>
                    <input value={(answers[q.id] as string) ?? ''} onChange={e => setAnswer(q.id, e.target.value)}
                      placeholder="Gõ những gì bạn nghe được..."
                      className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB]" />
                  </div>
                )
              })()}

              {q.type === 'SORT_WORDS' && (() => {
                const words = q.data.words as string[] ?? []
                return (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {words.map((w, wi) => <span key={wi} className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-[#334155]">{w}</span>)}
                    </div>
                    <input value={(answers[q.id] as string) ?? ''} onChange={e => setAnswer(q.id, e.target.value)}
                      placeholder="Gõ câu hoàn chỉnh..."
                      className="w-full border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2563EB]" />
                  </div>
                )
              })()}

              {q.type === 'FLASHCARD' && (() => {
                const front = String(q.data.front ?? q.question)
                const back = String(q.data.back ?? '')
                return (
                  <div className="space-y-3">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="font-bold text-[#334155]">{front}</p>
                      <p className="text-sm text-[#64748B] mt-1">{back}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setAnswer(q.id, 'known')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors border-2 ${answers[q.id] === 'known' ? 'border-green-500 bg-green-50 text-green-600' : 'border-[#E2E8F0] text-[#64748B] hover:border-green-300'}`}>
                        ✓ Đã biết
                      </button>
                      <button onClick={() => setAnswer(q.id, 'unknown')}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors border-2 ${answers[q.id] === 'unknown' ? 'border-red-400 bg-red-50 text-red-500' : 'border-[#E2E8F0] text-[#64748B] hover:border-red-300'}`}>
                        ✗ Chưa biết
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          ))}
        </div>

        {/* Mobile submit button */}
        <div className="md:hidden sticky bottom-4 mt-8">
          <button onClick={handleSubmit} disabled={submitting}
            className="w-full py-4 bg-[#2563EB] text-white rounded-2xl font-bold text-base hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg">
            {submitting ? 'Đang nộp bài...' : `Nộp bài (${answered}/${questions.length} câu)`}
          </button>
        </div>
      </div>
    </div>
  )
}
