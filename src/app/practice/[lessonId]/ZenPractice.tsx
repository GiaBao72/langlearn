'use client'

import { useState, useEffect, useCallback } from 'react'
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
        className="w-80 h-48 mx-auto mb-8 cursor-pointer bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl font-medium hover:border-[#FFB000]/40 transition-all select-none"
      >
        {flipped ? String(data.back) : String(data.front)}
      </div>
      <p className="text-white/40 text-sm mb-8">{flipped ? 'Lật lại' : 'Bấm để xem nghĩa'}</p>
      {flipped && (
        <div className="flex gap-4 justify-center">
          <button onClick={() => onAnswer(false)} className="px-8 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
            Chưa nhớ
          </button>
          <button onClick={() => onAnswer(true)} className="px-8 py-3 rounded-xl border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors">
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
      <p className="text-xl mb-8 text-white/90 leading-relaxed">{question}</p>
      <input
        autoFocus
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !submitted && submit()}
        disabled={submitted}
        placeholder="Điền vào đây..."
        className={`w-full text-center text-xl bg-white/5 border rounded-xl px-6 py-4 focus:outline-none transition-colors ${
          submitted ? (correct ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400') : 'border-white/10 focus:border-[#FFB000]'
        }`}
      />
      {submitted && (
        <p className="mt-4 text-sm text-white/50">
          {correct ? '🎉 Chính xác!' : `Đáp án: ${String(data.answer)}`}
        </p>
      )}
      {!submitted && (
        <button onClick={submit} className="mt-6 px-8 py-3 bg-[#FFB000] text-black rounded-xl font-semibold hover:bg-[#FFB000]/90 transition-colors">
          Kiểm tra (Enter)
        </button>
      )}
    </div>
  )
}

function MultipleChoice({ question, data, onAnswer }: { question: string; data: Record<string, unknown>; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const options = data.options as string[]
  const correctIdx = data.correctIndex as number

  function pick(idx: number) {
    if (selected !== null) return
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
  })

  return (
    <div className="max-w-lg mx-auto">
      <p className="text-xl mb-8 text-white/90 text-center leading-relaxed">{question}</p>
      <div className="space-y-3">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
              selected === null
                ? 'border-white/10 hover:border-[#FFB000]/40 hover:bg-white/5'
                : selected === i
                  ? i === correctIdx ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-red-500 bg-red-500/10 text-red-400'
                  : i === correctIdx && selected !== null ? 'border-green-500/50 text-green-400/70' : 'border-white/5 opacity-40'
            }`}
          >
            <span className="text-white/30 mr-3">{i + 1}.</span> {opt}
          </button>
        ))}
      </div>
      <p className="text-center text-white/30 text-xs mt-4">Bấm phím 1–{options.length} để chọn</p>
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
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">{pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'}</div>
          <h2 className="text-3xl font-bold mb-2">{pct}% chính xác</h2>
          <p className="text-white/40 mb-8">{score}/{total} điểm · {exercises.length} bài tập</p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => { setCurrent(0); setScore(0); setDone(false) }} className="px-6 py-3 border border-white/20 rounded-xl hover:bg-white/5 transition-colors">
              Làm lại
            </button>
            <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-[#FFB000] text-black rounded-xl font-semibold hover:bg-[#FFB000]/90 transition-colors">
              Về Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const ex = exercises[current]

  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <button onClick={() => router.back()} className="text-white/30 hover:text-white/60 text-sm transition-colors">
          ← Thoát
        </button>
        <span className="text-white/40 text-sm">{lessonTitle}</span>
        <span className="text-white/30 text-sm">{current + 1}/{exercises.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-white/5">
        <div
          className="h-full bg-[#FFB000] transition-all duration-500"
          style={{ width: `${((current + 1) / exercises.length) * 100}%` }}
        />
      </div>

      {/* Exercise */}
      <div className={`flex-1 flex items-center justify-center px-6 transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="w-full max-w-2xl">
          {ex.type === 'FLASHCARD' && <FlashCard data={ex.data} onAnswer={handleAnswer} />}
          {ex.type === 'FILL_BLANK' && <FillBlank question={ex.question} data={ex.data} onAnswer={handleAnswer} />}
          {ex.type === 'MULTIPLE_CHOICE' && <MultipleChoice question={ex.question} data={ex.data} onAnswer={handleAnswer} />}
        </div>
      </div>
    </div>
  )
}
