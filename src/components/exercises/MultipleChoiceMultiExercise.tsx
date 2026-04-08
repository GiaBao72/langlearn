'use client'

import { useState } from 'react'

interface MultipleChoiceMultiData {
  options: string[]
  answers: string[]
  explanation?: string
  notes?: string[]   // ghi chú per-option, index tương ứng options gốc
}

interface Props {
  question: string
  data: Record<string, unknown>
  value: string
  onChange: (val: string) => void
  submitted: boolean
  correct: boolean
  scoreMode: 'partial' | 'all'
}

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F']

export default function MultipleChoiceMultiExercise({
  question, data, value, onChange, submitted, scoreMode,
}: Props) {
  const d = data as unknown as MultipleChoiceMultiData
  const correctSet = new Set(d.answers)

  const [shuffled] = useState<{ opt: string; note: string }[]>(() => {
    const pairs = d.options.map((opt, i) => ({ opt, note: d.notes?.[i] ?? '' }))
    const a = [...pairs]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  })

  let selected: string[] = []
  try { selected = JSON.parse(value) } catch { selected = [] }
  const selectedSet = new Set(selected)

  function toggle(opt: string) {
    if (submitted) return
    const next = new Set(selectedSet)
    next.has(opt) ? next.delete(opt) : next.add(opt)
    onChange(JSON.stringify([...next]))
  }

  function getStyle(opt: string) {
    if (!submitted) {
      return selectedSet.has(opt)
        ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
        : 'border-[#E2E8F0] bg-white text-[#334155] hover:border-blue-300 hover:bg-blue-50'
    }
    const isCorrectOpt = correctSet.has(opt)
    const isSelected = selectedSet.has(opt)
    if (isCorrectOpt && isSelected) return 'border-[#10B981] bg-green-50 text-[#10B981]'
    if (isCorrectOpt && !isSelected) return 'border-[#10B981] bg-green-50/50 text-[#10B981] opacity-80'
    if (!isCorrectOpt && isSelected) return 'border-[#EF4444] bg-red-50 text-[#EF4444]'
    return 'border-[#E2E8F0] bg-slate-50 text-[#64748B] opacity-50'
  }

  function getNoteStyle(opt: string) {
    if (correctSet.has(opt)) return 'text-green-700 bg-green-50 border-green-200'
    if (selectedSet.has(opt)) return 'text-red-700 bg-red-50 border-red-200'
    return 'text-[#64748B] bg-slate-50 border-slate-200'
  }

  function getScoreLabel(): string {
    if (scoreMode === 'all') {
      const allCorrect = d.answers.every(a => selectedSet.has(a)) && selected.length === d.answers.length
      return allCorrect ? '✅ Toàn bộ đáp án đúng!' : '❌ Chưa đủ / sai đáp án'
    }
    const correctSelected = selected.filter(s => correctSet.has(s)).length
    const wrongSelected = selected.filter(s => !correctSet.has(s)).length
    const net = Math.max(0, correctSelected - wrongSelected)
    const pct = d.answers.length > 0 ? net / d.answers.length : 0
    if (pct === 1) return `✅ Hoàn hảo!`
    if (pct > 0) return `⚡ Đúng ${correctSelected}/${d.answers.length} đáp án`
    return `❌ Chưa đúng`
  }

  // Show note khi: đang chọn option đó (before submit), hoặc sau submit nếu là đáp án đúng/đã chọn
  function shouldShowNote(opt: string): boolean {
    if (!submitted) return selectedSet.has(opt)
    return selectedSet.has(opt) || correctSet.has(opt)
  }

  return (
    <div className="max-w-lg mx-auto">
      <p className="text-xl font-semibold text-[#334155] mb-2 text-center leading-relaxed">
        {question}
      </p>
      <p className="text-xs text-center text-[#64748B] mb-5">
        {scoreMode === 'partial'
          ? `Chọn ${d.answers.length} đáp án đúng — điểm theo tỉ lệ`
          : `Chọn đầy đủ ${d.answers.length} đáp án đúng để được toàn bộ điểm`}
      </p>

      <div className="space-y-3">
        {shuffled.map(({ opt, note }, i) => (
          <div key={opt}>
            <button
              onClick={() => toggle(opt)}
              disabled={submitted}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all font-medium shadow-sm flex items-center gap-3 ${getStyle(opt)}`}
            >
              <span className={`w-7 h-7 rounded-md border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0 ${selectedSet.has(opt) ? 'bg-current' : ''}`}>
                {selectedSet.has(opt) && <span className="text-white">✓</span>}
                {!selectedSet.has(opt) && <span className="opacity-0">·</span>}
              </span>
              <span className="flex-1">{opt}</span>
              <span className="text-xs text-current opacity-60 shrink-0">{LABELS[i]}</span>
              {submitted && correctSet.has(opt) && <span className="ml-1">✓</span>}
              {submitted && !correctSet.has(opt) && selectedSet.has(opt) && <span className="ml-1">✗</span>}
            </button>

            {/* Note per option */}
            {note && shouldShowNote(opt) && (
              <div className={`mt-1 mx-1 px-4 py-2 rounded-lg border text-xs leading-relaxed ${getNoteStyle(opt)}`}>
                💬 {note}
              </div>
            )}
          </div>
        ))}
      </div>

      {submitted && (
        <div className="mt-4 p-3 rounded-xl border bg-slate-50 border-slate-200 text-center">
          <p className="text-sm font-semibold text-[#334155]">{getScoreLabel()}</p>
          {d.answers.length > 0 && (
            <p className="text-xs text-[#64748B] mt-1">
              Đáp án đúng: <span className="font-medium">{d.answers.join(', ')}</span>
            </p>
          )}
        </div>
      )}

      {submitted && d.explanation && (
        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-[#2563EB] font-medium mb-1">Giải thích:</p>
          <p className="text-sm text-[#334155]">{d.explanation}</p>
        </div>
      )}

      {!submitted && (
        <p className="text-center text-[#64748B] text-xs mt-5">
          Đang chọn: <strong>{selected.length}</strong> / {d.answers.length} đáp án cần chọn
        </p>
      )}
    </div>
  )
}
