'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

type ExerciseType = 'FLASHCARD' | 'FILL_BLANK' | 'MULTIPLE_CHOICE' | 'DICTATION' | 'SORT_WORDS'

interface Exercise {
  id: string
  type: ExerciseType
  question: string
  data: Record<string, unknown>
  points: number
}

interface Props {
  exercises: Exercise[]
  lessonId: string
  lessonTitle: string
}

function FlashCard({ data, onAnswer }: { data: Record<string, unknown>; onAnswer: (correct: boolean) => void }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <div className="text-center">
      <div
        onClick={() => setFlipped(!flipped)}
        className="w-80 h-48 mx-auto mb-8 cursor-pointer bg-white border-2 border-[#E2E8F0] rounded-2xl flex items-center justify-center text-2xl font-semibold text-[#334155] hover:border-blue-400 hover:shadow-lg transition-all select-none shadow-sm"
      >
        {flipped ? String(data.back) : String(data.front)}
      </div>
      <p className="text-[#64748B] text-sm mb-8">{flipped ? 'Lật lại' : 'Bấm để xem nghĩa'}</p>
      {flipped && (
        <div className="flex gap-4 justify-center">
          <button onClick={() => onAnswer(false)} className="px-8 py-3 rounded-xl border-2 border-red-200 text-red-500 bg-red-50 hover:bg-red-100 font-medium transition-colors">
            Chưa nhớ
          </button>
          <button onClick={() => onAnswer(true)} className="px-8 py-3 rounded-xl border-2 border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 font-medium transition-colors">
            Đã nhớ ✓
          </button>
        </div>
      )}
    </div>
  )
}

function FillBlank({ question, data, onAnswer }: { question: string; data: Record<string, unknown>; onAnswer: (correct: boolean) => void }) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const correct = input.trim().toLowerCase() === String(data.answer).toLowerCase()

  function submit() {
    if (!input.trim()) return
    setSubmitted(true)
    setTimeout(() => onAnswer(correct), 1200)
  }

  return (
    <div className="text-center max-w-lg mx-auto">
      <p className="text-2xl mb-8 text-[#334155] font-medium leading-relaxed">{question}</p>
      <input
        autoFocus
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !submitted && submit()}
        disabled={submitted}
        placeholder="Điền vào đây..."
        className={`w-full text-center text-xl bg-white border-2 rounded-xl px-6 py-4 focus:outline-none transition-all shadow-sm ${
          submitted
            ? correct
              ? 'border-emerald-400 text-emerald-600 bg-emerald-50'
              : 'border-red-400 text-red-600 bg-red-50'
            : 'border-[#E2E8F0] focus:border-blue-400 text-[#334155]'
        }`}
      />
      {submitted && (
        <p className="mt-4 text-sm text-[#64748B]">
          {correct ? '🎉 Chính xác!' : `Đáp án đúng: ${String(data.answer)}`}
        </p>
      )}
      {!submitted && (
        <button onClick={submit} className="mt-6 px-8 py-3 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          Kiểm tra (Enter)
        </button>
      )}
    </div>
  )
}

function MultipleChoice({ question, data, onAnswer }: { question: string; data: Record<string, unknown>; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const selectedRef = useRef<number | null>(null)
  const options = data.options as string[]
  const answer = data.answer as string
  const correctIdx = options.indexOf(answer)

  function pick(idx: number) {
    if (selectedRef.current !== null) return
    selectedRef.current = idx
    setSelected(idx)
    setTimeout(() => onAnswer(idx === correctIdx), 1000)
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const n = parseInt(e.key)
      if (n >= 1 && n <= options.length) pick(n - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-lg mx-auto">
      <p className="text-2xl mb-8 text-[#334155] font-semibold text-center leading-relaxed">{question}</p>
      <div className="space-y-3">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium ${
              selected === null
                ? 'border-[#E2E8F0] bg-white hover:border-blue-400 hover:bg-blue-50 text-[#334155] shadow-sm'
                : selected === i
                  ? i === correctIdx
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-red-400 bg-red-50 text-red-700'
                  : i === correctIdx && selected !== null
                    ? 'border-emerald-300 bg-emerald-50/60 text-emerald-600'
                    : 'border-[#E2E8F0] bg-slate-50 text-[#64748B] opacity-60'
            }`}
          >
            <span className="text-[#64748B] font-normal mr-3">{i + 1}.</span> {opt}
          </button>
        ))}
      </div>
      <p className="text-center text-[#64748B] text-xs mt-5">Bấm phím 1–{options.length} để chọn</p>
    </div>
  )
}

export default function ZenPractice({ exercises, lessonTitle }: Props) {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const handleAnswer = useCallback((correct: boolean) => {
    if (correct) setScore(s => s + exercises[current].points)
    setTransitioning(true)
    setTimeout(() => {
      if (current + 1 >= exercises.length) {
        setDone(true)
      } else {
        setCurrent(c => c + 1)
      }
      setTransitioning(false)
    }, 300)
  }, [current, exercises])

  if (done) {
    const total = exercises.reduce((s, e) => s + e.points, 0)
    const pct = Math.round((score / total) * 100)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-12 max-w-sm w-full mx-4">
          <div className="text-6xl mb-5">{pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'}</div>
          <h2 className="text-3xl font-bold mb-1 text-[#334155]">{pct}%</h2>
          <p className="text-[#64748B] mb-2 text-sm">chính xác</p>
          <p className="text-[#64748B] text-sm mb-8">{score}/{total} điểm · {exercises.length} bài tập</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setCurrent(0); setScore(0); setDone(false) }}
              className="px-5 py-2.5 border-2 border-[#E2E8F0] rounded-xl text-[#334155] hover:bg-slate-50 font-medium transition-colors text-sm"
            >
              Làm lại
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-5 py-2.5 bg-[#2563EB] text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm shadow-sm"
            >
              Về Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const ex = exercises[current]
  const pct = ((current) / exercises.length) * 100

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-[#E2E8F0]">
        <button onClick={() => router.back()} className="text-[#64748B] hover:text-[#334155] text-sm transition-colors flex items-center gap-1">
          ← Thoát
        </button>
        <span className="text-[#334155] text-sm font-medium">{lessonTitle}</span>
        <span className="text-[#64748B] text-sm">{current + 1}<span className="text-[#64748B]">/</span>{exercises.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-blue-500 transition-all duration-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Exercise */}
      <div className={`flex-1 flex items-center justify-center px-6 py-12 transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-full max-w-2xl">
          {ex.type === 'FLASHCARD' && <FlashCard data={ex.data} onAnswer={handleAnswer} />}
          {ex.type === 'FILL_BLANK' && <FillBlank question={ex.question} data={ex.data} onAnswer={handleAnswer} />}
          {ex.type === 'MULTIPLE_CHOICE' && <MultipleChoice question={ex.question} data={ex.data} onAnswer={handleAnswer} />}
        </div>
      </div>
    </div>
  )
}
