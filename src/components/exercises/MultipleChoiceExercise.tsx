'use client'

import { useState } from 'react'

interface MultipleChoiceData {
  options: string[]
  answer: string
  explanation?: string
  notes?: string[]   // ghi chú per-option, index tương ứng options gốc
}

interface Props {
  imageUrl?: string | null
  question: string
  data: Record<string, unknown>
  value: string
  onChange: (val: string) => void
  submitted: boolean
  correct: boolean
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

function shuffleArray<T>(arr: T[], seed?: number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MultipleChoiceExercise({ question, data, value, onChange, submitted, correct: _correct, imageUrl}: Props) {
  const d = data as unknown as MultipleChoiceData

  // Shuffle options + map notes theo cùng thứ tự
  const [shuffled] = useState<{ opt: string; note: string }[]>(() => {
    const pairs = d.options.map((opt, i) => ({ opt, note: d.notes?.[i] ?? '' }))
    const a = [...pairs]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  })

  function getStyle(opt: string) {
    if (!submitted) {
      return value === opt
        ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
        : 'border-[#E2E8F0] bg-white text-[#334155] hover:border-blue-300 hover:bg-blue-50'
    }
    if (opt === d.answer) return 'border-[#10B981] bg-green-50 text-[#10B981]'
    if (opt === value && opt !== d.answer) return 'border-[#EF4444] bg-red-50 text-[#EF4444]'
    return 'border-[#E2E8F0] bg-slate-50 text-[#94A3B8]'
  }

  function getNoteStyle(opt: string) {
    if (opt === d.answer) return 'text-green-700 bg-green-50 border-green-200'
    if (opt === value && opt !== d.answer) return 'text-red-700 bg-red-50 border-red-200'
    return 'text-[#64748B] bg-slate-50 border-slate-200'
  }

  return (
    <div className="max-w-lg mx-auto">
      {imageUrl && (
    <div className="mb-4 flex justify-center">
      <img
        src={imageUrl}
        alt="Hình minh hoạ"
        className="max-h-48 max-w-full rounded-xl object-contain border border-[#E2E8F0]"
      />
    </div>
  )}
      <p className="text-xl font-semibold text-[#334155] mb-6 text-center leading-relaxed">
        {question}
      </p>

      <div className="space-y-3">
        {shuffled.map(({ opt, note }, i) => (
          <div key={opt}>
            <button
              onClick={() => !submitted && onChange(opt)}
              disabled={submitted}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium shadow-sm flex items-center gap-3 ${getStyle(opt)}`}
            >
              <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                {LABELS[i]}
              </span>
              <span className="flex-1">{opt}</span>
              {submitted && opt === d.answer && <span className="ml-auto">✓</span>}
              {submitted && opt === value && opt !== d.answer && <span className="ml-auto">✗</span>}
            </button>

            {/* Note: hiển thị khi submitted HOẶC khi đang chọn option này */}
            {note && (submitted ? (opt === value || opt === d.answer) : value === opt) && (
              <div className={`mt-1 mx-1 px-4 py-2 rounded-lg border text-xs leading-relaxed ${getNoteStyle(opt)}`}>
                💬 {note}
              </div>
            )}
          </div>
        ))}
      </div>

      {submitted && d.explanation && (
        <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-[#2563EB] font-medium mb-1">Giải thích:</p>
          <p className="text-sm text-[#334155]">{d.explanation}</p>
        </div>
      )}

      {!submitted && (
        <p className="text-center text-[#64748B] text-xs mt-5">Chọn một đáp án</p>
      )}
    </div>
  )
}
